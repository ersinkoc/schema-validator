import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class PromiseSchema<T> extends BaseSchema<Promise<T>, Promise<T>> {
    readonly _type = "promise";
    private _schema;
    constructor(schema: SchemaDefinition<any, T>);
    _parse(input: unknown, ctx: ParseContext): Promise<T>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Promise<T>>;
    get schema(): SchemaDefinition<any, T>;
}
export declare function promise<T>(schema: SchemaDefinition<any, T>): PromiseSchema<T>;
//# sourceMappingURL=promise.d.ts.map