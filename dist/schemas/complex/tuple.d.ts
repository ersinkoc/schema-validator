import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
type TupleItems = readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]];
type TupleRestItem = SchemaDefinition<any, any> | null;
type InferTupleInput<T extends TupleItems, Rest extends TupleRestItem> = Rest extends SchemaDefinition<any, any> ? [...{
    [K in keyof T]: T[K]['_input'];
}, ...Rest['_input'][]] : {
    [K in keyof T]: T[K]['_input'];
};
type InferTupleOutput<T extends TupleItems, Rest extends TupleRestItem> = Rest extends SchemaDefinition<any, any> ? [...{
    [K in keyof T]: T[K]['_output'];
}, ...Rest['_output'][]] : {
    [K in keyof T]: T[K]['_output'];
};
export declare class TupleSchema<T extends TupleItems, Rest extends TupleRestItem = null> extends BaseSchema<InferTupleInput<T, Rest>, InferTupleOutput<T, Rest>> {
    readonly _type = "tuple";
    private _items;
    private _rest;
    constructor(items: T, rest?: Rest);
    _parse(input: unknown, ctx: ParseContext): InferTupleOutput<T, Rest>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<InferTupleOutput<T, Rest>>;
    rest<R extends SchemaDefinition<any, any>>(schema: R): TupleSchema<T, R>;
    get items(): T;
}
export declare function tuple<T extends TupleItems>(items: T): TupleSchema<T, null>;
export {};
//# sourceMappingURL=tuple.d.ts.map