import { BaseSchema } from '../../types/base';
import { ErrorCode } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export type Literal = string | number | boolean | null | undefined | symbol | bigint;

export class LiteralSchema<T extends Literal> extends BaseSchema<T, T> {
  readonly _type = 'literal';
  private _value: T;

  constructor(value: T) {
    super();
    this._value = value;
  }

  _parse(input: unknown, ctx: ParseContext): T {
    if (input !== this._value) {
      ctx.addIssue({
        code: ErrorCode.INVALID_LITERAL,
        expected: JSON.stringify(this._value),
        received: JSON.stringify(input)
      });
      throw ctx.makeError();
    }

    return input as T;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<T> {
    return this._parse(input, ctx);
  }

  get value(): T {
    return this._value;
  }
}

export function literal<T extends Literal>(value: T): LiteralSchema<T> {
  return new LiteralSchema(value);
}