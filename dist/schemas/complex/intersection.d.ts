import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class IntersectionSchema<A extends SchemaDefinition<any, any>, B extends SchemaDefinition<any, any>> extends BaseSchema<A['_input'] & B['_input'], A['_output'] & B['_output']> {
    readonly _type = "intersection";
    private _left;
    private _right;
    constructor(left: A, right: B);
    _parse(input: unknown, ctx: ParseContext): A['_output'] & B['_output'];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<A['_output'] & B['_output']>;
}
export declare function intersection<A extends SchemaDefinition<any, any>, B extends SchemaDefinition<any, any>>(left: A, right: B): IntersectionSchema<A, B>;
//# sourceMappingURL=intersection.d.ts.map