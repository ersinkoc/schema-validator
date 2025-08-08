import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class VoidSchema extends BaseSchema<void, void> {
    readonly _type = "void";
    _parse(input: unknown, ctx: ParseContext): void;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<void>;
}
export { VoidSchema as void };
export declare function voidSchema(): VoidSchema;
//# sourceMappingURL=void.d.ts.map