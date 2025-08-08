import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export interface ArrayChecks {
  kind: 'min' | 'max' | 'length' | 'nonempty';
  value?: number;
  message?: string;
}

export class ArraySchema<T> extends BaseSchema<T[], T[]> {
  readonly _type = 'array';
  private _element: SchemaDefinition<any, T>;
  protected override _checks: ArrayChecks[] = [];

  constructor(element: SchemaDefinition<any, T>) {
    super();
    this._element = element;
  }

  _parse(input: unknown, ctx: ParseContext): T[] {
    const parsedType = getParsedType(input);
    if (parsedType !== 'array') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected array, received ${parsedType}`,
        expected: 'array',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const arr = input as any[];

    for (const check of this._checks) {
      switch (check.kind) {
        case 'min':
          if (arr.length < check.value!) {
            ctx.addIssue({
              code: ErrorCode.TOO_SMALL,
              message: check.message || 'Array validation failed',
              options: {
                type: 'array',
                minimum: check.value,
                inclusive: true
              }
            });
          }
          break;

        case 'max':
          if (arr.length > check.value!) {
            ctx.addIssue({
              code: ErrorCode.TOO_BIG,
              message: check.message || 'Array validation failed',
              options: {
                type: 'array',
                maximum: check.value,
                inclusive: true
              }
            });
          }
          break;

        case 'length':
          if (arr.length !== check.value!) {
            ctx.addIssue({
              code: ErrorCode.INVALID_TYPE,
              message: check.message || `Array must have exactly ${check.value} elements`,
              expected: `array of length ${check.value}`,
              received: `array of length ${arr.length}`
            });
          }
          break;

        case 'nonempty':
          if (arr.length === 0) {
            ctx.addIssue({
              code: ErrorCode.TOO_SMALL,
              message: check.message || 'Array must not be empty',
              options: {
                type: 'array',
                minimum: 1,
                inclusive: true
              }
            });
          }
          break;
      }
    }

    const result: T[] = [];
    for (let i = 0; i < arr.length; i++) {
      try {
        const childCtx = ctx.child(i, arr[i]);
        const parsed = (this._element as any)._parse(arr[i], childCtx);
        result.push(parsed);
      } catch (error) {
        if (!ctx.common.async) {
          throw ctx.makeError();
        }
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<T[]> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'array') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected array, received ${parsedType}`,
        expected: 'array',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const arr = input as any[];

    for (const check of this._checks) {
      switch (check.kind) {
        case 'min':
          if (arr.length < check.value!) {
            ctx.addIssue({
              code: ErrorCode.TOO_SMALL,
              message: check.message || 'Array validation failed',
              options: {
                type: 'array',
                minimum: check.value,
                inclusive: true
              }
            });
          }
          break;

        case 'max':
          if (arr.length > check.value!) {
            ctx.addIssue({
              code: ErrorCode.TOO_BIG,
              message: check.message || 'Array validation failed',
              options: {
                type: 'array',
                maximum: check.value,
                inclusive: true
              }
            });
          }
          break;

        case 'length':
          if (arr.length !== check.value!) {
            ctx.addIssue({
              code: ErrorCode.INVALID_TYPE,
              message: check.message || `Array must have exactly ${check.value} elements`,
              expected: `array of length ${check.value}`,
              received: `array of length ${arr.length}`
            });
          }
          break;

        case 'nonempty':
          if (arr.length === 0) {
            ctx.addIssue({
              code: ErrorCode.TOO_SMALL,
              message: check.message || 'Array must not be empty',
              options: {
                type: 'array',
                minimum: 1,
                inclusive: true
              }
            });
          }
          break;
      }
    }

    const result: T[] = [];
    const promises: Promise<T>[] = [];
    
    for (let i = 0; i < arr.length; i++) {
      const childCtx = ctx.child(i, arr[i]);
      promises.push((this._element as any)._parseAsync(arr[i], childCtx));
    }

    const results = await Promise.allSettled(promises);
    for (const res of results) {
      if (res.status === 'fulfilled') {
        result.push(res.value);
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result;
  }

  min(length: number, message?: string): ArraySchema<T> {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'min', value: length, message }];
    return schema;
  }

  max(length: number, message?: string): ArraySchema<T> {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'max', value: length, message }];
    return schema;
  }

  length(length: number, message?: string): ArraySchema<T> {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'length', value: length, message }];
    return schema;
  }

  nonempty(message?: string): ArraySchema<T> {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'nonempty', message }];
    return schema;
  }

  get element(): SchemaDefinition<any, T> {
    return this._element;
  }
}

export function array<T>(element: SchemaDefinition<any, T>): ArraySchema<T> {
  return new ArraySchema(element);
}