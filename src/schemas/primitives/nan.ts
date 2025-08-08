import { BaseSchema } from '../../types/base';
import { ErrorCode } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class NanSchema extends BaseSchema<number, number> {
  readonly _type = 'nan';

  _parse(input: unknown, ctx: ParseContext): number {
    if (typeof input !== 'number' || !isNaN(input)) {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'nan',
        received: typeof input === 'number' ? 'number' : ctx.parsedType
      });
      throw ctx.makeError();
    }

    return input;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<number> {
    return this._parse(input, ctx);
  }
}

export function nan(): NanSchema {
  return new NanSchema();
}