import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
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

export class ObjectSchema<T extends ObjectShape = ObjectShape> extends BaseSchema<ObjectInput<T>, ObjectOutput<T>> {
  readonly _type = 'object';
  readonly _shape: T;
  
  private _unknownKeys: UnknownKeysParam = 'strip';
  private _catchall?: SchemaDefinition<any, any>;

  constructor(shape: T, config: ObjectConfig = {}) {
    super();
    this._shape = shape;
    
    if (config.strict) {
      this._unknownKeys = 'strict';
    } else if (config.passthrough) {
      this._unknownKeys = 'passthrough';
    } else if (config.strip !== false) {
      this._unknownKeys = 'strip';
    }
  }

  _parse(input: unknown, ctx: ParseContext): ObjectOutput<T> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'object') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'object',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const obj = input as Record<string, any>;
    const result = {} as any;
    const processedKeys = new Set<string>();

    // Parse defined shape properties
    for (const [key, schema] of Object.entries(this._shape)) {
      processedKeys.add(key);
      const value = obj[key];
      
      try {
        // Create child context for proper path tracking
        const childCtx = ctx.child(key, value);
        
        // Process modifiers first (like default values)
        const processedValue = (schema as any)._processModifiers ? 
          (schema as any)._processModifiers(value, childCtx) : value;
        
        // Skip parsing if value is undefined/null and schema allows it
        if ((processedValue === undefined && (schema as any)._isOptional) ||
            (processedValue === null && (schema as any)._isNullable)) {
          if (processedValue !== undefined) {
            result[key] = processedValue;
          }
          continue;
        }
        
        // Parse with the child context
        const parsed = (schema as any)._parse(processedValue, childCtx);
        
        // Only add to result if not undefined or if schema allows undefined
        if (parsed !== undefined || (schema as any)._isOptional) {
          result[key] = parsed;
        }
      } catch (error) {
        // Continue parsing other fields to collect all errors
        // The error has already been added to the context
      }
    }

    // Handle unknown keys
    const unknownKeys: string[] = [];
    for (const key in obj) {
      if (!processedKeys.has(key)) {
        unknownKeys.push(key);
      }
    }

    if (unknownKeys.length > 0) {
      if (this._unknownKeys === 'strict') {
        ctx.addIssue({
          code: ErrorCode.UNRECOGNIZED_KEYS,
          options: { keys: unknownKeys },
          message: `Unrecognized key(s) in object: ${unknownKeys.join(', ')}`
        });
      } else if (this._unknownKeys === 'passthrough') {
        for (const key of unknownKeys) {
          result[key] = obj[key];
        }
      } else if (this._catchall) {
        for (const key of unknownKeys) {
          try {
            const childCtx = ctx.child(key, obj[key]);
            const parsed = (this._catchall as any)._parse(obj[key], childCtx);
            result[key] = parsed;
          } catch (error) {
            // Continue parsing other fields to collect all errors
          }
        }
      }
      // For 'strip' mode, we simply ignore unknown keys (default behavior)
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    // Run any refine checks from BaseSchema
    if (this._checks && this._checks.length > 0) {
      for (const check of this._checks) {
        const checkResult = check(result, ctx);
        // Handle both sync and async checks
        if (checkResult && typeof checkResult.then === 'function') {
          // If it's a promise in sync context, we can't await it
          // This shouldn't happen in properly designed code
          throw new Error('Async refinement in sync parse');
        }
        if (ctx.hasIssues) {
          throw ctx.makeError();
        }
      }
    }

    return result;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<ObjectOutput<T>> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'object') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'object',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const obj = input as Record<string, any>;
    const result = {} as any;
    const processedKeys = new Set<string>();
    const promises: Array<Promise<[string, any] | null>> = [];

    // Parse defined shape properties
    for (const [key, schema] of Object.entries(this._shape)) {
      processedKeys.add(key);
      const value = obj[key];
      
      promises.push(
        (async () => {
          try {
            // Create child context for proper path tracking
            const childCtx = ctx.child(key, value);
            
            // Process modifiers first (like default values)
            const processedValue = (schema as any)._processModifiers ? 
              (schema as any)._processModifiers(value, childCtx) : value;
            
            // Parse with the child context
            const parsed = await (schema as any)._parseAsync(processedValue, childCtx);
            
            // Only add to result if not undefined or if schema allows undefined
            if (parsed !== undefined || schema.isOptional()) {
              return [key, parsed] as [string, any];
            }
            return null;
          } catch (error) {
            // Errors are already added to context with proper paths
            return null;
          }
        })()
      );
    }

    const results = await Promise.allSettled(promises);
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res && res.status === 'fulfilled' && res.value !== null) {
        const [key, value] = res.value;
        result[key] = value;
      }
    }

    // Handle unknown keys
    const unknownKeys: string[] = [];
    for (const key in obj) {
      if (!processedKeys.has(key)) {
        unknownKeys.push(key);
      }
    }

    if (unknownKeys.length > 0) {
      if (this._unknownKeys === 'strict') {
        ctx.addIssue({
          code: ErrorCode.UNRECOGNIZED_KEYS,
          options: { keys: unknownKeys },
          message: `Unrecognized key(s) in object: ${unknownKeys.join(', ')}`
        });
      } else if (this._unknownKeys === 'passthrough') {
        for (const key of unknownKeys) {
          result[key] = obj[key];
        }
      } else if (this._catchall) {
        const catchallPromises = unknownKeys.map(async (key) => {
          const childCtx = ctx.child(key, obj[key]);
          try {
            const parsed = await (this._catchall as any)._parseAsync(obj[key], childCtx);
            return [key, parsed] as [string, any];
          } catch (error) {
            return [key, undefined] as [string, any];
          }
        });

        const catchallResults = await Promise.allSettled(catchallPromises);
        for (const res of catchallResults) {
          if (res.status === 'fulfilled' && res.value[1] !== undefined) {
            const [key, value] = res.value;
            result[key] = value;
          }
        }
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    // Run any refine checks from BaseSchema
    if (this._checks && this._checks.length > 0) {
      for (const check of this._checks) {
        await check(result, ctx);
        if (ctx.hasIssues) {
          throw ctx.makeError();
        }
      }
    }

    return result;
  }

  // Fluent API methods

  /**
   * Enable strict mode - unknown keys will cause validation to fail
   */
  strict(): ObjectSchema<T> {
    const schema = Object.create(this);
    schema._unknownKeys = 'strict';
    return schema;
  }

  /**
   * Enable passthrough mode - unknown keys will be passed through to output
   */
  passthrough(): ObjectSchema<T> {
    const schema = Object.create(this);
    schema._unknownKeys = 'passthrough';
    return schema;
  }

  /**
   * Enable strip mode - unknown keys will be silently removed (default)
   */
  strip(): ObjectSchema<T> {
    const schema = Object.create(this);
    schema._unknownKeys = 'strip';
    return schema;
  }

  /**
   * Set a catchall schema for unknown keys
   */
  catchall<U>(schema: SchemaDefinition<any, U>): ObjectSchema<T & Record<string, U>> {
    const newSchema = Object.create(this);
    newSchema._catchall = schema;
    return newSchema as any;
  }

  /**
   * Pick specific keys from the shape
   */
  pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>> {
    const newShape = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in this._shape) {
        newShape[key] = this._shape[key];
      }
    }
    return new ObjectSchema(newShape);
  }

  /**
   * Omit specific keys from the shape
   */
  omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>> {
    const keySet = new Set(keys);
    const newShape = {} as Omit<T, K>;
    for (const [key, schema] of Object.entries(this._shape)) {
      if (!keySet.has(key as K)) {
        (newShape as any)[key] = schema;
      }
    }
    return new ObjectSchema(newShape);
  }

  /**
   * Make properties optional - all or specific keys
   */
  partial<K extends keyof T = keyof T>(keys?: K[]): ObjectSchema<any> {
    if (!keys) {
      // Make all properties optional
      const newShape = {} as any;
      for (const [key, schema] of Object.entries(this._shape)) {
        newShape[key] = (schema as any).optional();
      }
      return new ObjectSchema(newShape);
    } else {
      // Make specific properties optional
      const keySet = new Set(keys);
      const newShape = {} as any;
      for (const [key, schema] of Object.entries(this._shape)) {
        if (keySet.has(key as K)) {
          newShape[key] = (schema as any).optional();
        } else {
          newShape[key] = schema;
        }
      }
      return new ObjectSchema(newShape);
    }
  }

  /**
   * Make properties required - all or specific keys
   */
  required<K extends keyof T = keyof T>(keys?: K[]): ObjectSchema<any> {
    if (!keys) {
      // Make all properties required
      const newShape = {} as any;
      for (const [key, schema] of Object.entries(this._shape)) {
        // Create a schema that doesn't accept undefined
        newShape[key] = schema; // This is simplified - would need more complex implementation
      }
      return new ObjectSchema(newShape);
    } else {
      // Make specific properties required
      const keySet = new Set(keys);
      const newShape = {} as any;
      for (const [key, schema] of Object.entries(this._shape)) {
        if (keySet.has(key as K)) {
          // Create a schema that doesn't accept undefined - simplified
          newShape[key] = schema;
        } else {
          newShape[key] = schema;
        }
      }
      return new ObjectSchema(newShape);
    }
  }

  /**
   * Merge with another object schema
   */
  merge<U extends ObjectShape>(other: ObjectSchema<U>): ObjectSchema<MergeShapes<T, U>> {
    const mergedShape = { ...this._shape, ...other._shape } as MergeShapes<T, U>;
    return new ObjectSchema(mergedShape);
  }

  /**
   * Extend with additional properties
   */
  extend<U extends ObjectShape>(extension: U): ObjectSchema<MergeShapes<T, U>> {
    const extendedShape = { ...this._shape, ...extension } as MergeShapes<T, U>;
    return new ObjectSchema(extendedShape);
  }

  /**
   * Get union type of all keys
   */
  keyof(): SchemaDefinition<keyof T, keyof T> {
    // This would need a proper literal union schema implementation
    // For now, return a simplified version
    return {
      _input: {} as keyof T,
      _output: {} as keyof T,
      _type: 'literal',
      parse: (data: unknown) => {
        if (typeof data === 'string' && data in this._shape) {
          return data as keyof T;
        }
        throw new Error(`Invalid key: ${data}`);
      },
      parseAsync: async (data: unknown) => {
        return this.keyof().parse(data);
      }
    } as any;
  }

  /**
   * Make object deeply partial
   */
  deepPartial(): ObjectSchema<{
    [K in keyof T]: SchemaDefinition<DeepPartial<T[K]['_input']>, DeepPartial<T[K]['_output']>>;
  }> {
    const newShape = {} as any;
    for (const [key, schema] of Object.entries(this._shape)) {
      // This is a simplified implementation
      // A full implementation would need to recursively apply deepPartial
      newShape[key] = (schema as any).optional();
    }
    return new ObjectSchema(newShape);
  }

  /**
   * Get the shape of the object
   */
  get shape(): T {
    return this._shape;
  }

  /**
   * Get a specific property schema
   */
  get<K extends keyof T>(key: K): T[K] {
    return this._shape[key];
  }
}

/**
 * Create an object schema
 */
export function object<T extends ObjectShape>(shape: T): ObjectSchema<T> {
  return new ObjectSchema(shape);
}

/**
 * Create a record schema (object with dynamic keys)
 */
export function record<K extends string | number | symbol, V>(
  keySchema: SchemaDefinition<any, K>,
  valueSchema: SchemaDefinition<any, V>
): SchemaDefinition<Record<K, V>, Record<K, V>> {
  return {
    _input: {} as Record<K, V>,
    _output: {} as Record<K, V>,
    _type: 'record',
    parse: (data: unknown) => {
      if (typeof data !== 'object' || data === null) {
        throw new Error('Expected object');
      }

      const result = {} as Record<K, V>;
      const obj = data as Record<string, any>;

      for (const [key, value] of Object.entries(obj)) {
        const parsedKey = keySchema.parse(key);
        const parsedValue = valueSchema.parse(value);
        result[parsedKey] = parsedValue;
      }

      return result;
    },
    parseAsync: async (data: unknown) => {
      if (typeof data !== 'object' || data === null) {
        throw new Error('Expected object');
      }

      const result = {} as Record<K, V>;
      const obj = data as Record<string, any>;

      for (const [key, value] of Object.entries(obj)) {
        const parsedKey = await keySchema.parseAsync(key);
        const parsedValue = await valueSchema.parseAsync(value);
        result[parsedKey] = parsedValue;
      }

      return result;
    }
  } as any;
}