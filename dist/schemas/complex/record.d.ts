import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class RecordSchema<K extends SchemaDefinition<any, any>, V extends SchemaDefinition<any, any>> extends BaseSchema<Record<string, V['_input']>, Record<string, V['_output']>> {
    readonly _type = "record";
    readonly _keySchema: K;
    readonly _valueSchema: V;
    constructor(keySchema: K, valueSchema: V);
    _parse(input: unknown, ctx: ParseContext): Record<string, V['_output']>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Record<string, V['_output']>>;
}
export declare function record<K extends SchemaDefinition<any, any>, V extends SchemaDefinition<any, any>>(keySchema: K, valueSchema: V): RecordSchema<K, V>;
//# sourceMappingURL=record.d.ts.map