import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export type Literal = string | number | boolean | null | undefined | symbol | bigint;
export declare class LiteralSchema<T extends Literal> extends BaseSchema<T, T> {
    readonly _type = "literal";
    private _value;
    constructor(value: T);
    _parse(input: unknown, ctx: ParseContext): T;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T>;
    get value(): T;
}
export declare function literal<T extends Literal>(value: T): LiteralSchema<T>;
//# sourceMappingURL=literal.d.ts.map