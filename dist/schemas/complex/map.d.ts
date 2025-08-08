import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class MapSchema<K, V> extends BaseSchema<Map<K, V>, Map<K, V>> {
    readonly _type = "map";
    private _keySchema;
    private _valueSchema;
    constructor(keySchema: SchemaDefinition<any, K>, valueSchema: SchemaDefinition<any, V>);
    _parse(input: unknown, ctx: ParseContext): Map<K, V>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Map<K, V>>;
    get keySchema(): SchemaDefinition<any, K>;
    get valueSchema(): SchemaDefinition<any, V>;
}
export declare function map<K, V>(keySchema: SchemaDefinition<any, K>, valueSchema: SchemaDefinition<any, V>): MapSchema<K, V>;
//# sourceMappingURL=map.d.ts.map