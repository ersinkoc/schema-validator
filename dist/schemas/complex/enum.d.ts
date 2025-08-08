import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class EnumSchema<T extends readonly [string, ...string[]]> extends BaseSchema<T[number], T[number]> {
    readonly _type = "enum";
    private _values;
    private _enumValues;
    constructor(values: T);
    _parse(input: unknown, ctx: ParseContext): T[number];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T[number]>;
    get values(): T;
    get options(): T[number][];
}
export declare function enumSchema<T extends readonly [string, ...string[]]>(values: T): EnumSchema<T>;
export declare class NativeEnumSchema<T extends Record<string, string | number>> extends BaseSchema<T[keyof T], T[keyof T]> {
    readonly _type = "nativeEnum";
    private _enum;
    private _enumValues;
    constructor(enumObject: T);
    _parse(input: unknown, ctx: ParseContext): T[keyof T];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T[keyof T]>;
    get enum(): T;
    get options(): T[keyof T][];
}
export declare function nativeEnum<T extends Record<string, string | number>>(enumObject: T): NativeEnumSchema<T>;
//# sourceMappingURL=enum.d.ts.map