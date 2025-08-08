import { BaseSchema } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class VoidSchema extends BaseSchema<void, void> {
  readonly _type = 'void';

  _parse(input: unknown, ctx: ParseContext): void {
    const parsedType = getParsedType(input);
    if (parsedType !== 'undefined') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected void, received ${parsedType}`,
        expected: 'void',
        received: parsedType
      });
      throw ctx.makeError();
    }

    return undefined as void;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<void> {
    return this._parse(input, ctx);
  }
}

export { VoidSchema as void };

export function voidSchema(): VoidSchema {
  return new VoidSchema();
}