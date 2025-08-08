import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class PromiseSchema<T> extends BaseSchema<Promise<T>, Promise<T>> {
  readonly _type = 'promise';
  private _schema: SchemaDefinition<any, T>;

  constructor(schema: SchemaDefinition<any, T>) {
    super();
    this._schema = schema;
  }

  _parse(input: unknown, ctx: ParseContext): Promise<T> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'promise') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'Promise',
        received: parsedType
      });
      throw ctx.makeError();
    }

    return (input as Promise<unknown>).then(value => {
      return (this._schema as any)._parse(value, ctx);
    });
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<Promise<T>> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'promise') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'Promise',
        received: parsedType
      });
      throw ctx.makeError();
    }

    // Return a promise that validates the resolved value
    return (input as Promise<unknown>).then(async value => {
      return (this._schema as any)._parseAsync(value, ctx);
    });
  }

  get schema(): SchemaDefinition<any, T> {
    return this._schema;
  }
}

export function promise<T>(schema: SchemaDefinition<any, T>): PromiseSchema<T> {
  return new PromiseSchema(schema);
}