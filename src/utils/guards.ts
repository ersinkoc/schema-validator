import { SchemaDefinition } from '../types/base';

/**
 * Type guard utilities for runtime type checking
 */

/**
 * Create a type guard function from a schema
 */
export function createGuard<T>(schema: SchemaDefinition<any, T>): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    const result = schema.safeParse(value);
    return result.success;
  };
}

/**
 * Create an assertion function from a schema
 */
export function createAssert<T>(schema: SchemaDefinition<any, T>): (value: unknown) => asserts value is T {
  return (value: unknown): asserts value is T => {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw result.error;
    }
  };
}

/**
 * Check if a value matches a schema
 */
export function is<T>(schema: SchemaDefinition<any, T>, value: unknown): value is T {
  return schema.safeParse(value).success;
}

/**
 * Assert that a value matches a schema
 */
export function assert<T>(schema: SchemaDefinition<any, T>, value: unknown): asserts value is T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw result.error;
  }
}

/**
 * Type guard for checking if a value is a schema
 */
export function isSchema(value: unknown): value is SchemaDefinition {
  return (
    value !== null &&
    typeof value === 'object' &&
    'parse' in value &&
    'safeParse' in value &&
    '_type' in value
  );
}

/**
 * Create a discriminated union guard
 */
export function createDiscriminatedUnionGuard<
  T extends Record<K, string>,
  K extends keyof T
>(
  discriminator: K,
  schemas: Record<T[K], SchemaDefinition<any, T>>
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    
    const discriminatorValue = (value as any)[discriminator];
    if (typeof discriminatorValue !== 'string') {
      return false;
    }
    
    const schema = schemas[discriminatorValue as T[K]];
    if (!schema) {
      return false;
    }
    
    return schema.safeParse(value).success;
  };
}

/**
 * Create a union type guard
 */
export function createUnionGuard<T extends readonly SchemaDefinition[]>(
  schemas: T
): (value: unknown) => boolean {
  return (value: unknown): boolean => {
    for (const schema of schemas) {
      if (schema.safeParse(value).success) {
        return true;
      }
    }
    return false;
  };
}

/**
 * Create an intersection type guard
 */
export function createIntersectionGuard<T extends readonly SchemaDefinition[]>(
  schemas: T
): (value: unknown) => boolean {
  return (value: unknown): boolean => {
    for (const schema of schemas) {
      if (!schema.safeParse(value).success) {
        return false;
      }
    }
    return true;
  };
}

/**
 * Narrow a union type based on a discriminator
 */
export function narrow<
  T extends Record<K, string>,
  K extends keyof T,
  V extends T[K]
>(
  value: T,
  discriminator: K,
  discriminatorValue: V
): value is Extract<T, Record<K, V>> {
  return value[discriminator] === discriminatorValue;
}