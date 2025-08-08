import { BaseSchema } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class NullSchema extends BaseSchema<null, null> {
  readonly _type = 'null';

  _parse(input: unknown, ctx: ParseContext): null {
    const parsedType = getParsedType(input);
    if (parsedType !== 'null') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected null, received ${parsedType}`,
        expected: 'null',
        received: parsedType
      });
      throw ctx.makeError();
    }

    return null;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<null> {
    return this._parse(input, ctx);
  }
}

export { NullSchema as null };

export function nullSchema(): NullSchema {
  return new NullSchema();
}