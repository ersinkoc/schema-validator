import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class UnionSchema<T extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]> extends BaseSchema<T[number]['_input'], T[number]['_output']> {
    readonly _type = "union";
    private _unionOptions;
    constructor(options: T);
    _parse(input: unknown, ctx: ParseContext): T[number]['_output'];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T[number]['_output']>;
    get options(): T;
}
export declare function union<T extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]>(options: T): UnionSchema<T>;
//# sourceMappingURL=union.d.ts.map