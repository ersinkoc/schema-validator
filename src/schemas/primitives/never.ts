import { BaseSchema } from '../../types/base';
import { ErrorCode } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class NeverSchema extends BaseSchema<never, never> {
  readonly _type = 'never';

  _parse(_input: unknown, ctx: ParseContext): never {
    ctx.addIssue({
      code: ErrorCode.INVALID_TYPE,
      expected: 'never',
      received: ctx.parsedType
    });
    throw ctx.makeError();
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<never> {
    return this._parse(input, ctx);
  }
}

export function never(): NeverSchema {
  return new NeverSchema();
}