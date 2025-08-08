import { SchemaDefinition } from '../types/base';
import { ObjectSchema } from '../schemas/complex/object';
import { ArraySchema } from '../schemas/complex/array';
import { UnionSchema } from '../schemas/complex/union';
/**
 * Schema introspection utilities for runtime analysis
 */
export interface SchemaInfo {
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
export declare function introspect(schema: SchemaDefinition): SchemaInfo;
/**
 * Get the shape of an object schema
 */
export declare function getShape<T extends ObjectSchema<any>>(schema: T): T extends ObjectSchema<infer S> ? S : never;
/**
 * Get the element type of an array schema
 */
export declare function getElement<T extends ArraySchema<any>>(schema: T): T extends ArraySchema<infer E> ? E : never;
/**
 * Get the options of a union schema
 */
export declare function getOptions<T extends UnionSchema<any>>(schema: T): T extends UnionSchema<infer O> ? O : never;
/**
 * Check if a schema has a specific modifier
 */
export declare function hasModifier(schema: SchemaDefinition, modifier: 'optional' | 'nullable' | 'nullish' | 'default' | 'catch'): boolean;
/**
 * Get all property names from an object schema
 */
export declare function getPropertyNames(schema: ObjectSchema<any>): string[];
/**
 * Get a specific property schema from an object schema
 */
export declare function getProperty<T extends ObjectSchema<any>, K extends string>(schema: T, key: K): SchemaDefinition | undefined;
/**
 * Check if a schema is of a specific type
 */
export declare function isType(schema: SchemaDefinition, type: string): boolean;
/**
 * Walk through a schema tree and apply a visitor function
 */
export declare function walkSchema(schema: SchemaDefinition, visitor: (schema: SchemaDefinition, path: string[]) => void, path?: string[]): void;
/**
 * Generate a JSON Schema from a validator schema
 */
export declare function toJsonSchema(schema: SchemaDefinition): any;
//# sourceMappingURL=introspection.d.ts.map