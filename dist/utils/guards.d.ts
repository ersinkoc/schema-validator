import { SchemaDefinition } from '../types/base';
/**
 * Type guard utilities for runtime type checking
 */
/**
 * Create a type guard function from a schema
 */
export declare function createGuard<T>(schema: SchemaDefinition<any, T>): (value: unknown) => value is T;
/**
 * Create an assertion function from a schema
 */
export declare function createAssert<T>(schema: SchemaDefinition<any, T>): (value: unknown) => asserts value is T;
/**
 * Check if a value matches a schema
 */
export declare function is<T>(schema: SchemaDefinition<any, T>, value: unknown): value is T;
/**
 * Assert that a value matches a schema
 */
export declare function assert<T>(schema: SchemaDefinition<any, T>, value: unknown): asserts value is T;
/**
 * Type guard for checking if a value is a schema
 */
export declare function isSchema(value: unknown): value is SchemaDefinition;
/**
 * Create a discriminated union guard
 */
export declare function createDiscriminatedUnionGuard<T extends Record<K, string>, K extends keyof T>(discriminator: K, schemas: Record<T[K], SchemaDefinition<any, T>>): (value: unknown) => value is T;
/**
 * Create a union type guard
 */
export declare function createUnionGuard<T extends readonly SchemaDefinition[]>(schemas: T): (value: unknown) => boolean;
/**
 * Create an intersection type guard
 */
export declare function createIntersectionGuard<T extends readonly SchemaDefinition[]>(schemas: T): (value: unknown) => boolean;
/**
 * Narrow a union type based on a discriminator
 */
export declare function narrow<T extends Record<K, string>, K extends keyof T, V extends T[K]>(value: T, discriminator: K, discriminatorValue: V): value is Extract<T, Record<K, V>>;
//# sourceMappingURL=guards.d.ts.map