import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class NeverSchema extends BaseSchema<never, never> {
    readonly _type = "never";
    _parse(_input: unknown, ctx: ParseContext): never;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<never>;
}
export declare function never(): NeverSchema;
//# sourceMappingURL=never.d.ts.map