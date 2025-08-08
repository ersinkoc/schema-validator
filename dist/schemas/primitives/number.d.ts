import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export interface NumberChecks {
    kind: 'min' | 'max' | 'int' | 'positive' | 'negative' | 'nonpositive' | 'nonnegative' | 'multipleOf' | 'finite' | 'safe';
    value?: number;
    inclusive?: boolean;
    message?: string;
}
export declare class NumberSchema extends BaseSchema<number, number> {
    readonly _type = "number";
    protected _checks: NumberChecks[];
    private _coerce;
    constructor(options?: {
        coerce?: boolean;
    });
    _parse(input: unknown, ctx: ParseContext): number;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<number>;
    min(value: number, options?: {
        inclusive?: boolean;
        message?: string;
    }): NumberSchema;
    max(value: number, options?: {
        inclusive?: boolean;
        message?: string;
    }): NumberSchema;
    int(message?: string): NumberSchema;
    positive(message?: string): NumberSchema;
    negative(message?: string): NumberSchema;
    nonpositive(message?: string): NumberSchema;
    nonnegative(message?: string): NumberSchema;
    multipleOf(value: number, message?: string): NumberSchema;
    finite(message?: string): NumberSchema;
    safe(message?: string): NumberSchema;
    gt(value: number, message?: string): NumberSchema;
    gte(value: number, message?: string): NumberSchema;
    lt(value: number, message?: string): NumberSchema;
    lte(value: number, message?: string): NumberSchema;
    step(value: number, message?: string): NumberSchema;
}
export declare function number(options?: {
    coerce?: boolean;
}): NumberSchema;
//# sourceMappingURL=number.d.ts.map