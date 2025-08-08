import { SchemaDefinition } from '../types/base';
import { ObjectSchema } from '../schemas/complex/object';
/**
 * Schema composition utilities for building complex schemas
 */
/**
 * Compose multiple schemas into a union (OR)
 */
export declare function or<T extends readonly SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Compose multiple schemas into an intersection (AND)
 */
export declare function and<T extends SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Create a conditional schema based on a discriminator
 */
export declare function conditional<T extends Record<string, any>>(_discriminator: keyof T, cases: Record<string, SchemaDefinition>): SchemaDefinition;
/**
 * Create a recursive schema
 */
export declare function recursive<T>(definition: (self: SchemaDefinition<T, T>) => SchemaDefinition<T, T>): SchemaDefinition<T, T>;
/**
 * Merge multiple object schemas
 */
export declare function mergeObjects<T extends ObjectSchema<any>[]>(...schemas: T): ObjectSchema<any>;
/**
 * Create a pipeline of transformations
 */
export declare function pipeline<T extends SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Create a schema that coerces input to the expected type
 */
export declare function coerce<T>(targetSchema: SchemaDefinition<any, T>, coercer: (input: unknown) => unknown): SchemaDefinition<unknown, T>;
/**
 * Create a schema with a fallback value on parse error
 */
export declare function withFallback<T>(schema: SchemaDefinition<any, T>, fallback: T | ((error: any) => T)): SchemaDefinition<unknown, T>;
/**
 * Create a schema that preprocesses input before validation
 */
export declare function preprocess<T>(preprocessor: (input: unknown) => unknown, schema: SchemaDefinition<any, T>): SchemaDefinition<unknown, T>;
/**
 * Create a schema that postprocesses output after validation
 */
export declare function postprocess<T, U>(schema: SchemaDefinition<any, T>, postprocessor: (output: T) => U): SchemaDefinition<any, U>;
/**
 * Create a nullable version of a schema
 */
export declare function nullable<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<any, T | null>;
/**
 * Create an optional version of a schema
 */
export declare function optional<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<any, T | undefined>;
/**
 * Create a nullish version of a schema
 */
export declare function nullish<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<any, T | null | undefined>;
/**
 * Create a schema with a default value
 */
export declare function withDefault<T>(schema: SchemaDefinition<any, T>, defaultValue: T | (() => T)): SchemaDefinition<any, T>;
/**
 * Create a branded type schema
 */
export declare function brand<T, B extends string | symbol>(schema: SchemaDefinition<any, T>, _brand: B): SchemaDefinition<any, T & {
    _brand: B;
}>;
/**
 * Create a readonly version of a schema
 */
export declare function readonly<T>(schema: SchemaDefinition<any, T>): SchemaDefinition<any, Readonly<T>>;
/**
 * Create a lazy-evaluated schema
 */
export declare function defer<T>(schemaFn: () => SchemaDefinition<any, T>): SchemaDefinition<any, T>;
/**
 * Create a schema that validates against multiple schemas
 * and returns the first successful result
 */
export declare function firstOf<T extends readonly SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Create a schema that validates all items in a tuple
 */
export declare function allOf<T extends readonly SchemaDefinition[]>(...schemas: T): SchemaDefinition;
/**
 * Extend an object schema with additional properties
 */
export declare function extend<T extends ObjectSchema<any>, U extends Record<string, SchemaDefinition>>(baseSchema: T, extension: U): ObjectSchema<any>;
/**
 * Pick specific properties from an object schema
 */
export declare function pick<T extends ObjectSchema<any>, K extends string>(schema: T, keys: K[]): ObjectSchema<any>;
/**
 * Omit specific properties from an object schema
 */
export declare function omit<T extends ObjectSchema<any>, K extends string>(schema: T, keys: K[]): ObjectSchema<any>;
/**
 * Make all properties of an object schema optional
 */
export declare function partial<T extends ObjectSchema<any>>(schema: T): ObjectSchema<any>;
/**
 * Make all properties of an object schema required
 */
export declare function required<T extends ObjectSchema<any>>(schema: T): ObjectSchema<any>;
/**
 * Create a deep partial version of an object schema
 */
export declare function deepPartial<T extends ObjectSchema<any>>(schema: T): ObjectSchema<any>;
//# sourceMappingURL=composition.d.ts.map