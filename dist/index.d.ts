type ParseResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: ValidationError;
};
type AsyncParseResult<T> = Promise<ParseResult<T>>;
interface ValidationIssue {
    code: string;
    message?: string;
    path: (string | number)[];
    expected?: string;
    received?: string;
    options?: Record<string, unknown>;
}
declare class ValidationError extends Error {
    readonly issues: ValidationIssue[];
    readonly path: (string | number)[];
    readonly code: string;
    readonly expected?: string;
    readonly received?: string;
    constructor(issues: ValidationIssue | ValidationIssue[]);
    format(): string;
}
interface SchemaDefinition<Input = any, Output = Input> {
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
        [brand$1]: B;
    }>;
    readonly(): SchemaDefinition<Input, Output>;
    isOptional(): boolean;
    isNullable(): boolean;
    isNullish(): boolean;
}
declare const brand$1: unique symbol;
type RefinementCtx = {
    addIssue: (issue: Omit<ValidationIssue, 'path'>) => void;
    path: (string | number)[];
};
type ValidatorFunction<T = any> = (value: unknown, ctx: RefinementCtx) => T;
type AsyncValidatorFunction<T = any> = (value: unknown, ctx: RefinementCtx) => Promise<T>;
type TransformFunction<T = any, U = any> = (value: T) => U;
interface SchemaOptions {
    errorMap?: (issue: ValidationIssue) => string;
    description?: string;
    strict?: boolean;
    coerce?: boolean;
}
declare abstract class BaseSchema<Input = any, Output = Input> implements SchemaDefinition<Input, Output> {
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
    abstract _parse(input: unknown, ctx: RefinementCtx): Output;
    abstract _parseAsync(input: unknown, ctx: RefinementCtx): Promise<Output>;
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
        [brand$1]: B;
    }>;
    readonly(): SchemaDefinition<Input, Output>;
    isOptional(): boolean;
    isNullable(): boolean;
    isNullish(): boolean;
}

type Infer<T extends SchemaDefinition<any, any>> = T['_output'];
type Input<T extends SchemaDefinition<any, any>> = T['_input'];
type TypeOf<T extends SchemaDefinition<any, any>> = Infer<T>;
type InputOf<T extends SchemaDefinition<any, any>> = Input<T>;
type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
type DeepRequired<T> = T extends object ? {
    [P in keyof T]-?: DeepRequired<T[P]>;
} : T;
type DeepReadonly<T> = T extends object ? {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
} : T;
type MergeShapes<A, B> = {
    [K in keyof A | keyof B]: K extends keyof B ? B[K] : K extends keyof A ? A[K] : never;
};
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
type Branded<T, B> = T & {
    __brand: B;
};
type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type IsUnion<T, U extends T = T> = T extends any ? [U] extends [T] ? false : true : never;
type IsOptional<T> = undefined extends T ? true : false;
type IsNullable<T> = null extends T ? true : false;
type IsNullish<T> = null extends T ? (undefined extends T ? true : false) : false;
type FilterOptional<T extends object> = {
    [K in keyof T as IsOptional<T[K]> extends true ? K : never]: T[K];
};
type FilterRequired<T extends object> = {
    [K in keyof T as IsOptional<T[K]> extends false ? K : never]: T[K];
};
type PickByValue<T, V> = {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};
type OmitByValue<T, V> = {
    [K in keyof T as T[K] extends V ? never : K]: T[K];
};
type RequiredKeys$1<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
type OptionalKeys$1<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
type GetType<T extends {
    _type: string;
}> = T['_type'];
type ValidatorContext = {
    path: (string | number)[];
    parent?: any;
    data?: any;
    parsedType?: string;
    schemaErrorMap?: Map<string, string>;
    contextualErrorMap?: Map<string, string>;
};
type ParsePath = (string | number)[];
type SafeParseSuccess<T> = {
    success: true;
    data: T;
};
type SafeParseError = {
    success: false;
    error: {
        issues: Array<{
            code: string;
            message: string;
            path: ParsePath;
        }>;
    };
};
type SafeParseReturnType<T> = SafeParseSuccess<T> | SafeParseError;

declare enum ErrorCode {
    INVALID_TYPE = "invalid_type",
    INVALID_LITERAL = "invalid_literal",
    CUSTOM = "custom",
    INVALID_UNION = "invalid_union",
    INVALID_UNION_DISCRIMINATOR = "invalid_union_discriminator",
    INVALID_ENUM_VALUE = "invalid_enum_value",
    UNRECOGNIZED_KEYS = "unrecognized_keys",
    INVALID_ARGUMENTS = "invalid_arguments",
    INVALID_RETURN_TYPE = "invalid_return_type",
    INVALID_DATE = "invalid_date",
    INVALID_STRING = "invalid_string",
    TOO_SMALL = "too_small",
    TOO_BIG = "too_big",
    INVALID_INTERSECTION_TYPES = "invalid_intersection_types",
    NOT_MULTIPLE_OF = "not_multiple_of",
    NOT_FINITE = "not_finite",
    INVALID_REGEX = "invalid_regex",
    INVALID_EMAIL = "invalid_email",
    INVALID_URL = "invalid_url",
    INVALID_UUID = "invalid_uuid",
    INVALID_CUID = "invalid_cuid",
    INVALID_DATETIME = "invalid_datetime",
    INVALID_IP = "invalid_ip",
    INVALID_JSON = "invalid_json",
    INVALID_BASE64 = "invalid_base64",
    REQUIRED = "required"
}
interface ErrorMapCtx {
    code: ErrorCode;
    message?: string;
    path: (string | number)[];
    input: any;
    expected?: string;
    received?: string;
    options?: Record<string, any>;
}
type ErrorMap = (ctx: ErrorMapCtx) => string;
declare const defaultErrorMap: ErrorMap;
type ParsedType = 'string' | 'number' | 'bigint' | 'boolean' | 'date' | 'symbol' | 'function' | 'undefined' | 'null' | 'array' | 'object' | 'unknown' | 'promise' | 'void' | 'never' | 'map' | 'set';
declare function getParsedType(data: any): ParsedType;

/**
 * Type guard utilities for runtime type checking
 */
/**
 * Create a type guard function from a schema
 */
declare function createGuard<T>(schema: SchemaDefinition<any, T>): (value: unknown) => value is T;
/**
 * Create an assertion function from a schema
 */
declare function createAssert<T>(schema: SchemaDefinition<any, T>): (value: unknown) => asserts value is T;
/**
 * Check if a value matches a schema
 */
declare function is<T>(schema: SchemaDefinition<any, T>, value: unknown): value is T;
/**
 * Assert that a value matches a schema
 */
declare function assert<T>(schema: SchemaDefinition<any, T>, value: unknown): asserts value is T;
/**
 * Type guard for checking if a value is a schema
 */
declare function isSchema(value: unknown): value is SchemaDefinition;
/**
 * Create a discriminated union guard
 */
declare function createDiscriminatedUnionGuard<T extends Record<K, string>, K extends keyof T>(discriminator: K, schemas: Record<T[K], SchemaDefinition<any, T>>): (value: unknown) => value is T;
/**
 * Create a union type guard
 */
declare function createUnionGuard<T extends readonly SchemaDefinition[]>(schemas: T): (value: unknown) => boolean;
/**
 * Create an intersection type guard
 */
declare function createIntersectionGuard<T extends readonly SchemaDefinition[]>(schemas: T): (value: unknown) => boolean;
/**
 * Narrow a union type based on a discriminator
 */
declare function narrow<T extends Record<K, string>, K extends keyof T, V extends T[K]>(value: T, discriminator: K, discriminatorValue: V): value is Extract<T, Record<K, V>>;

declare const guards_assert: typeof assert;
declare const guards_createAssert: typeof createAssert;
declare const guards_createDiscriminatedUnionGuard: typeof createDiscriminatedUnionGuard;
declare const guards_createGuard: typeof createGuard;
declare const guards_createIntersectionGuard: typeof createIntersectionGuard;
declare const guards_createUnionGuard: typeof createUnionGuard;
declare const guards_is: typeof is;
declare const guards_isSchema: typeof isSchema;
declare const guards_narrow: typeof narrow;
declare namespace guards {
  export {
    guards_assert as assert,
    guards_createAssert as createAssert,
    guards_createDiscriminatedUnionGuard as createDiscriminatedUnionGuard,
    guards_createGuard as createGuard,
    guards_createIntersectionGuard as createIntersectionGuard,
    guards_createUnionGuard as createUnionGuard,
    guards_is as is,
    guards_isSchema as isSchema,
    guards_narrow as narrow,
  };
}

interface ParseContext extends RefinementCtx {
    common: {
        issues: ValidationIssue[];
        async: boolean;
        errorMap: typeof defaultErrorMap;
        contextualErrorMap?: typeof defaultErrorMap;
    };
    parsedType: ReturnType<typeof getParsedType>;
    schemaErrorMap?: typeof defaultErrorMap;
    parent?: any;
    data: any;
    child(key: string | number, data: any): ParseContext;
    makeError(): ValidationError;
    hasIssues: boolean;
}

type ObjectShape = Record<string, SchemaDefinition<any, any>>;
interface ObjectConfig {
    strict?: boolean;
    strip?: boolean;
    passthrough?: boolean;
}
type OptionalKeys<T extends ObjectShape> = {
    [K in keyof T]: undefined extends T[K]['_output'] ? K : never;
}[keyof T];
type RequiredKeys<T extends ObjectShape> = {
    [K in keyof T]: undefined extends T[K]['_output'] ? never : K;
}[keyof T];
type ObjectOutput<T extends ObjectShape> = {
    [K in RequiredKeys<T>]: T[K]['_output'];
} & {
    [K in OptionalKeys<T>]?: T[K]['_output'];
};
type ObjectInput<T extends ObjectShape> = {
    [K in RequiredKeys<T>]: T[K]['_input'];
} & {
    [K in OptionalKeys<T>]?: T[K]['_input'];
};
declare class ObjectSchema<T extends ObjectShape = ObjectShape> extends BaseSchema<ObjectInput<T>, ObjectOutput<T>> {
    readonly _type = "object";
    readonly _shape: T;
    private _unknownKeys;
    private _catchall?;
    constructor(shape: T, config?: ObjectConfig);
    _parse(input: unknown, ctx: ParseContext): ObjectOutput<T>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<ObjectOutput<T>>;
    /**
     * Enable strict mode - unknown keys will cause validation to fail
     */
    strict(): ObjectSchema<T>;
    /**
     * Enable passthrough mode - unknown keys will be passed through to output
     */
    passthrough(): ObjectSchema<T>;
    /**
     * Enable strip mode - unknown keys will be silently removed (default)
     */
    strip(): ObjectSchema<T>;
    /**
     * Set a catchall schema for unknown keys
     */
    catchall<U>(schema: SchemaDefinition<any, U>): ObjectSchema<T & Record<string, U>>;
    /**
     * Pick specific keys from the shape
     */
    pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>>;
    /**
     * Omit specific keys from the shape
     */
    omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>>;
    /**
     * Make properties optional - all or specific keys
     */
    partial<K extends keyof T = keyof T>(keys?: K[]): ObjectSchema<any>;
    /**
     * Make properties required - all or specific keys
     */
    required<K extends keyof T = keyof T>(keys?: K[]): ObjectSchema<any>;
    /**
     * Merge with another object schema
     */
    merge<U extends ObjectShape>(other: ObjectSchema<U>): ObjectSchema<MergeShapes<T, U>>;
    /**
     * Extend with additional properties
     */
    extend<U extends ObjectShape>(extension: U): ObjectSchema<MergeShapes<T, U>>;
    /**
     * Get union type of all keys
     */
    keyof(): SchemaDefinition<keyof T, keyof T>;
    /**
     * Make object deeply partial
     */
    deepPartial(): ObjectSchema<{
        [K in keyof T]: SchemaDefinition<DeepPartial<T[K]['_input']>, DeepPartial<T[K]['_output']>>;
    }>;
    /**
     * Get the shape of the object
     */
    get shape(): T;
    /**
     * Get a specific property schema
     */
    get<K extends keyof T>(key: K): T[K];
}
/**
 * Create an object schema
 */
declare function object<T extends ObjectShape>(shape: T): ObjectSchema<T>;

interface ArrayChecks {
    kind: 'min' | 'max' | 'length' | 'nonempty';
    value?: number;
    message?: string;
}
declare class ArraySchema<T> extends BaseSchema<T[], T[]> {
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
declare function array<T>(element: SchemaDefinition<any, T>): ArraySchema<T>;

declare class UnionSchema<T extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]> extends BaseSchema<T[number]['_input'], T[number]['_output']> {
    readonly _type = "union";
    private _unionOptions;
    constructor(options: T);
    _parse(input: unknown, ctx: ParseContext): T[number]['_output'];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T[number]['_output']>;
    get options(): T;
}
declare function union<T extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]>(options: T): UnionSchema<T>;

/**
 * Schema introspection utilities for runtime analysis
 */
interface SchemaInfo {
    type: string;
    optional: boolean;
    nullable: boolean;
    description?: string;
    properties?: Record<string, SchemaInfo>;
    items?: SchemaInfo;
    options?: SchemaInfo[];
    constraints?: Record<string, any>;
}
/**
 * Get detailed information about a schema
 */
declare function introspect(schema: SchemaDefinition): SchemaInfo;
/**
 * Get the shape of an object schema
 */
declare function getShape<T extends ObjectSchema<any>>(schema: T): T extends ObjectSchema<infer S> ? S : never;
/**
 * Get the element type of an array schema
 */
declare function getElement<T extends ArraySchema<any>>(schema: T): T extends ArraySchema<infer E> ? E : never;
/**
 * Get the options of a union schema
 */
declare function getOptions<T extends UnionSchema<any>>(schema: T): T extends UnionSchema<infer O> ? O : never;
/**
 * Check if a schema has a specific modifier
 */
declare function hasModifier(schema: SchemaDefinition, modifier: 'optional' | 'nullable' | 'nullish' | 'default' | 'catch'): boolean;
/**
 * Get all property names from an object schema
 */
declare function getPropertyNames(schema: ObjectSchema<any>): string[];
/**
 * Get a specific property schema from an object schema
 */
declare function getProperty<T extends ObjectSchema<any>, K extends string>(schema: T, key: K): SchemaDefinition | undefined;
/**
 * Check if a schema is of a specific type
 */
declare function isType(schema: SchemaDefinition, type: string): boolean;
/**
 * Walk through a schema tree and apply a visitor function
 */
declare function walkSchema(schema: SchemaDefinition, visitor: (schema: SchemaDefinition, path: string[]) => void, path?: string[]): void;
/**
 * Generate a JSON Schema from a validator schema
 */
declare function toJsonSchema(schema: SchemaDefinition): any;

type introspection_SchemaInfo = SchemaInfo;
declare const introspection_getElement: typeof getElement;
declare const introspection_getOptions: typeof getOptions;
declare const introspection_getProperty: typeof getProperty;
declare const introspection_getPropertyNames: typeof getPropertyNames;
declare const introspection_getShape: typeof getShape;
declare const introspection_hasModifier: typeof hasModifier;
declare const introspection_introspect: typeof introspect;
declare const introspection_isType: typeof isType;
declare const introspection_toJsonSchema: typeof toJsonSchema;
declare const introspection_walkSchema: typeof walkSchema;
declare namespace introspection {
  export { introspection_getElement as getElement, introspection_getOptions as getOptions, introspection_getProperty as getProperty, introspection_getPropertyNames as getPropertyNames, introspection_getShape as getShape, introspection_hasModifier as hasModifier, introspection_introspect as introspect, introspection_isType as isType, introspection_toJsonSchema as toJsonSchema, introspection_walkSchema as walkSchema };
  export type { introspection_SchemaInfo as SchemaInfo };
}

/**
 * Custom error formatting utilities
 */
interface FormatOptions {
    /**
     * Include the full path in error messages
     */
    includePath?: boolean;
    /**
     * Include error codes
     */
    includeCode?: boolean;
    /**
     * Include expected/received types
     */
    includeTypes?: boolean;
    /**
     * Indentation for nested errors
     */
    indent?: string;
    /**
     * Maximum depth for nested errors
     */
    maxDepth?: number;
    /**
     * Custom message formatter
     */
    messageFormatter?: (issue: ValidationIssue) => string;
    /**
     * Color output (for terminal)
     */
    colors?: boolean;
}
/**
 * Format a validation error as a human-readable string
 */
declare function formatError(error: ValidationError, options?: FormatOptions): string;
/**
 * Format error as JSON
 */
declare function formatErrorAsJson(error: ValidationError, pretty?: boolean): string;
/**
 * Format error as a table (for terminal output)
 */
declare function formatErrorAsTable(error: ValidationError): string;
/**
 * Format error as Markdown
 */
declare function formatErrorAsMarkdown(error: ValidationError): string;
/**
 * Create a custom error formatter
 */
declare function createFormatter(template: string, variables?: Record<string, (issue: ValidationIssue) => string>): (issue: ValidationIssue) => string;
/**
 * Get a summary of validation errors
 */
declare function getErrorSummary(error: ValidationError): {
    totalIssues: number;
    issuesByCode: Record<string, number>;
    affectedPaths: string[];
};
/**
 * Filter validation issues by criteria
 */
declare function filterIssues(error: ValidationError, filter: {
    code?: string;
    path?: string[];
    minDepth?: number;
    maxDepth?: number;
}): ValidationIssue[];

type errorFormatter_FormatOptions = FormatOptions;
declare const errorFormatter_createFormatter: typeof createFormatter;
declare const errorFormatter_filterIssues: typeof filterIssues;
declare const errorFormatter_formatError: typeof formatError;
declare const errorFormatter_formatErrorAsJson: typeof formatErrorAsJson;
declare const errorFormatter_formatErrorAsMarkdown: typeof formatErrorAsMarkdown;
declare const errorFormatter_formatErrorAsTable: typeof formatErrorAsTable;
declare const errorFormatter_getErrorSummary: typeof getErrorSummary;
declare namespace errorFormatter {
  export { errorFormatter_createFormatter as createFormatter, errorFormatter_filterIssues as filterIssues, errorFormatter_formatError as formatError, errorFormatter_formatErrorAsJson as formatErrorAsJson, errorFormatter_formatErrorAsMarkdown as formatErrorAsMarkdown, errorFormatter_formatErrorAsTable as formatErrorAsTable, errorFormatter_getErrorSummary as getErrorSummary };
  export type { errorFormatter_FormatOptions as FormatOptions };
}

/**
 * Schema composition utilities for building complex schemas
 */
/**
 * Compose multiple schemas into a union (OR)
 */
declare function or<T extends readonly SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Compose multiple schemas into an intersection (AND)
 */
declare function and<T extends SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Create a conditional schema based on a discriminator
 */
declare function conditional<T extends Record<string, any>>(_discriminator: keyof T, cases: Record<string, SchemaDefinition>): SchemaDefinition;
/**
 * Create a recursive schema
 */
declare function recursive<T>(definition: (self: SchemaDefinition<T, T>) => SchemaDefinition<T, T>): SchemaDefinition<T, T>;
/**
 * Merge multiple object schemas
 */
declare function mergeObjects<T extends ObjectSchema<any>[]>(...schemas: T): ObjectSchema<any>;
/**
 * Create a pipeline of transformations
 */
declare function pipeline$1<T extends SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Create a schema that coerces input to the expected type
 */
declare function coerce<T>(targetSchema: SchemaDefinition<any, T>, coercer: (input: unknown) => unknown): SchemaDefinition<unknown, T>;
/**
 * Create a schema with a fallback value on parse error
 */
declare function withFallback<T>(schema: SchemaDefinition<any, T>, fallback: T | ((error: any) => T)): SchemaDefinition<unknown, T>;
/**
 * Create a schema that preprocesses input before validation
 */
declare function preprocess$1<T>(preprocessor: (input: unknown) => unknown, schema: SchemaDefinition<any, T>): SchemaDefinition<unknown, T>;
/**
 * Create a schema that postprocesses output after validation
 */
declare function postprocess<T, U>(schema: SchemaDefinition<any, T>, postprocessor: (output: T) => U): SchemaDefinition<any, U>;
/**
 * Create a nullable version of a schema
 */
declare function nullable<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<any, T | null>;
/**
 * Create an optional version of a schema
 */
declare function optional<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<any, T | undefined>;
/**
 * Create a nullish version of a schema
 */
declare function nullish<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<any, T | null | undefined>;
/**
 * Create a schema with a default value
 */
declare function withDefault<T>(schema: SchemaDefinition<any, T>, defaultValue: T | (() => T)): SchemaDefinition<any, T>;
/**
 * Create a branded type schema
 */
declare function brand<T, B extends string | symbol>(schema: SchemaDefinition<any, T>, _brand: B): SchemaDefinition<any, T & {
    _brand: B;
}>;
/**
 * Create a readonly version of a schema
 */
declare function readonly<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<any, Readonly<T>>;
/**
 * Create a lazy-evaluated schema
 */
declare function defer<T>(schemaFn: () => SchemaDefinition<any, T>): SchemaDefinition<any, T>;
/**
 * Create a schema that validates against multiple schemas
 * and returns the first successful result
 */
declare function firstOf<T extends readonly SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Create a schema that validates all items in a tuple
 */
declare function allOf<T extends readonly SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Extend an object schema with additional properties
 */
declare function extend<T extends ObjectSchema<any>, U extends Record<string, SchemaDefinition>>(baseSchema: T, extension: U): ObjectSchema<any>;
/**
 * Pick specific properties from an object schema
 */
declare function pick<T extends ObjectSchema<any>, K extends string>(schema: T, keys: K[]): ObjectSchema<any>;
/**
 * Omit specific properties from an object schema
 */
declare function omit<T extends ObjectSchema<any>, K extends string>(schema: T, keys: K[]): ObjectSchema<any>;
/**
 * Make all properties of an object schema optional
 */
declare function partial<T extends ObjectSchema<any>>(schema: T): ObjectSchema<any>;
/**
 * Make all properties of an object schema required
 */
declare function required<T extends ObjectSchema<any>>(schema: T): ObjectSchema<any>;
/**
 * Create a deep partial version of an object schema
 */
declare function deepPartial<T extends ObjectSchema<any>>(schema: T): ObjectSchema<any>;

declare const composition_allOf: typeof allOf;
declare const composition_and: typeof and;
declare const composition_brand: typeof brand;
declare const composition_coerce: typeof coerce;
declare const composition_conditional: typeof conditional;
declare const composition_deepPartial: typeof deepPartial;
declare const composition_defer: typeof defer;
declare const composition_extend: typeof extend;
declare const composition_firstOf: typeof firstOf;
declare const composition_mergeObjects: typeof mergeObjects;
declare const composition_nullable: typeof nullable;
declare const composition_nullish: typeof nullish;
declare const composition_omit: typeof omit;
declare const composition_optional: typeof optional;
declare const composition_or: typeof or;
declare const composition_partial: typeof partial;
declare const composition_pick: typeof pick;
declare const composition_postprocess: typeof postprocess;
declare const composition_readonly: typeof readonly;
declare const composition_recursive: typeof recursive;
declare const composition_required: typeof required;
declare const composition_withDefault: typeof withDefault;
declare const composition_withFallback: typeof withFallback;
declare namespace composition {
  export {
    composition_allOf as allOf,
    composition_and as and,
    composition_brand as brand,
    composition_coerce as coerce,
    composition_conditional as conditional,
    composition_deepPartial as deepPartial,
    composition_defer as defer,
    composition_extend as extend,
    composition_firstOf as firstOf,
    composition_mergeObjects as mergeObjects,
    composition_nullable as nullable,
    composition_nullish as nullish,
    composition_omit as omit,
    composition_optional as optional,
    composition_or as or,
    composition_partial as partial,
    composition_pick as pick,
    pipeline$1 as pipeline,
    composition_postprocess as postprocess,
    preprocess$1 as preprocess,
    composition_readonly as readonly,
    composition_recursive as recursive,
    composition_required as required,
    composition_withDefault as withDefault,
    composition_withFallback as withFallback,
  };
}

/**
 * Metadata keys
 */
declare const MetadataKeys: {
    readonly DESCRIPTION: symbol;
    readonly EXAMPLE: symbol;
    readonly DEPRECATED: symbol;
    readonly VERSION: symbol;
    readonly TAGS: symbol;
    readonly DOCUMENTATION: symbol;
    readonly SOURCE: symbol;
    readonly AUTHOR: symbol;
    readonly CREATED: symbol;
    readonly MODIFIED: symbol;
    readonly CUSTOM: symbol;
};
/**
 * Set metadata on a schema
 */
declare function setMetadata<T extends SchemaDefinition>(schema: T, key: string | symbol, value: any): T;
/**
 * Get metadata from a schema
 */
declare function getMetadata<T = any>(schema: SchemaDefinition, key: string | symbol): T | undefined;
/**
 * Check if a schema has metadata
 */
declare function hasMetadata(schema: SchemaDefinition, key: string | symbol): boolean;
/**
 * Delete metadata from a schema
 */
declare function deleteMetadata(schema: SchemaDefinition, key: string | symbol): boolean;
/**
 * Get all metadata for a schema
 */
declare function getAllMetadata(schema: SchemaDefinition): Map<string | symbol, any> | undefined;
/**
 * Copy metadata from one schema to another
 */
declare function copyMetadata(source: SchemaDefinition, target: SchemaDefinition): void;
/**
 * Clear all metadata for a schema
 */
declare function clearMetadata(schema: SchemaDefinition): void;
/**
 * Merge metadata from multiple schemas
 */
declare function mergeMetadata(target: SchemaDefinition, ...sources: SchemaDefinition[]): void;
/**
 * Schema metadata decorator functions
 */
/**
 * Add a description to a schema
 */
declare function describe<T extends SchemaDefinition>(schema: T, description: string): T;
/**
 * Add an example to a schema
 */
declare function example<T extends SchemaDefinition>(schema: T, example: any): T;
/**
 * Mark a schema as deprecated
 */
declare function deprecate<T extends SchemaDefinition>(schema: T, reason?: string): T;
/**
 * Add version information to a schema
 */
declare function version<T extends SchemaDefinition>(schema: T, version: string): T;
/**
 * Add tags to a schema
 */
declare function tag<T extends SchemaDefinition>(schema: T, ...tags: string[]): T;
/**
 * Add documentation link to a schema
 */
declare function document<T extends SchemaDefinition>(schema: T, url: string): T;
/**
 * Add source information to a schema
 */
declare function source<T extends SchemaDefinition>(schema: T, source: string): T;
/**
 * Add author information to a schema
 */
declare function author<T extends SchemaDefinition>(schema: T, author: string | {
    name: string;
    email?: string;
}): T;
/**
 * Add creation timestamp to a schema
 */
declare function created<T extends SchemaDefinition>(schema: T, date?: Date): T;
/**
 * Add modification timestamp to a schema
 */
declare function modified<T extends SchemaDefinition>(schema: T, date?: Date): T;
/**
 * Add custom metadata to a schema
 */
declare function custom<T extends SchemaDefinition>(schema: T, data: Record<string, any>): T;
/**
 * Create a metadata-enhanced schema builder
 */
declare function withMetadata<T extends SchemaDefinition>(schema: T, metadata: {
    description?: string;
    example?: any;
    deprecated?: boolean | string;
    version?: string;
    tags?: string[];
    documentation?: string;
    source?: string;
    author?: string | {
        name: string;
        email?: string;
    };
    custom?: Record<string, any>;
}): T;
/**
 * Extract metadata summary from a schema
 */
declare function getMetadataSummary(schema: SchemaDefinition): {
    description?: string;
    example?: any;
    deprecated?: {
        deprecated: boolean;
        reason?: string;
    };
    version?: string;
    tags?: string[];
    documentation?: string;
    source?: string;
    author?: string | {
        name: string;
        email?: string;
    };
    created?: Date;
    modified?: Date;
    custom?: Record<string, any>;
};

declare const metadata_MetadataKeys: typeof MetadataKeys;
declare const metadata_author: typeof author;
declare const metadata_clearMetadata: typeof clearMetadata;
declare const metadata_copyMetadata: typeof copyMetadata;
declare const metadata_created: typeof created;
declare const metadata_custom: typeof custom;
declare const metadata_deleteMetadata: typeof deleteMetadata;
declare const metadata_deprecate: typeof deprecate;
declare const metadata_describe: typeof describe;
declare const metadata_document: typeof document;
declare const metadata_example: typeof example;
declare const metadata_getAllMetadata: typeof getAllMetadata;
declare const metadata_getMetadata: typeof getMetadata;
declare const metadata_getMetadataSummary: typeof getMetadataSummary;
declare const metadata_hasMetadata: typeof hasMetadata;
declare const metadata_mergeMetadata: typeof mergeMetadata;
declare const metadata_modified: typeof modified;
declare const metadata_setMetadata: typeof setMetadata;
declare const metadata_source: typeof source;
declare const metadata_tag: typeof tag;
declare const metadata_version: typeof version;
declare const metadata_withMetadata: typeof withMetadata;
declare namespace metadata {
  export {
    metadata_MetadataKeys as MetadataKeys,
    metadata_author as author,
    metadata_clearMetadata as clearMetadata,
    metadata_copyMetadata as copyMetadata,
    metadata_created as created,
    metadata_custom as custom,
    metadata_deleteMetadata as deleteMetadata,
    metadata_deprecate as deprecate,
    metadata_describe as describe,
    metadata_document as document,
    metadata_example as example,
    metadata_getAllMetadata as getAllMetadata,
    metadata_getMetadata as getMetadata,
    metadata_getMetadataSummary as getMetadataSummary,
    metadata_hasMetadata as hasMetadata,
    metadata_mergeMetadata as mergeMetadata,
    metadata_modified as modified,
    metadata_setMetadata as setMetadata,
    metadata_source as source,
    metadata_tag as tag,
    metadata_version as version,
    metadata_withMetadata as withMetadata,
  };
}

interface StringChecks {
    kind: 'min' | 'max' | 'length' | 'email' | 'url' | 'uuid' | 'cuid' | 'regex' | 'includes' | 'startsWith' | 'endsWith' | 'datetime' | 'ip' | 'base64' | 'trim' | 'toLowerCase' | 'toUpperCase';
    value?: any;
    message?: string;
}
declare class StringSchema extends BaseSchema<string, string> {
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
declare function string(options?: {
    coerce?: boolean;
}): StringSchema;

interface NumberChecks {
    kind: 'min' | 'max' | 'int' | 'positive' | 'negative' | 'nonpositive' | 'nonnegative' | 'multipleOf' | 'finite' | 'safe';
    value?: number;
    inclusive?: boolean;
    message?: string;
}
declare class NumberSchema extends BaseSchema<number, number> {
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
declare function number(options?: {
    coerce?: boolean;
}): NumberSchema;

declare class BooleanSchema extends BaseSchema<boolean, boolean> {
    readonly _type = "boolean";
    private _coerce;
    constructor(options?: {
        coerce?: boolean;
    });
    _parse(input: unknown, ctx: ParseContext): boolean;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<boolean>;
}
declare function boolean(options?: {
    coerce?: boolean;
}): BooleanSchema;

interface DateChecks {
    kind: 'min' | 'max';
    value: Date;
    inclusive?: boolean;
    message?: string;
}
declare class DateSchema extends BaseSchema<Date, Date> {
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
declare function date(options?: {
    coerce?: boolean;
}): DateSchema;

interface BigIntChecks {
    kind: 'min' | 'max' | 'positive' | 'negative' | 'nonpositive' | 'nonnegative' | 'multipleOf';
    value?: bigint;
    inclusive?: boolean;
    message?: string;
}
declare class BigIntSchema extends BaseSchema<bigint, bigint> {
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
declare function bigint(options?: {
    coerce?: boolean;
}): BigIntSchema;

declare class SymbolSchema extends BaseSchema<symbol, symbol> {
    readonly _type = "symbol";
    _parse(input: unknown, ctx: ParseContext): symbol;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<symbol>;
}
declare function symbol(): SymbolSchema;

type Literal = string | number | boolean | null | undefined | symbol | bigint;
declare class LiteralSchema<T extends Literal> extends BaseSchema<T, T> {
    readonly _type = "literal";
    private _value;
    constructor(value: T);
    _parse(input: unknown, ctx: ParseContext): T;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T>;
    get value(): T;
}
declare function literal<T extends Literal>(value: T): LiteralSchema<T>;

declare class UndefinedSchema extends BaseSchema<undefined, undefined> {
    readonly _type = "undefined";
    _parse(input: unknown, ctx: ParseContext): undefined;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<undefined>;
}

declare function undefinedSchema(): UndefinedSchema;

declare class NullSchema extends BaseSchema<null, null> {
    readonly _type = "null";
    _parse(input: unknown, ctx: ParseContext): null;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<null>;
}

declare function nullSchema(): NullSchema;

declare class AnySchema extends BaseSchema<any, any> {
    readonly _type = "any";
    _parse(input: unknown, _ctx: ParseContext): any;
    _parseAsync(input: unknown, _ctx: ParseContext): Promise<any>;
}
declare function any(): AnySchema;

declare class UnknownSchema extends BaseSchema<unknown, unknown> {
    readonly _type = "unknown";
    _parse(input: unknown, _ctx: ParseContext): unknown;
    _parseAsync(input: unknown, _ctx: ParseContext): Promise<unknown>;
}
declare function unknown(): UnknownSchema;

declare class NeverSchema extends BaseSchema<never, never> {
    readonly _type = "never";
    _parse(_input: unknown, ctx: ParseContext): never;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<never>;
}
declare function never(): NeverSchema;

declare class VoidSchema extends BaseSchema<void, void> {
    readonly _type = "void";
    _parse(input: unknown, ctx: ParseContext): void;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<void>;
}

declare function voidSchema(): VoidSchema;

declare class NanSchema extends BaseSchema<number, number> {
    readonly _type = "nan";
    _parse(input: unknown, ctx: ParseContext): number;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<number>;
}
declare function nan(): NanSchema;

declare class RecordSchema<K extends SchemaDefinition<any, any>, V extends SchemaDefinition<any, any>> extends BaseSchema<Record<string, V['_input']>, Record<string, V['_output']>> {
    readonly _type = "record";
    readonly _keySchema: K;
    readonly _valueSchema: V;
    constructor(keySchema: K, valueSchema: V);
    _parse(input: unknown, ctx: ParseContext): Record<string, V['_output']>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Record<string, V['_output']>>;
}
declare function record<K extends SchemaDefinition<any, any>, V extends SchemaDefinition<any, any>>(keySchema: K, valueSchema: V): RecordSchema<K, V>;

type TupleItems = readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]];
type TupleRestItem = SchemaDefinition<any, any> | null;
type InferTupleInput<T extends TupleItems, Rest extends TupleRestItem> = Rest extends SchemaDefinition<any, any> ? [...{
    [K in keyof T]: T[K]['_input'];
}, ...Rest['_input'][]] : {
    [K in keyof T]: T[K]['_input'];
};
type InferTupleOutput<T extends TupleItems, Rest extends TupleRestItem> = Rest extends SchemaDefinition<any, any> ? [...{
    [K in keyof T]: T[K]['_output'];
}, ...Rest['_output'][]] : {
    [K in keyof T]: T[K]['_output'];
};
declare class TupleSchema<T extends TupleItems, Rest extends TupleRestItem = null> extends BaseSchema<InferTupleInput<T, Rest>, InferTupleOutput<T, Rest>> {
    readonly _type = "tuple";
    private _items;
    private _rest;
    constructor(items: T, rest?: Rest);
    _parse(input: unknown, ctx: ParseContext): InferTupleOutput<T, Rest>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<InferTupleOutput<T, Rest>>;
    rest<R extends SchemaDefinition<any, any>>(schema: R): TupleSchema<T, R>;
    get items(): T;
}
declare function tuple<T extends TupleItems>(items: T): TupleSchema<T, null>;

declare class IntersectionSchema<A extends SchemaDefinition<any, any>, B extends SchemaDefinition<any, any>> extends BaseSchema<A['_input'] & B['_input'], A['_output'] & B['_output']> {
    readonly _type = "intersection";
    private _left;
    private _right;
    constructor(left: A, right: B);
    _parse(input: unknown, ctx: ParseContext): A['_output'] & B['_output'];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<A['_output'] & B['_output']>;
}
declare function intersection<A extends SchemaDefinition<any, any>, B extends SchemaDefinition<any, any>>(left: A, right: B): IntersectionSchema<A, B>;

declare class DiscriminatedUnionSchema<Discriminator extends string, Options extends readonly ObjectSchema<any>[]> extends BaseSchema<Options[number]['_input'], Options[number]['_output']> {
    readonly _type = "discriminatedUnion";
    private _discriminator;
    private _unionOptions;
    private _optionsByDiscriminator;
    constructor(discriminator: Discriminator, options: Options);
    private extractLiteralValue;
    _parse(input: unknown, ctx: ParseContext): Options[number]['_output'];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Options[number]['_output']>;
    get discriminator(): Discriminator;
    get options(): Options;
}
declare function discriminatedUnion<Discriminator extends string, Options extends readonly ObjectSchema<any>[]>(discriminator: Discriminator, options: Options): DiscriminatedUnionSchema<Discriminator, Options>;

declare class MapSchema<K, V> extends BaseSchema<Map<K, V>, Map<K, V>> {
    readonly _type = "map";
    private _keySchema;
    private _valueSchema;
    constructor(keySchema: SchemaDefinition<any, K>, valueSchema: SchemaDefinition<any, V>);
    _parse(input: unknown, ctx: ParseContext): Map<K, V>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Map<K, V>>;
    get keySchema(): SchemaDefinition<any, K>;
    get valueSchema(): SchemaDefinition<any, V>;
}
declare function map<K, V>(keySchema: SchemaDefinition<any, K>, valueSchema: SchemaDefinition<any, V>): MapSchema<K, V>;

declare class SetSchema<T> extends BaseSchema<Set<T>, Set<T>> {
    readonly _type = "set";
    private _element;
    constructor(element: SchemaDefinition<any, T>);
    _parse(input: unknown, ctx: ParseContext): Set<T>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Set<T>>;
    get element(): SchemaDefinition<any, T>;
}
declare function set<T>(element: SchemaDefinition<any, T>): SetSchema<T>;

declare class LazySchema<T> extends BaseSchema<T, T> {
    readonly _type = "lazy";
    private _getter;
    private _cached?;
    constructor(getter: () => SchemaDefinition<T, T>);
    private get schema();
    _parse(input: unknown, ctx: ParseContext): T;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T>;
}
declare function lazy<T>(getter: () => SchemaDefinition<T, T>): LazySchema<T>;

declare class PromiseSchema<T> extends BaseSchema<Promise<T>, Promise<T>> {
    readonly _type = "promise";
    private _schema;
    constructor(schema: SchemaDefinition<any, T>);
    _parse(input: unknown, ctx: ParseContext): Promise<T>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Promise<T>>;
    get schema(): SchemaDefinition<any, T>;
}
declare function promise<T>(schema: SchemaDefinition<any, T>): PromiseSchema<T>;

declare class EnumSchema<T extends readonly [string, ...string[]]> extends BaseSchema<T[number], T[number]> {
    readonly _type = "enum";
    private _values;
    private _enumValues;
    constructor(values: T);
    _parse(input: unknown, ctx: ParseContext): T[number];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T[number]>;
    get values(): T;
    get options(): T[number][];
}
declare function enumSchema<T extends readonly [string, ...string[]]>(values: T): EnumSchema<T>;
declare class NativeEnumSchema<T extends Record<string, string | number>> extends BaseSchema<T[keyof T], T[keyof T]> {
    readonly _type = "nativeEnum";
    private _enum;
    private _enumValues;
    constructor(enumObject: T);
    _parse(input: unknown, ctx: ParseContext): T[keyof T];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<T[keyof T]>;
    get enum(): T;
    get options(): T[keyof T][];
}
declare function nativeEnum<T extends Record<string, string | number>>(enumObject: T): NativeEnumSchema<T>;

declare class FunctionSchema<Args extends readonly SchemaDefinition<any, any>[], Returns extends SchemaDefinition<any, any> | undefined = undefined> extends BaseSchema<(...args: {
    [K in keyof Args]: Args[K]['_input'];
}) => Returns extends SchemaDefinition<any, any> ? Returns['_output'] : any, (...args: {
    [K in keyof Args]: Args[K]['_input'];
}) => Returns extends SchemaDefinition<any, any> ? Returns['_output'] : any> {
    readonly _type = "function";
    private _args?;
    private _returns?;
    private _implement?;
    constructor(args?: Args, returns?: Returns);
    _parse(input: unknown, ctx: ParseContext): any;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<any>;
    args<NewArgs extends readonly SchemaDefinition<any, any>[]>(...schemas: NewArgs): FunctionSchema<NewArgs, Returns>;
    returns<NewReturns extends SchemaDefinition<any, any>>(schema: NewReturns): FunctionSchema<Args, NewReturns>;
    implement(fn: Function): FunctionSchema<Args, Returns>;
}
declare function functionSchema(): FunctionSchema<[], undefined>;

declare class PreprocessSchema<Input, PreprocessedInput, Output> extends BaseSchema<Input, Output> {
    readonly _type = "preprocess";
    private _preprocessor;
    private _schema;
    constructor(preprocessor: (value: unknown) => PreprocessedInput, schema: SchemaDefinition<PreprocessedInput, Output>);
    _parse(input: unknown, ctx: ParseContext): Output;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Output>;
}
declare function preprocess<PreprocessedInput, Output>(preprocessor: (value: unknown) => PreprocessedInput, schema: SchemaDefinition<PreprocessedInput, Output>): PreprocessSchema<unknown, PreprocessedInput, Output>;

type ExtractInput<T> = T extends SchemaDefinition<infer I, any> ? I : never;
type ExtractOutput<T> = T extends SchemaDefinition<any, infer O> ? O : never;
declare class PipelineSchema<Schemas extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]> extends BaseSchema<ExtractInput<Schemas[0]>, ExtractOutput<Schemas[number]>> {
    readonly _type = "pipeline";
    private _schemas;
    constructor(schemas: Schemas);
    _parse(input: unknown, ctx: ParseContext): ExtractOutput<Schemas[number]>;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<ExtractOutput<Schemas[number]>>;
    get schemas(): Schemas;
}
declare function pipeline<Schemas extends readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]]>(...schemas: Schemas): PipelineSchema<Schemas>;

type EffectCallback<T> = (value: T, ctx: RefinementCtx & {
    addIssue: (issue: any) => void;
    path: (string | number)[];
}) => void | Promise<void>;
declare class EffectsSchema<Input, Output> extends BaseSchema<Input, Output> {
    readonly _type = "effects";
    private _schema;
    private _effect;
    constructor(schema: SchemaDefinition<Input, Output>, effect: EffectCallback<Output>);
    _parse(input: unknown, ctx: ParseContext): Output;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Output>;
}
declare function effects<Input, Output>(schema: SchemaDefinition<Input, Output>, effect: EffectCallback<Output>): EffectsSchema<Input, Output>;

type Schema<T = any> = SchemaDefinition<T, T>;

declare const v: {
    string: typeof string;
    number: typeof number;
    boolean: typeof boolean;
    date: typeof date;
    bigint: typeof bigint;
    symbol: typeof symbol;
    literal: typeof literal;
    undefined: typeof undefinedSchema;
    null: typeof nullSchema;
    any: typeof any;
    unknown: typeof unknown;
    never: typeof never;
    void: typeof voidSchema;
    nan: typeof nan;
    array: typeof array;
    object: typeof object;
    record: typeof record;
    union: typeof union;
    tuple: typeof tuple;
    intersection: typeof intersection;
    discriminatedUnion: typeof discriminatedUnion;
    map: typeof map;
    set: typeof set;
    lazy: typeof lazy;
    promise: typeof promise;
    enum: typeof enumSchema;
    nativeEnum: typeof nativeEnum;
    function: typeof functionSchema;
    preprocess: typeof preprocess;
    pipeline: typeof pipeline;
    effects: typeof effects;
    coerce: {
        string: (options?: any) => StringSchema;
        number: (options?: any) => NumberSchema;
        boolean: (options?: any) => BooleanSchema;
        date: (options?: any) => DateSchema;
        bigint: (options?: any) => BigIntSchema;
    };
    use: (plugin: any) => void;
    is: typeof is;
    assert: typeof assert;
    createGuard: typeof createGuard;
    createAssert: typeof createAssert;
    introspect: typeof introspect;
    toJsonSchema: typeof toJsonSchema;
    formatError: typeof formatError;
    compose: {
        or: typeof or;
        and: typeof and;
        conditional: typeof conditional;
        recursive: typeof recursive;
        pipeline: typeof pipeline$1;
        coerce: typeof coerce;
        withFallback: typeof withFallback;
        preprocess: typeof preprocess$1;
        postprocess: typeof postprocess;
        nullable: typeof nullable;
        optional: typeof optional;
        nullish: typeof nullish;
        withDefault: typeof withDefault;
        brand: typeof brand;
        readonly: typeof readonly;
        defer: typeof defer;
        firstOf: typeof firstOf;
        allOf: typeof allOf;
        extend: typeof extend;
        pick: typeof pick;
        omit: typeof omit;
        partial: typeof partial;
        required: typeof required;
        deepPartial: typeof deepPartial;
        mergeObjects: typeof mergeObjects;
    };
    metadata: {
        set: typeof setMetadata;
        get: typeof getMetadata;
        has: typeof hasMetadata;
        delete: typeof deleteMetadata;
        clear: typeof clearMetadata;
        describe: typeof describe;
        example: typeof example;
        deprecate: typeof deprecate;
        version: typeof version;
        tag: typeof tag;
        document: typeof document;
        withMetadata: typeof withMetadata;
        getSummary: typeof getMetadataSummary;
    };
};

export { AnySchema, ArraySchema, BaseSchema, BigIntSchema, BooleanSchema, DateSchema, DiscriminatedUnionSchema, EffectsSchema, EnumSchema, ErrorCode, FunctionSchema, IntersectionSchema, LazySchema, LiteralSchema, MapSchema, NanSchema, NativeEnumSchema, NeverSchema, NullSchema, NumberSchema, ObjectSchema, PipelineSchema, PreprocessSchema, PromiseSchema, RecordSchema, SetSchema, StringSchema, SymbolSchema, TupleSchema, UndefinedSchema, UnionSchema, UnknownSchema, ValidationError, VoidSchema, any, array, bigint, boolean, brand$1 as brand, composition, date, v as default, defaultErrorMap, discriminatedUnion, effects, enumSchema, errorFormatter, functionSchema, getParsedType, guards, intersection, introspection, lazy, literal, map, metadata, nan, nativeEnum, never, nullSchema, number, object, pipeline, preprocess, promise, record, set, string, symbol, tuple, undefinedSchema, union, unknown, v, voidSchema };
export type { AsyncParseResult, AsyncValidatorFunction, Branded, DeepPartial, DeepReadonly, DeepRequired, ErrorMap, ErrorMapCtx, FilterOptional, FilterRequired, GetType, Infer, Input, InputOf, IsNullable, IsNullish, IsOptional, IsUnion, MergeShapes, OmitByValue, OptionalKeys$1 as OptionalKeys, ParsePath, ParseResult, ParsedType, PickByValue, Primitive, RefinementCtx, RequiredKeys$1 as RequiredKeys, SafeParseError, SafeParseReturnType, SafeParseSuccess, Schema, SchemaDefinition, SchemaOptions, TransformFunction, TypeOf, UnionToIntersection, ValidationIssue, ValidatorContext, ValidatorFunction, Writeable };
