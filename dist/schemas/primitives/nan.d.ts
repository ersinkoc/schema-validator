import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class NanSchema extends BaseSchema<number, number> {
    readonly _type = "nan";
    _parse(input: unknown, ctx: ParseContext): number;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<number>;
}
export declare function nan(): NanSchema;
//# sourceMappingURL=nan.d.ts.map