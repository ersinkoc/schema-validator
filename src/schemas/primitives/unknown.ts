import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';

export class UnknownSchema extends BaseSchema<unknown, unknown> {
  readonly _type = 'unknown';

  _parse(input: unknown, _ctx: ParseContext): unknown {
    return input;
  }

  async _parseAsync(input: unknown, _ctx: ParseContext): Promise<unknown> {
    return input;
  }
}

export function unknown(): UnknownSchema {
  return new UnknownSchema();
}