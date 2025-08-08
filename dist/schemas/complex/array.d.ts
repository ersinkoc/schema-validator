import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
export interface ArrayChecks {
    kind: 'min' | 'max' | 'length' | 'nonempty';
    value?: number;
    message?: string;
}
export declare class ArraySchema<T> extends BaseSchema<T[], T[]> {
    readonly _type = "array";
    private _element;
    protected _checks: ArrayChecks[];
    constructor(element: SchemaDefinition<any, T>);
    _parse(input: unknown, ctx: ParseContext): T[];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T[]>;
    min(length: number, message?: string): ArraySchema<T>;
    max(length: number, message?: string): ArraySchema<T>;
    length(length: number, message?: string): ArraySchema<T>;
    nonempty(message?: string): ArraySchema<T>;
    get element(): SchemaDefinition<any, T>;
}
export declare function array<T>(element: SchemaDefinition<any, T>): ArraySchema<T>;
//# sourceMappingURL=array.d.ts.map