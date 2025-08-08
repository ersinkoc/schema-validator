import { BaseSchema } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class SymbolSchema extends BaseSchema<symbol, symbol> {
  readonly _type = 'symbol';

  _parse(input: unknown, ctx: ParseContext): symbol {
    const parsedType = getParsedType(input);
    if (parsedType !== 'symbol') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected symbol, received ${parsedType}`,
        expected: 'symbol',
        received: parsedType
      });
      throw ctx.makeError();
    }

    return input as symbol;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<symbol> {
    return this._parse(input, ctx);
  }
}

export function symbol(): SymbolSchema {
  return new SymbolSchema();
}