import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class LazySchema<T> extends BaseSchema<T, T> {
    readonly _type = "lazy";
    private _getter;
    private _cached?;
    constructor(getter: () => SchemaDefinition<T, T>);
    private get schema();
    _parse(input: unknown, ctx: ParseContext): T;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T>;
}
export declare function lazy<T>(getter: () => SchemaDefinition<T, T>): LazySchema<T>;
//# sourceMappingURL=lazy.d.ts.map