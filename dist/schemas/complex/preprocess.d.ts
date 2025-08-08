import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class PreprocessSchema<Input, PreprocessedInput, Output> extends BaseSchema<Input, Output> {
    readonly _type = "preprocess";
    private _preprocessor;
    private _schema;
    constructor(preprocessor: (value: unknown) => PreprocessedInput, schema: SchemaDefinition<PreprocessedInput, Output>);
    _parse(input: unknown, ctx: ParseContext): Output;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Output>;
}
export declare function preprocess<PreprocessedInput, Output>(preprocessor: (value: unknown) => PreprocessedInput, schema: SchemaDefinition<PreprocessedInput, Output>): PreprocessSchema<unknown, PreprocessedInput, Output>;
//# sourceMappingURL=preprocess.d.ts.map