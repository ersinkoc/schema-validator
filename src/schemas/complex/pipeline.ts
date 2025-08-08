import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';

type ExtractInput<T> = T extends SchemaDefinition<infer I, any> ? I : never;
type ExtractOutput<T> = T extends SchemaDefinition<any, infer O> ? O : never;

export class PipelineSchema<
  Schemas extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]
> extends BaseSchema<
  ExtractInput<Schemas[0]>,
  ExtractOutput<Schemas[number]>
> {
  readonly _type = 'pipeline';
  private _schemas: Schemas;

  constructor(schemas: Schemas) {
    super();
    this._schemas = schemas;
  }

  _parse(input: unknown, ctx: ParseContext): ExtractOutput<Schemas[number]> {
    let result: any = input;

    for (const schema of this._schemas) {
      result = (schema as any)._parse(result, ctx);
      
      if (ctx.hasIssues) {
        throw ctx.makeError();
      }
    }

    return result;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<ExtractOutput<Schemas[number]>> {
    let result: any = input;

    for (const schema of this._schemas) {
      result = await (schema as any)._parseAsync(result, ctx);
      
      if (ctx.hasIssues) {
        throw ctx.makeError();
      }
    }

    return result;
  }

  get schemas(): Schemas {
    return this._schemas;
  }
}

export function pipeline<
  Schemas extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]
>(...schemas: Schemas): PipelineSchema<Schemas> {
  return new PipelineSchema(schemas);
}