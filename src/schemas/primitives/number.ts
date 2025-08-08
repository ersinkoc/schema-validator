import { BaseSchema } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export interface NumberChecks {
  kind: 'min' | 'max' | 'int' | 'positive' | 'negative' | 'nonpositive' | 'nonnegative' | 'multipleOf' | 'finite' | 'safe';
  value?: number;
  inclusive?: boolean;
  message?: string;
}

export class NumberSchema extends BaseSchema<number, number> {
  readonly _type = 'number';
  protected override _checks: NumberChecks[] = [];
  private _coerce: boolean;

  constructor(options: { coerce?: boolean } = {}) {
    super();
    this._coerce = options.coerce || false;
  }

  _parse(input: unknown, ctx: ParseContext): number {
    if (this._coerce) {
      input = Number(input);
    }

    const parsedType = getParsedType(input);
    if (parsedType !== 'number') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected number, received ${parsedType}`,
        expected: 'number',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const value = input as number;

    if (isNaN(value)) {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: 'Expected number, received NaN',
        expected: 'number',
        received: 'nan'
      });
      throw ctx.makeError();
    }

    for (const check of this._checks) {
      switch (check.kind) {
        case 'min':
          if (check.inclusive !== false) {
            if (value < check.value!) {
              ctx.addIssue({
                code: ErrorCode.TOO_SMALL,
                message: check.message,
                options: {
                  type: 'number',
                  minimum: check.value,
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
                  type: 'number',
                  minimum: check.value,
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
                  type: 'number',
                  maximum: check.value,
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
                  type: 'number',
                  maximum: check.value,
                  inclusive: false
                }
              });
            }
          }
          break;

        case 'int':
          if (!Number.isInteger(value)) {
            ctx.addIssue({
              code: ErrorCode.INVALID_TYPE,
              message: check.message || 'Expected integer, received float',
              expected: 'integer',
              received: 'float'
            });
          }
          break;

        case 'positive':
          if (value <= 0) {
            ctx.addIssue({
              code: ErrorCode.TOO_SMALL,
              message: check.message || 'Number must be positive',
              options: {
                type: 'number',
                minimum: 0,
                inclusive: false
              }
            });
          }
          break;

        case 'negative':
          if (value >= 0) {
            ctx.addIssue({
              code: ErrorCode.TOO_BIG,
              message: check.message || 'Number must be negative',
              options: {
                type: 'number',
                maximum: 0,
                inclusive: false
              }
            });
          }
          break;

        case 'nonpositive':
          if (value > 0) {
            ctx.addIssue({
              code: ErrorCode.TOO_BIG,
              message: check.message || 'Number must be non-positive',
              options: {
                type: 'number',
                maximum: 0,
                inclusive: true
              }
            });
          }
          break;

        case 'nonnegative':
          if (value < 0) {
            ctx.addIssue({
              code: ErrorCode.TOO_SMALL,
              message: check.message || 'Number must be non-negative',
              options: {
                type: 'number',
                minimum: 0,
                inclusive: true
              }
            });
          }
          break;

        case 'multipleOf':
          if (value % check.value! !== 0) {
            ctx.addIssue({
              code: ErrorCode.NOT_MULTIPLE_OF,
              message: check.message,
              options: {
                multipleOf: check.value
              }
            });
          }
          break;

        case 'finite':
          if (!Number.isFinite(value)) {
            ctx.addIssue({
              code: ErrorCode.NOT_FINITE,
              message: check.message
            });
          }
          break;

        case 'safe':
          if (!Number.isSafeInteger(value)) {
            ctx.addIssue({
              code: ErrorCode.INVALID_TYPE,
              message: check.message || 'Number must be a safe integer',
              expected: 'safe integer',
              received: 'number'
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

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<number> {
    return this._parse(input, ctx);
  }

  min(value: number, options?: { inclusive?: boolean; message?: string }): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { 
      kind: 'min', 
      value, 
      inclusive: options?.inclusive,
      message: options?.message 
    }];
    return schema;
  }

  max(value: number, options?: { inclusive?: boolean; message?: string }): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { 
      kind: 'max', 
      value, 
      inclusive: options?.inclusive,
      message: options?.message 
    }];
    return schema;
  }

  int(message?: string): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'int', message }];
    return schema;
  }

  positive(message?: string): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'positive', message }];
    return schema;
  }

  negative(message?: string): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'negative', message }];
    return schema;
  }

  nonpositive(message?: string): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'nonpositive', message }];
    return schema;
  }

  nonnegative(message?: string): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'nonnegative', message }];
    return schema;
  }

  multipleOf(value: number, message?: string): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'multipleOf', value, message }];
    return schema;
  }

  finite(message?: string): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'finite', message }];
    return schema;
  }

  safe(message?: string): NumberSchema {
    const schema = Object.create(this);
    schema._checks = [...this._checks, { kind: 'safe', message }];
    return schema;
  }

  gt(value: number, message?: string): NumberSchema {
    return this.min(value, { inclusive: false, message });
  }

  gte(value: number, message?: string): NumberSchema {
    return this.min(value, { inclusive: true, message });
  }

  lt(value: number, message?: string): NumberSchema {
    return this.max(value, { inclusive: false, message });
  }

  lte(value: number, message?: string): NumberSchema {
    return this.max(value, { inclusive: true, message });
  }

  step(value: number, message?: string): NumberSchema {
    return this.multipleOf(value, message);
  }
}

export function number(options?: { coerce?: boolean }): NumberSchema {
  return new NumberSchema(options);
}