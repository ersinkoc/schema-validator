import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';

export class PreprocessSchema<Input, PreprocessedInput, Output> extends BaseSchema<Input, Output> {
  readonly _type = 'preprocess';
  private _preprocessor: (value: unknown) => PreprocessedInput;
  private _schema: SchemaDefinition<PreprocessedInput, Output>;

  constructor(
    preprocessor: (value: unknown) => PreprocessedInput,
    schema: SchemaDefinition<PreprocessedInput, Output>
  ) {
    super();
    this._preprocessor = preprocessor;
    this._schema = schema;
  }

  _parse(input: unknown, ctx: ParseContext): Output {
    let preprocessed: PreprocessedInput;
    
    try {
      preprocessed = this._preprocessor(input);
    } catch (error) {
      ctx.addIssue({
        code: 'custom',
        message: `Preprocessing failed: ${error instanceof Error ? error.message : String(error)}`
      });
      throw ctx.makeError();
    }

    return (this._schema as any)._parse(preprocessed, ctx);
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<Output> {
    let preprocessed: PreprocessedInput;
    
    try {
      preprocessed = await Promise.resolve(this._preprocessor(input));
    } catch (error) {
      ctx.addIssue({
        code: 'custom',
        message: `Preprocessing failed: ${error instanceof Error ? error.message : String(error)}`
      });
      throw ctx.makeError();
    }

    return (this._schema as any)._parseAsync(preprocessed, ctx);
  }
}

export function preprocess<PreprocessedInput, Output>(
  preprocessor: (value: unknown) => PreprocessedInput,
  schema: SchemaDefinition<PreprocessedInput, Output>
): PreprocessSchema<unknown, PreprocessedInput, Output> {
  return new PreprocessSchema(preprocessor, schema);
}