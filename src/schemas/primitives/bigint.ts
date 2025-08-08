import { BaseSchema } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export interface BigIntChecks {
  kind: 'min' | 'max' | 'positive' | 'negative' | 'nonpositive' | 'nonnegative' | 'multipleOf';
  value?: bigint;
  inclusive?: boolean;
  message?: string;
}

export class BigIntSchema extends BaseSchema<bigint, bigint> {
  readonly _type = 'bigint';
  protected override _checks: BigIntChecks[] = [];
  private _coerce: boolean;

  constructor(options: { coerce?: boolean } = {}) {
    super();
    this._coerce = options.coerce || false;
  }

  _parse(input: unknown, ctx: ParseContext): bigint {
    if (this._coerce) {
      if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
        try {
          input = BigInt(input as any);
        } catch {
          ctx.addIssue({
            code: ErrorCode.INVALID_TYPE,
            expected: 'bigint',
            received: getParsedType(input)
          });
          throw ctx.makeError();
        }
      }
    }

    const parsedType = getParsedType(input);
    if (parsedType !== 'bigint') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'bigint',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const value = input as bigint;

    for (const check of this._checks) {
      switch (check.kind) {
        case 'min':
          if (check.inclusive !== false) {
            if (value < check.value!) {
              ctx.addIssue({
                code: ErrorCode.TOO_SMALL,
                message: check.message,
                options: {
                  type: 'bigint',
                  minimum: check.value!.toString(),
                  inclusive: true
                }
              });
            }
          } else {
            if (value <= check.value!) {
              ctx.addIssue({
                code: ErrorCode.TOO_SMALL,
                message: check.message,
                options: {
                  type: 'bigint',
                  minimum: check.value!.toString(),
                  inclusive: false
                }
              });
            }
          }
          break;

        case 'max':
          if (check.inclusive !== false) {
            if (value > check.value!) {
              ctx.addIssue({
                code: ErrorCode.TOO_BIG,
                message: check.message,
                options: {
                  type: 'bigint',
                  maximum: check.value!.toString(),
                  inclusive: true
                }
              });
            }
          } else {
            if (value >= check.value!) {
              ctx.addIssue({
                code: ErrorCode.TOO_BIG,
                message: check.message,
                options: {
                  type: 'bigint',
                  maximum: check.value!.toString(),
                  inclusive: false
                }
              });
            }
          }
          break;

        case 'positive':
          if (value <= 0n) {
            ctx.addIssue({
              code: ErrorCode.TOO_SMALL,
              message: check.message || 'BigInt must be positive',
              options: {
                type: 'bigint',
                minimum: '0',
                inclusive: false
              }
            });
          }
          break;

        case 'negative':
          if (value >= 0n) {
            ctx.addIssue({
              code: ErrorCode.TOO_BIG,
              message: check.message || 'BigInt must be negative',
              options: {
                type: 'bigint',
                maximum: '0',
                inclusive: false
              }
            });
          }
          break;

        case 'nonpositive':
          if (value > 0n) {
            ctx.addIssue({
              code: ErrorCode.TOO_BIG,
              message: check.message || 'BigInt must be non-positive',
              options: {
                type: 'bigint',
                maximum: '0',
                inclusive: true
              }
            });
          }
          break;

        case 'nonnegative':
          if (value < 0n) {
            ctx.addIssue({
              code: ErrorCode.TOO_SMALL,
              message: check.message || 'BigInt must be non-negative',
              options: {
                type: 'bigint',
                minimum: '0',
                inclusive: true
              }
            });
          }
          break;

        case 'multipleOf':
          if (value % check.value! !== 0n) {
            ctx.addIssue({
              code: ErrorCode.NOT_MULTIPLE_OF,
              message: check.message,
              options: {
                multipleOf: check.value!.toString()
              }
            });
          }
          break;
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return value;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<bigint> {
    return this._parse(input, ctx);
  }

  min(value: bigint, options?: { inclusive?: boolean; message?: string }): BigIntSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { 
      kind: 'min', 
      value, 
      inclusive: options?.inclusive,
      message: options?.message 
    }];
    return schema;
  }

  max(value: bigint, options?: { inclusive?: boolean; message?: string }): BigIntSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { 
      kind: 'max', 
      value, 
      inclusive: options?.inclusive,
      message: options?.message 
    }];
    return schema;
  }

  positive(message?: string): BigIntSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'positive', message }];
    return schema;
  }

  negative(message?: string): BigIntSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'negative', message }];
    return schema;
  }

  nonpositive(message?: string): BigIntSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'nonpositive', message }];
    return schema;
  }

  nonnegative(message?: string): BigIntSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'nonnegative', message }];
    return schema;
  }

  multipleOf(value: bigint, message?: string): BigIntSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'multipleOf', value, message }];
    return schema;
  }
}

export function bigint(options?: { coerce?: boolean }): BigIntSchema {
  return new BigIntSchema(options);
}