import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';
import { DeepPartial, MergeShapes } from '../../types/infer';
export type ObjectShape = Record<string, SchemaDefinition<any, any>>;
export interface ObjectConfig {
    strict?: boolean;
    strip?: boolean;
    passthrough?: boolean;
}
export type InferObjectShape<T extends ObjectShape> = {
    [K in keyof T]: T[K]['_output'];
};
export type InputObjectShape<T extends ObjectShape> = {
    [K in keyof T]: T[K]['_input'];
};
export type OptionalKeys<T extends ObjectShape> = {
    [K in keyof T]: undefined extends T[K]['_output'] ? K : never;
}[keyof T];
export type RequiredKeys<T extends ObjectShape> = {
    [K in keyof T]: undefined extends T[K]['_output'] ? never : K;
}[keyof T];
export type ObjectOutput<T extends ObjectShape> = {
    [K in RequiredKeys<T>]: T[K]['_output'];
} & {
    [K in OptionalKeys<T>]?: T[K]['_output'];
};
export type ObjectInput<T extends ObjectShape> = {
    [K in RequiredKeys<T>]: T[K]['_input'];
} & {
    [K in OptionalKeys<T>]?: T[K]['_input'];
};
export type UnknownKeysParam = 'passthrough' | 'strict' | 'strip';
export declare class ObjectSchema<T extends ObjectShape = ObjectShape> extends BaseSchema<ObjectInput<T>, ObjectOutput<T>> {
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
export declare function object<T extends ObjectShape>(shape: T): ObjectSchema<T>;
/**
 * Create a record schema (object with dynamic keys)
 */
export declare function record<K extends string | number | symbol, V>(keySchema: SchemaDefinition<any, K>, valueSchema: SchemaDefinition<any, V>): SchemaDefinition<Record<K, V>, Record<K, V>>;
//# sourceMappingURL=object.d.ts.map