import { BaseSchema } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class UndefinedSchema extends BaseSchema<undefined, undefined> {
  readonly _type = 'undefined';

  _parse(input: unknown, ctx: ParseContext): undefined {
    const parsedType = getParsedType(input);
    if (parsedType !== 'undefined') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected undefined, received ${parsedType}`,
        expected: 'undefined',
        received: parsedType
      });
      throw ctx.makeError();
    }

    return undefined;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<undefined> {
    return this._parse(input, ctx);
  }
}

export { UndefinedSchema as undefined };

export function undefinedSchema(): UndefinedSchema {
  return new UndefinedSchema();
}