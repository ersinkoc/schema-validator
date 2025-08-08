import { SchemaDefinition } from '../types/base';
import { ObjectSchema } from '../schemas/complex/object';
import { union } from '../schemas/complex/union';
import { intersection } from '../schemas/complex/intersection';
import { lazy } from '../schemas/complex/lazy';

/**
 * Schema composition utilities for building complex schemas
 */

/**
 * Compose multiple schemas into a union (OR)
 */
export function or<T extends readonly SchemaDefinition[]>(
  ...schemas: T
): SchemaDefinition {
  if (schemas.length === 0) {
    throw new Error('At least one schema is required for union');
  }
  return union(schemas as any) as SchemaDefinition;
}

/**
 * Compose multiple schemas into an intersection (AND)
 */
export function and<T extends SchemaDefinition[]>(
  ...schemas: T
): SchemaDefinition {
  if (schemas.length === 0) {
    throw new Error('At least one schema is required for intersection');
  }
  if (schemas.length === 1) {
    return schemas[0] as SchemaDefinition;
  }
  
  return schemas.reduce((acc, schema) => intersection(acc, schema)) as SchemaDefinition;
}

/**
 * Create a conditional schema based on a discriminator
 */
export function conditional<T extends Record<string, any>>(
  _discriminator: keyof T,
  cases: Record<string, SchemaDefinition>
): SchemaDefinition {
  const schemas = Object.values(cases);
  if (schemas.length === 0) {
    throw new Error('At least one case is required');
  }
  return union(schemas as any) as SchemaDefinition;
}

/**
 * Create a recursive schema
 */
export function recursive<T>(
  definition: (self: SchemaDefinition<T, T>) => SchemaDefinition<T, T>
): SchemaDefinition<T, T> {
  return lazy(() => definition(recursiveSchema)) as SchemaDefinition<T, T>;
  const recursiveSchema: SchemaDefinition<T, T> = lazy(() => definition(recursiveSchema)) as SchemaDefinition<T, T>;
  return recursiveSchema;
}

/**
 * Merge multiple object schemas
 */
export function mergeObjects<T extends ObjectSchema<any>[]>(
  ...schemas: T
): ObjectSchema<any> {
  if (schemas.length === 0) {
    throw new Error('At least one schema is required for merging');
  }
  
  return schemas.reduce((acc, schema) => acc.merge(schema));
}

/**
 * Create a pipeline of transformations
 */
export function pipeline<T extends SchemaDefinition[]>(
  ...schemas: T
): SchemaDefinition {
  if (schemas.length === 0) {
    throw new Error('At least one schema is required for pipeline');
  }
  
  return schemas.reduce((acc, schema, index) => {
    if (index === 0) return schema;
    
    // Apply the next schema as a transformation
    return acc.transform((value) => schema.parse(value));
  });
}

/**
 * Create a schema that coerces input to the expected type
 */
export function coerce<T>(
  targetSchema: SchemaDefinition<any, T>,
  coercer: (input: unknown) => unknown
): SchemaDefinition<unknown, T> {
  return {
    ...targetSchema,
    parse: (data: unknown) => {
      const coerced = coercer(data);
      return targetSchema.parse(coerced);
    },
    parseAsync: async (data: unknown) => {
      const coerced = coercer(data);
      return targetSchema.parseAsync(coerced);
    },
    safeParse: (data: unknown) => {
      try {
        const coerced = coercer(data);
        return targetSchema.safeParse(coerced);
      } catch (error) {
        return {
          success: false,
          error: error as any
        };
      }
    },
    safeParseAsync: async (data: unknown) => {
      try {
        const coerced = coercer(data);
        return targetSchema.safeParseAsync(coerced);
      } catch (error) {
        return {
          success: false,
          error: error as any
        };
      }
    }
  } as SchemaDefinition<unknown, T>;
}

/**
 * Create a schema with a fallback value on parse error
 */
export function withFallback<T>(
  schema: SchemaDefinition<any, T>,
  fallback: T | ((error: any) => T)
): SchemaDefinition<unknown, T> {
  return schema.catch(fallback);
}

/**
 * Create a schema that preprocesses input before validation
 */
export function preprocess<T>(
  preprocessor: (input: unknown) => unknown,
  schema: SchemaDefinition<any, T>
): SchemaDefinition<unknown, T> {
  return coerce(schema, preprocessor);
}

/**
 * Create a schema that postprocesses output after validation
 */
export function postprocess<T, U>(
  schema: SchemaDefinition<any, T>,
  postprocessor: (output: T) => U
): SchemaDefinition<any, U> {
  return schema.transform(postprocessor);
}

/**
 * Create a nullable version of a schema
 */
export function nullable<T>(
  schema: SchemaDefinition<any, T>
): SchemaDefinition<any, T | null> {
  return schema.nullable();
}

/**
 * Create an optional version of a schema
 */
export function optional<T>(
  schema: SchemaDefinition<any, T>
): SchemaDefinition<any, T | undefined> {
  return schema.optional();
}

/**
 * Create a nullish version of a schema
 */
export function nullish<T>(
  schema: SchemaDefinition<any, T>
): SchemaDefinition<any, T | null | undefined> {
  return schema.nullish();
}

/**
 * Create a schema with a default value
 */
export function withDefault<T>(
  schema: SchemaDefinition<any, T>,
  defaultValue: T | (() => T)
): SchemaDefinition<any, T> {
  return schema.default(defaultValue);
}

/**
 * Create a branded type schema
 */
export function brand<T, B extends string | symbol>(
  schema: SchemaDefinition<any, T>,
  _brand: B
): SchemaDefinition<any, T & { _brand: B }> {
  return schema.brand<B>() as any;
}

/**
 * Create a readonly version of a schema
 */
export function readonly<T>(
  schema: SchemaDefinition<any, T>
): SchemaDefinition<any, Readonly<T>> {
  return schema.readonly() as any;
}

/**
 * Create a lazy-evaluated schema
 */
export function defer<T>(
  schemaFn: () => SchemaDefinition<any, T>
): SchemaDefinition<any, T> {
  return lazy(schemaFn);
}

/**
 * Create a schema that validates against multiple schemas
 * and returns the first successful result
 */
export function firstOf<T extends readonly SchemaDefinition[]>(
  ...schemas: T
): SchemaDefinition {
  if (schemas.length === 0) {
    throw new Error('At least one schema is required');
  }
  return union(schemas as any) as SchemaDefinition;
}

/**
 * Create a schema that validates all items in a tuple
 */
export function allOf<T extends readonly SchemaDefinition[]>(
  ...schemas: T
): SchemaDefinition {
  return and(...schemas as any);
}

/**
 * Extend an object schema with additional properties
 */
export function extend<T extends ObjectSchema<any>, U extends Record<string, SchemaDefinition>>(
  baseSchema: T,
  extension: U
): ObjectSchema<any> {
  return baseSchema.extend(extension);
}

/**
 * Pick specific properties from an object schema
 */
export function pick<T extends ObjectSchema<any>, K extends string>(
  schema: T,
  keys: K[]
): ObjectSchema<any> {
  return schema.pick(keys as any);
}

/**
 * Omit specific properties from an object schema
 */
export function omit<T extends ObjectSchema<any>, K extends string>(
  schema: T,
  keys: K[]
): ObjectSchema<any> {
  return schema.omit(keys as any);
}

/**
 * Make all properties of an object schema optional
 */
export function partial<T extends ObjectSchema<any>>(
  schema: T
): ObjectSchema<any> {
  return schema.partial();
}

/**
 * Make all properties of an object schema required
 */
export function required<T extends ObjectSchema<any>>(
  schema: T
): ObjectSchema<any> {
  return schema.required();
}

/**
 * Create a deep partial version of an object schema
 */
export function deepPartial<T extends ObjectSchema<any>>(
  schema: T
): ObjectSchema<any> {
  return schema.deepPartial();
}