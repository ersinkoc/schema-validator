import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class BooleanSchema extends BaseSchema<boolean, boolean> {
    readonly _type = "boolean";
    private _coerce;
    constructor(options?: {
        coerce?: boolean;
    });
    _parse(input: unknown, ctx: ParseContext): boolean;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<boolean>;
}
export declare function boolean(options?: {
    coerce?: boolean;
}): BooleanSchema;
//# sourceMappingURL=boolean.d.ts.map