import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export interface DateChecks {
    kind: 'min' | 'max';
    value: Date;
    inclusive?: boolean;
    message?: string;
}
export declare class DateSchema extends BaseSchema<Date, Date> {
    readonly _type = "date";
    protected _checks: DateChecks[];
    private _coerce;
    constructor(options?: {
        coerce?: boolean;
    });
    _parse(input: unknown, ctx: ParseContext): Date;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Date>;
    min(value: Date | number | string, options?: {
        inclusive?: boolean;
        message?: string;
    }): DateSchema;
    max(value: Date | number | string, options?: {
        inclusive?: boolean;
        message?: string;
    }): DateSchema;
}
export declare function date(options?: {
    coerce?: boolean;
}): DateSchema;
//# sourceMappingURL=date.d.ts.map