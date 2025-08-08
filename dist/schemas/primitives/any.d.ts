import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class AnySchema extends BaseSchema<any, any> {
    readonly _type = "any";
    _parse(input: unknown, _ctx: ParseContext): any;
    _parseAsync(input: unknown, _ctx: ParseContext): Promise<any>;
}
export declare function any(): AnySchema;
//# sourceMappingURL=any.d.ts.map