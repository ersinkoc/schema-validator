export type ParseResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: ValidationError;
};
export type AsyncParseResult<T> = Promise<ParseResult<T>>;
export interface ValidationIssue {
    code: string;
    message?: string;
    path: (string | number)[];
    expected?: string;
    received?: string;
    options?: Record<string, unknown>;
}
export declare class ValidationError extends Error {
    readonly issues: ValidationIssue[];
    readonly path: (string | number)[];
    readonly code: string;
    readonly expected?: string;
    readonly received?: string;
    constructor(issues: ValidationIssue | ValidationIssue[]);
    format(): string;
}
export interface SchemaDefinition<Input = any, Output = Input> {
    _input: Input;
    _output: Output;
    _type: string;
    parse(data: unknown): Output;
    parseAsync(data: unknown): Promise<Output>;
    safeParse(data: unknown): ParseResult<Output>;
    safeParseAsync(data: unknown): AsyncParseResult<Output>;
    optional(): SchemaDefinition<Input | undefined, Output | undefined>;
    nullable(): SchemaDefinition<Input | null, Output | null>;
    nullish(): SchemaDefinition<Input | null | undefined, Output | null | undefined>;
    array(): SchemaDefinition<Input[], Output[]>;
    promise(): SchemaDefinition<Promise<Input>, Promise<Output>>;
    or<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<Input | T, Output | T>;
    and<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<Input & T, Output & T>;
    transform<NewOutput>(fn: (value: Output) => NewOutput): SchemaDefinition<Input, NewOutput>;
    default(value: Output | (() => Output)): SchemaDefinition<Input | undefined, Output>;
    catch(value: Output | ((error: ValidationError) => Output)): SchemaDefinition<Input, Output>;
    refine(check: (value: Output) => boolean | Promise<boolean>, message?: string | ValidationIssue): SchemaDefinition<Input, Output>;
    superRefine<Ctx extends {
        addIssue: (issue: ValidationIssue) => void;
    }>(check: (value: Output, ctx: Ctx) => void | Promise<void>): SchemaDefinition<Input, Output>;
    describe(description: string): SchemaDefinition<Input, Output>;
    brand<B extends string | symbol>(): SchemaDefinition<Input, Output & {
        [brand]: B;
    }>;
    readonly(): SchemaDefinition<Input, Output>;
    isOptional(): boolean;
    isNullable(): boolean;
    isNullish(): boolean;
}
export declare const brand: unique symbol;
export type RefinementCtx = {
    addIssue: (issue: Omit<ValidationIssue, 'path'>) => void;
    path: (string | number)[];
};
export type ValidatorFunction<T = any> = (value: unknown, ctx: RefinementCtx) => T;
export type AsyncValidatorFunction<T = any> = (value: unknown, ctx: RefinementCtx) => Promise<T>;
export type TransformFunction<T = any, U = any> = (value: T) => U;
export interface SchemaOptions {
    errorMap?: (issue: ValidationIssue) => string;
    description?: string;
    strict?: boolean;
    coerce?: boolean;
}
export declare abstract class BaseSchema<Input = any, Output = Input> implements SchemaDefinition<Input, Output> {
    readonly _input: Input;
    readonly _output: Output;
    abstract readonly _type: string;
    protected _options: SchemaOptions;
    protected _checks: Array<any>;
    protected _transforms: Array<TransformFunction>;
    protected _isOptional: boolean;
    protected _isNullable: boolean;
    protected _default?: Output | (() => Output);
    protected _catch?: Output | ((error: ValidationError) => Output);
    protected _description?: string;
    constructor(options?: SchemaOptions);
    abstract _parse(input: unknown, ctx: any): Output;
    abstract _parseAsync(input: unknown, ctx: any): Promise<Output>;
    protected _processModifiers(data: unknown, _ctx: RefinementCtx): unknown;
    parse(data: unknown): Output;
    parseAsync(data: unknown): Promise<Output>;
    safeParse(data: unknown): ParseResult<Output>;
    safeParseAsync(data: unknown): AsyncParseResult<Output>;
    optional(): SchemaDefinition<Input | undefined, Output | undefined>;
    nullable(): SchemaDefinition<Input | null, Output | null>;
    nullish(): SchemaDefinition<Input | null | undefined, Output | null | undefined>;
    array(): SchemaDefinition<Input[], Output[]>;
    promise(): SchemaDefinition<Promise<Input>, Promise<Output>>;
    or<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<Input | T, Output | T>;
    and<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<Input & T, Output & T>;
    transform<NewOutput>(fn: (value: Output) => NewOutput): SchemaDefinition<Input, NewOutput>;
    default(value: Output | (() => Output)): SchemaDefinition<Input | undefined, Output>;
    catch(value: Output | ((error: ValidationError) => Output)): SchemaDefinition<Input, Output>;
    refine(check: (value: Output) => boolean | Promise<boolean>, message?: string | ValidationIssue): SchemaDefinition<Input, Output>;
    superRefine<Ctx extends {
        addIssue: (issue: ValidationIssue) => void;
    }>(check: (value: Output, ctx: Ctx) => void | Promise<void>): SchemaDefinition<Input, Output>;
    describe(description: string): SchemaDefinition<Input, Output>;
    brand<B extends string | symbol>(): SchemaDefinition<Input, Output & {
        [brand]: B;
    }>;
    readonly(): SchemaDefinition<Input, Output>;
    isOptional(): boolean;
    isNullable(): boolean;
    isNullish(): boolean;
}
//# sourceMappingURL=base.d.ts.map