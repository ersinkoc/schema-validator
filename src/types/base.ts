import { getParsedType } from './errors';

export type ParseResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ValidationError };

export type AsyncParseResult<T> = Promise<ParseResult<T>>;

export interface ValidationIssue {
  code: string;
  message?: string;
  path: (string | number)[];
  expected?: string;
  received?: string;
  options?: Record<string, unknown>;
}

export class ValidationError extends Error {
  public readonly issues: ValidationIssue[];
  public readonly path: (string | number)[];
  public readonly code: string;
  public readonly expected?: string;
  public readonly received?: string;

  constructor(issues: ValidationIssue | ValidationIssue[]) {
    const issuesArray = Array.isArray(issues) ? issues : [issues];
    const firstIssue = issuesArray[0];
    
    super(firstIssue?.message || 'Validation error');
    
    this.name = 'ValidationError';
    this.issues = issuesArray;
    this.path = firstIssue?.path || [];
    this.code = firstIssue?.code || 'validation_error';
    this.expected = firstIssue?.expected;
    this.received = firstIssue?.received;
  }

  format(): string {
    return this.issues
      .map(issue => {
        const pathStr = issue.path.length > 0 ? `[${issue.path.join('.')}] ` : '';
        return `${pathStr}${issue.message}`;
      })
      .join('\n');
  }
}

export interface SchemaDefinition<Input = any, Output = Input> {
  _input: Input;
  _output: Output;
  _type: string;
  parse(data: unknown): Output;
  parseAsync(data: unknown): Promise<Output>;
  safeParse(data: unknown): ParseResult<Output>;
  safeParseAsync(data: unknown): AsyncParseResult<Output>;
  optional(): SchemaDefinition<Input | undefined, Output | undefined>;
  nullable(): SchemaDefinition<Input | null, Output | null>;
  nullish(): SchemaDefinition<Input | null | undefined, Output | null | undefined>;
  array(): SchemaDefinition<Input[], Output[]>;
  promise(): SchemaDefinition<Promise<Input>, Promise<Output>>;
  or<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<Input | T, Output | T>;
  and<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<Input & T, Output & T>;
  transform<NewOutput>(fn: (value: Output) => NewOutput): SchemaDefinition<Input, NewOutput>;
  default(value: Output | (() => Output)): SchemaDefinition<Input | undefined, Output>;
  catch(value: Output | ((error: ValidationError) => Output)): SchemaDefinition<Input, Output>;
  refine(check: (value: Output) => boolean | Promise<boolean>, message?: string | ValidationIssue): SchemaDefinition<Input, Output>;
  superRefine<Ctx extends { addIssue: (issue: ValidationIssue) => void }>(
    check: (value: Output, ctx: Ctx) => void | Promise<void>
  ): SchemaDefinition<Input, Output>;
  describe(description: string): SchemaDefinition<Input, Output>;
  brand<B extends string | symbol>(): SchemaDefinition<Input, Output & { [brand]: B }>;
  readonly(): SchemaDefinition<Input, Output>;
  isOptional(): boolean;
  isNullable(): boolean;
  isNullish(): boolean;
}

export const brand = Symbol('brand');

export type RefinementCtx = {
  addIssue: (issue: Omit<ValidationIssue, 'path'>) => void;
  path: (string | number)[];
};

export type ValidatorFunction<T = any> = (value: unknown, ctx: RefinementCtx) => T;
export type AsyncValidatorFunction<T = any> = (value: unknown, ctx: RefinementCtx) => Promise<T>;
export type TransformFunction<T = any, U = any> = (value: T) => U;

export interface SchemaOptions {
  errorMap?: (issue: ValidationIssue) => string;
  description?: string;
  strict?: boolean;
  coerce?: boolean;
}

export abstract class BaseSchema<Input = any, Output = Input> implements SchemaDefinition<Input, Output> {
  readonly _input!: Input;
  readonly _output!: Output;
  abstract readonly _type: string;
  
  protected _options: SchemaOptions;
  protected _checks: Array<any> = [];
  protected _transforms: Array<TransformFunction> = [];
  protected _isOptional = false;
  protected _isNullable = false;
  protected _default?: Output | (() => Output);
  protected _catch?: Output | ((error: ValidationError) => Output);
  protected _description?: string;

  constructor(options: SchemaOptions = {}) {
    this._options = options;
  }

  abstract _parse(input: unknown, ctx: any): Output;
  abstract _parseAsync(input: unknown, ctx: any): Promise<Output>;
  
  protected _processModifiers(data: unknown, _ctx: RefinementCtx): unknown {
    // Handle optional
    if (this._isOptional && data === undefined) {
      if (this._default !== undefined) {
        return typeof this._default === 'function' ? (this._default as () => Output)() : this._default;
      }
      return undefined;
    }
    
    // Handle nullable
    if (this._isNullable && data === null) {
      return null;
    }
    
    // Handle default for undefined values
    if (data === undefined && this._default !== undefined) {
      return typeof this._default === 'function' ? (this._default as () => Output)() : this._default;
    }
    
    return data;
  }

  parse(data: unknown): Output {
    const result = this.safeParse(data);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  async parseAsync(data: unknown): Promise<Output> {
    const result = await this.safeParseAsync(data);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  safeParse(data: unknown): ParseResult<Output> {
    try {
      // Create a minimal context inline to avoid circular dependency
      const issues: ValidationIssue[] = [];
      const ctx: any = {
        addIssue: (issue: Omit<ValidationIssue, 'path'>) => {
          issues.push({ ...issue, path: ctx.path });
        },
        path: [],
        data,
        parsedType: getParsedType(data),
        common: { issues, async: false },
        hasIssues: false,
        makeError: () => new ValidationError(issues),
        child: (key: string | number, childData: any) => {
          const childCtx = Object.create(ctx);
          childCtx.path = [...ctx.path, key];
          childCtx.data = childData;
          childCtx.parsedType = getParsedType(childData);
          // Override addIssue to use the child's path
          childCtx.addIssue = (issue: Omit<ValidationIssue, 'path'>) => {
            issues.push({ ...issue, path: childCtx.path });
          };
          return childCtx;
        },
        clone: (cloneData?: any, clonePath?: (string | number)[]) => {
          const clonedCtx = Object.create(ctx);
          clonedCtx.data = cloneData !== undefined ? cloneData : ctx.data;
          clonedCtx.path = clonePath !== undefined ? clonePath : ctx.path;
          clonedCtx.parsedType = getParsedType(clonedCtx.data);
          return clonedCtx;
        }
      };
      Object.defineProperty(ctx, 'hasIssues', {
        get: () => issues.length > 0
      });
      Object.defineProperty(ctx, 'issues', {
        get: () => issues
      });

      // Process modifiers first
      const processedData = this._processModifiers(data, ctx);
      
      // If data became undefined/null after processing and that's allowed, return it
      if ((this._isOptional && processedData === undefined) || 
          (this._isNullable && processedData === null)) {
        return { success: true, data: processedData as Output };
      }
      
      const result = this._parse(processedData, ctx);
      
      if (ctx.hasIssues) {
        return { success: false, error: ctx.makeError() };
      }
      
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error };
      }
      return { 
        success: false, 
        error: new ValidationError({
          code: 'custom',
          message: error instanceof Error ? error.message : String(error),
          path: []
        })
      };
    }
  }

  async safeParseAsync(data: unknown): AsyncParseResult<Output> {
    try {
      // Create a minimal context inline to avoid circular dependency
      const issues: ValidationIssue[] = [];
      const ctx: any = {
        addIssue: (issue: Omit<ValidationIssue, 'path'>) => {
          issues.push({ ...issue, path: ctx.path });
        },
        path: [],
        data,
        parsedType: getParsedType(data),
        common: { issues, async: true },
        hasIssues: false,
        makeError: () => new ValidationError(issues),
        child: (key: string | number, childData: any) => {
          const childCtx = Object.create(ctx);
          childCtx.path = [...ctx.path, key];
          childCtx.data = childData;
          childCtx.parsedType = getParsedType(childData);
          // Override addIssue to use the child's path
          childCtx.addIssue = (issue: Omit<ValidationIssue, 'path'>) => {
            issues.push({ ...issue, path: childCtx.path });
          };
          return childCtx;
        },
        clone: (cloneData?: any, clonePath?: (string | number)[]) => {
          const clonedCtx = Object.create(ctx);
          clonedCtx.data = cloneData !== undefined ? cloneData : ctx.data;
          clonedCtx.path = clonePath !== undefined ? clonePath : ctx.path;
          clonedCtx.parsedType = getParsedType(clonedCtx.data);
          return clonedCtx;
        }
      };
      Object.defineProperty(ctx, 'hasIssues', {
        get: () => issues.length > 0
      });
      Object.defineProperty(ctx, 'issues', {
        get: () => issues
      });

      // Process modifiers first
      const processedData = this._processModifiers(data, ctx);
      
      // If data became undefined/null after processing and that's allowed, return it
      if ((this._isOptional && processedData === undefined) || 
          (this._isNullable && processedData === null)) {
        return { success: true, data: processedData as Output };
      }
      
      const result = await this._parseAsync(processedData, ctx);
      
      if (ctx.hasIssues) {
        return { success: false, error: ctx.makeError() };
      }
      
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error };
      }
      return { 
        success: false, 
        error: new ValidationError({
          code: 'custom',
          message: error instanceof Error ? error.message : String(error),
          path: []
        })
      };
    }
  }

  optional(): SchemaDefinition<Input | undefined, Output | undefined> {
    const OptionalSchema = Object.create(this);
    OptionalSchema._isOptional = true;
    return OptionalSchema;
  }

  nullable(): SchemaDefinition<Input | null, Output | null> {
    const NullableSchema = Object.create(this);
    NullableSchema._isNullable = true;
    return NullableSchema;
  }

  nullish(): SchemaDefinition<Input | null | undefined, Output | null | undefined> {
    const NullishSchema = Object.create(this);
    NullishSchema._isOptional = true;
    NullishSchema._isNullable = true;
    return NullishSchema;
  }

  array(): SchemaDefinition<Input[], Output[]> {
    const ArraySchema = require('./schemas/complex/array').array(this);
    return ArraySchema as any;
  }

  promise(): SchemaDefinition<Promise<Input>, Promise<Output>> {
    const PromiseSchema = require('./schemas/complex/promise').promise(this);
    return PromiseSchema as any;
  }

  or<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<Input | T, Output | T> {
    const UnionSchema = require('./schemas/complex/union').union([this, schema]);
    return UnionSchema as any;
  }

  and<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<Input & T, Output & T> {
    const IntersectionSchema = require('./schemas/complex/intersection').intersection(this, schema);
    return IntersectionSchema as any;
  }

  transform<NewOutput>(fn: (value: Output) => NewOutput): SchemaDefinition<Input, NewOutput> {
    const TransformSchema = Object.create(this);
    TransformSchema._transforms = [...this._transforms, fn];
    return TransformSchema;
  }

  default(value: Output | (() => Output)): SchemaDefinition<Input | undefined, Output> {
    const DefaultSchema = Object.create(this);
    DefaultSchema._default = value;
    DefaultSchema._isOptional = true;
    return DefaultSchema;
  }

  catch(value: Output | ((error: ValidationError) => Output)): SchemaDefinition<Input, Output> {
    const CatchSchema = Object.create(this);
    CatchSchema._catch = value;
    return CatchSchema;
  }

  refine(
    check: (value: Output) => boolean | Promise<boolean>,
    message?: string | ValidationIssue
  ): SchemaDefinition<Input, Output> {
    const RefinedSchema = Object.create(this);
    RefinedSchema._checks = [
      ...this._checks,
      (value: Output, ctx: RefinementCtx): void | Promise<void> => {
        const result = check(value);
        // If result is a promise, return it for async parsing
        if (result && typeof (result as any).then === 'function') {
          return (result as Promise<boolean>).then((res: boolean) => {
            if (!res) {
              const issue = typeof message === 'string' 
                ? { code: 'custom', message }
                : message || { code: 'custom', message: 'Refinement check failed' };
              ctx.addIssue(issue);
            }
          });
        }
        // Sync result
        if (!result) {
          const issue = typeof message === 'string' 
            ? { code: 'custom', message }
            : message || { code: 'custom', message: 'Refinement check failed' };
          ctx.addIssue(issue);
        }
        return;
      }
    ];
    return RefinedSchema;
  }

  superRefine<Ctx extends { addIssue: (issue: ValidationIssue) => void }>(
    check: (value: Output, ctx: Ctx) => void | Promise<void>
  ): SchemaDefinition<Input, Output> {
    const RefinedSchema = Object.create(this);
    RefinedSchema._checks = [
      ...this._checks,
      (value: Output, ctx: RefinementCtx) => check(value, ctx as unknown as Ctx)
    ];
    return RefinedSchema;
  }

  describe(description: string): SchemaDefinition<Input, Output> {
    const DescribedSchema = Object.create(this);
    DescribedSchema._description = description;
    return DescribedSchema;
  }

  brand<B extends string | symbol>(): SchemaDefinition<Input, Output & { [brand]: B }> {
    return this as any;
  }

  readonly(): SchemaDefinition<Input, Output> {
    return this as any;
  }

  isOptional(): boolean {
    return this._isOptional;
  }

  isNullable(): boolean {
    return this._isNullable;
  }

  isNullish(): boolean {
    return this._isOptional && this._isNullable;
  }
}