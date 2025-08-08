import { ValidationError, ValidationIssue, RefinementCtx } from '../types/base';
import { ErrorCode, getParsedType, defaultErrorMap, ErrorMapCtx } from '../types/errors';

export interface ParseContext extends RefinementCtx {
  common: {
    issues: ValidationIssue[];
    async: boolean;
    errorMap: typeof defaultErrorMap;
    contextualErrorMap?: typeof defaultErrorMap;
  };
  parsedType: ReturnType<typeof getParsedType>;
  schemaErrorMap?: typeof defaultErrorMap;
  parent?: any;
  data: any;
  child(key: string | number, data: any): ParseContext;
  makeError(): ValidationError;
  hasIssues: boolean;
}

export class ParseContextImpl implements ParseContext {
  common: ParseContext['common'];
  path: (string | number)[];
  parsedType: ReturnType<typeof getParsedType>;
  schemaErrorMap?: typeof defaultErrorMap;
  parent?: any;
  data: any;

  constructor(
    data: any,
    path: (string | number)[] = [],
    parent?: any,
    errorMap: typeof defaultErrorMap = defaultErrorMap,
    async = false
  ) {
    this.data = data;
    this.path = path;
    this.parent = parent;
    this.parsedType = getParsedType(data);
    this.common = {
      issues: [],
      async,
      errorMap,
      contextualErrorMap: undefined
    };
  }

  addIssue(issue: Omit<ValidationIssue, 'path'>): void {
    const fullIssue: ValidationIssue = {
      ...issue,
      path: this.path
    };

    if (!fullIssue.message) {
      const errorMapCtx: ErrorMapCtx = {
        code: issue.code as ErrorCode,
        path: this.path,
        input: this.data,
        expected: issue.expected,
        received: issue.received,
        options: issue.options,
        message: issue.message
      };

      const customError = 
        this.common.contextualErrorMap?.(errorMapCtx) ||
        this.schemaErrorMap?.(errorMapCtx) ||
        this.common.errorMap(errorMapCtx);

      fullIssue.message = customError;
    }

    this.common.issues.push(fullIssue);
  }

  clone(data?: any, path?: (string | number)[]): ParseContext {
    const cloned = new ParseContextImpl(
      data !== undefined ? data : this.data,
      path !== undefined ? path : this.path,
      this.parent,
      this.common.errorMap,
      this.common.async
    );
    cloned.common = this.common;
    cloned.schemaErrorMap = this.schemaErrorMap;
    return cloned;
  }

  child(key: string | number, data: any): ParseContext {
    return this.clone(data, [...this.path, key]);
  }

  setAsync(): void {
    this.common.async = true;
  }

  get hasIssues(): boolean {
    return this.common.issues.length > 0;
  }

  get issues(): ValidationIssue[] {
    return this.common.issues;
  }

  makeError(): ValidationError {
    return new ValidationError(this.common.issues);
  }
}

export type ParseInput = {
  data: any;
  path?: (string | number)[];
  parent?: any;
  errorMap?: typeof defaultErrorMap;
  async?: boolean;
};

export type ParseReturnType<T> = 
  | { status: 'ok'; value: T }
  | { status: 'error'; error: ValidationError };

export type ParsePathComponent = string | number;

export function createParser<T>(
  parseFunction: (data: any, ctx: ParseContext) => T
) {
  return (input: ParseInput): ParseReturnType<T> => {
    const ctx = new ParseContextImpl(
      input.data,
      input.path,
      input.parent,
      input.errorMap,
      input.async
    );

    try {
      const result = parseFunction(input.data, ctx);
      
      if (ctx.hasIssues) {
        return { status: 'error', error: ctx.makeError() };
      }
      
      return { status: 'ok', value: result };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { status: 'error', error };
      }
      
      ctx.addIssue({
        code: ErrorCode.CUSTOM,
        message: error instanceof Error ? error.message : String(error)
      });
      
      return { status: 'error', error: ctx.makeError() };
    }
  };
}

export async function createAsyncParser<T>(
  parseFunction: (data: any, ctx: ParseContext) => Promise<T>
) {
  return async (input: ParseInput): Promise<ParseReturnType<T>> => {
    const ctx = new ParseContextImpl(
      input.data,
      input.path,
      input.parent,
      input.errorMap,
      true
    );

    try {
      const result = await parseFunction(input.data, ctx);
      
      if (ctx.hasIssues) {
        return { status: 'error', error: ctx.makeError() };
      }
      
      return { status: 'ok', value: result };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { status: 'error', error };
      }
      
      ctx.addIssue({
        code: ErrorCode.CUSTOM,
        message: error instanceof Error ? error.message : String(error)
      });
      
      return { status: 'error', error: ctx.makeError() };
    }
  };
}

export function mergeResults<T>(
  results: ParseReturnType<T>[]
): ParseReturnType<T[]> {
  const values: T[] = [];
  const issues: ValidationIssue[] = [];

  for (const result of results) {
    if (result.status === 'error') {
      issues.push(...result.error.issues);
    } else {
      values.push(result.value);
    }
  }

  if (issues.length > 0) {
    return { status: 'error', error: new ValidationError(issues) };
  }

  return { status: 'ok', value: values };
}