import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export interface BigIntChecks {
    kind: 'min' | 'max' | 'positive' | 'negative' | 'nonpositive' | 'nonnegative' | 'multipleOf';
    value?: bigint;
    inclusive?: boolean;
    message?: string;
}
export declare class BigIntSchema extends BaseSchema<bigint, bigint> {
    readonly _type = "bigint";
    protected _checks: BigIntChecks[];
    private _coerce;
    constructor(options?: {
        coerce?: boolean;
    });
    _parse(input: unknown, ctx: ParseContext): bigint;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<bigint>;
    min(value: bigint, options?: {
        inclusive?: boolean;
        message?: string;
    }): BigIntSchema;
    max(value: bigint, options?: {
        inclusive?: boolean;
        message?: string;
    }): BigIntSchema;
    positive(message?: string): BigIntSchema;
    negative(message?: string): BigIntSchema;
    nonpositive(message?: string): BigIntSchema;
    nonnegative(message?: string): BigIntSchema;
    multipleOf(value: bigint, message?: string): BigIntSchema;
}
export declare function bigint(options?: {
    coerce?: boolean;
}): BigIntSchema;
//# sourceMappingURL=bigint.d.ts.map