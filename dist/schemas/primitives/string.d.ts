import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export interface StringChecks {
    kind: 'min' | 'max' | 'length' | 'email' | 'url' | 'uuid' | 'cuid' | 'regex' | 'includes' | 'startsWith' | 'endsWith' | 'datetime' | 'ip' | 'base64' | 'trim' | 'toLowerCase' | 'toUpperCase';
    value?: any;
    message?: string;
}
export declare class StringSchema extends BaseSchema<string, string> {
    readonly _type = "string";
    protected _checks: StringChecks[];
    private _coerce;
    constructor(options?: {
        coerce?: boolean;
    });
    _parse(input: unknown, ctx: ParseContext): string;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<string>;
    min(length: number, message?: string): StringSchema;
    max(length: number, message?: string): StringSchema;
    length(length: number, message?: string): StringSchema;
    email(message?: string): StringSchema;
    url(message?: string): StringSchema;
    uuid(message?: string): StringSchema;
    cuid(message?: string): StringSchema;
    regex(pattern: RegExp, message?: string): StringSchema;
    includes(value: string, message?: string): StringSchema;
    startsWith(value: string, message?: string): StringSchema;
    endsWith(value: string, message?: string): StringSchema;
    datetime(message?: string): StringSchema;
    ip(version?: 'v4' | 'v6', message?: string): StringSchema;
    base64(message?: string): StringSchema;
    trim(): StringSchema;
    toLowerCase(): StringSchema;
    toUpperCase(): StringSchema;
    nonempty(message?: string): StringSchema;
}
export declare function string(options?: {
    coerce?: boolean;
}): StringSchema;
//# sourceMappingURL=string.d.ts.map