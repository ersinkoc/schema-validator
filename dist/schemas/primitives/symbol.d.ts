import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class SymbolSchema extends BaseSchema<symbol, symbol> {
    readonly _type = "symbol";
    _parse(input: unknown, ctx: ParseContext): symbol;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<symbol>;
}
export declare function symbol(): SymbolSchema;
//# sourceMappingURL=symbol.d.ts.map