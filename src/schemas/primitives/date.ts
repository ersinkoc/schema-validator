import { BaseSchema } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export interface DateChecks {
  kind: 'min' | 'max';
  value: Date;
  inclusive?: boolean;
  message?: string;
}

export class DateSchema extends BaseSchema<Date, Date> {
  readonly _type = 'date';
  protected override _checks: DateChecks[] = [];
  private _coerce: boolean;

  constructor(options: { coerce?: boolean } = {}) {
    super();
    this._coerce = options.coerce || false;
  }

  _parse(input: unknown, ctx: ParseContext): Date {
    if (this._coerce) {
      if (typeof input === 'string' || typeof input === 'number') {
        input = new Date(input);
      }
    }

    const parsedType = getParsedType(input);
    if (parsedType !== 'date') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'date',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const value = input as Date;

    if (isNaN(value.getTime())) {
      ctx.addIssue({
        code: ErrorCode.INVALID_DATE,
        message: 'Invalid date'
      });
      throw ctx.makeError();
    }

    for (const check of this._checks) {
      switch (check.kind) {
        case 'min':
          if (check.inclusive !== false) {
            if (value < check.value) {
              ctx.addIssue({
                code: ErrorCode.TOO_SMALL,
                message: check.message,
                options: {
                  type: 'date',
                  minimum: check.value.getTime(),
                  inclusive: true
                }
              });
            }
          } else {
            if (value <= check.value) {
              ctx.addIssue({
                code: ErrorCode.TOO_SMALL,
                message: check.message,
                options: {
                  type: 'date',
                  minimum: check.value.getTime(),
                  inclusive: false
                }
              });
            }
          }
          break;

        case 'max':
          if (check.inclusive !== false) {
            if (value > check.value) {
              ctx.addIssue({
                code: ErrorCode.TOO_BIG,
                message: check.message,
                options: {
                  type: 'date',
                  maximum: check.value.getTime(),
                  inclusive: true
                }
              });
            }
          } else {
            if (value >= check.value) {
              ctx.addIssue({
                code: ErrorCode.TOO_BIG,
                message: check.message,
                options: {
                  type: 'date',
                  maximum: check.value.getTime(),
                  inclusive: false
                }
              });
            }
          }
          break;
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return value;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<Date> {
    return this._parse(input, ctx);
  }

  min(value: Date | number | string, options?: { inclusive?: boolean; message?: string }): DateSchema {
    const date = value instanceof Date ? value : new Date(value);
    const schema = Object.create(this);
    schema._checks = [...this._checks, { 
      kind: 'min', 
      value: date, 
      inclusive: options?.inclusive,
      message: options?.message 
    }];
    return schema;
  }

  max(value: Date | number | string, options?: { inclusive?: boolean; message?: string }): DateSchema {
    const date = value instanceof Date ? value : new Date(value);
    const schema = Object.create(this);
    schema._checks = [...this._checks, { 
      kind: 'max', 
      value: date, 
      inclusive: options?.inclusive,
      message: options?.message 
    }];
    return schema;
  }
}

export function date(options?: { coerce?: boolean }): DateSchema {
  return new DateSchema(options);
}