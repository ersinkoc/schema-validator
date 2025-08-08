import { BaseSchema } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class BooleanSchema extends BaseSchema<boolean, boolean> {
  readonly _type = 'boolean';
  private _coerce: boolean;

  constructor(options: { coerce?: boolean } = {}) {
    super();
    this._coerce = options.coerce || false;
  }

  _parse(input: unknown, ctx: ParseContext): boolean {
    if (this._coerce) {
      input = Boolean(input);
    }

    const parsedType = getParsedType(input);
    if (parsedType !== 'boolean') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected boolean, received ${parsedType}`,
        expected: 'boolean',
        received: parsedType
      });
      throw ctx.makeError();
    }

    return input as boolean;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<boolean> {
    return this._parse(input, ctx);
  }
}

export function boolean(options?: { coerce?: boolean }): BooleanSchema {
  return new BooleanSchema(options);
}