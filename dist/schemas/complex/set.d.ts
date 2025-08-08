import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class SetSchema<T> extends BaseSchema<Set<T>, Set<T>> {
    readonly _type = "set";
    private _element;
    constructor(element: SchemaDefinition<any, T>);
    _parse(input: unknown, ctx: ParseContext): Set<T>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Set<T>>;
    get element(): SchemaDefinition<any, T>;
}
export declare function set<T>(element: SchemaDefinition<any, T>): SetSchema<T>;
//# sourceMappingURL=set.d.ts.map