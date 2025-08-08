import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class FunctionSchema<Args extends readonly SchemaDefinition<any, any>[], Returns extends SchemaDefinition<any, any> | undefined = undefined> extends BaseSchema<(...args: {
    [K in keyof Args]: Args[K]['_input'];
}) => Returns extends SchemaDefinition<any, any> ? Returns['_output'] : any, (...args: {
    [K in keyof Args]: Args[K]['_input'];
}) => Returns extends SchemaDefinition<any, any> ? Returns['_output'] : any> {
    readonly _type = "function";
    private _args?;
    private _returns?;
    private _implement?;
    constructor(args?: Args, returns?: Returns);
    _parse(input: unknown, ctx: ParseContext): any;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<any>;
    args<NewArgs extends readonly SchemaDefinition<any, any>[]>(...schemas: NewArgs): FunctionSchema<NewArgs, Returns>;
    returns<NewReturns extends SchemaDefinition<any, any>>(schema: NewReturns): FunctionSchema<Args, NewReturns>;
    implement(fn: Function): FunctionSchema<Args, Returns>;
}
export declare function functionSchema(): FunctionSchema<[], undefined>;
//# sourceMappingURL=function.d.ts.map