import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class UnionSchema<T extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]> extends BaseSchema<
  T[number]['_input'],
  T[number]['_output']
> {
  readonly _type = 'union';
  private _unionOptions: T;

  constructor(options: T) {
    super();
    this._unionOptions = options;
  }

  _parse(input: unknown, ctx: ParseContext): T[number]['_output'] {
    const issues: Array<{ schema: SchemaDefinition<any, any>; issues: any[] }> = [];

    for (const option of this._unionOptions) {
      const result = option.safeParse(input);
      if (result.success) {
        return result.data;
      } else {
        issues.push({
          schema: option,
          issues: result.error.issues
        });
      }
    }

    ctx.addIssue({
      code: ErrorCode.INVALID_UNION,
      message: `Invalid union: no matching option`,
      options: {
        unionErrors: issues
      }
    });
    throw ctx.makeError();
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<T[number]['_output']> {
    const issues: Array<{ schema: SchemaDefinition<any, any>; issues: any[] }> = [];

    for (const option of this._unionOptions) {
      const result = await option.safeParseAsync(input);
      if (result.success) {
        return result.data;
      } else {
        issues.push({
          schema: option,
          issues: result.error.issues
        });
      }
    }

    ctx.addIssue({
      code: ErrorCode.INVALID_UNION,
      message: `Invalid union: no matching option`,
      options: {
        unionErrors: issues
      }
    });
    throw ctx.makeError();
  }

  get options(): T {
    return this._unionOptions;
  }
}

export function union<T extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]>(
  options: T
): UnionSchema<T> {
  return new UnionSchema(options);
}