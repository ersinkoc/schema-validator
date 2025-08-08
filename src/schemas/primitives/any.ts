import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';

export class AnySchema extends BaseSchema<any, any> {
  readonly _type = 'any';

  _parse(input: unknown, _ctx: ParseContext): any {
    return input;
  }

  async _parseAsync(input: unknown, _ctx: ParseContext): Promise<any> {
    return input;
  }
}

export function any(): AnySchema {
  return new AnySchema();
}