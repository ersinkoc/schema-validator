import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
type ExtractInput<T> = T extends SchemaDefinition<infer I, any> ? I : never;
type ExtractOutput<T> = T extends SchemaDefinition<any, infer O> ? O : never;
export declare class PipelineSchema<Schemas extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]> extends BaseSchema<ExtractInput<Schemas[0]>, ExtractOutput<Schemas[number]>> {
    readonly _type = "pipeline";
    private _schemas;
    constructor(schemas: Schemas);
    _parse(input: unknown, ctx: ParseContext): ExtractOutput<Schemas[number]>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<ExtractOutput<Schemas[number]>>;
    get schemas(): Schemas;
}
export declare function pipeline<Schemas extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]>(...schemas: Schemas): PipelineSchema<Schemas>;
export {};
//# sourceMappingURL=pipeline.d.ts.map