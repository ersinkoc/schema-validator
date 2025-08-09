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
export function introspect(schema: SchemaDefinition): SchemaInfo {
  const info: SchemaInfo = {
    type: schema._type,
    optional: schema.isOptional?.() || false,
    nullable: schema.isNullable?.() || false,
  };

  // Add description if available
  if ((schema as any)._description) {
    info.description = (schema as any)._description;
  }

  // Handle object schemas
  if (schema instanceof ObjectSchema) {
    info.properties = {};
    const shape = (schema as any)._shape;
    for (const [key, value] of Object.entries(shape)) {
      info.properties[key] = introspect(value as SchemaDefinition);
    }
  }

  // Handle array schemas
  if (schema instanceof ArraySchema) {
    const element = (schema as any)._element;
    if (element) {
      info.items = introspect(element);
    }
  }

  // Handle union schemas
  if (schema instanceof UnionSchema) {
    const options = (schema as any)._unionOptions || (schema as any)._options;
    if (options && Array.isArray(options)) {
      info.options = options.map((opt: SchemaDefinition) => introspect(opt));
    }
  }

  // Extract constraints for primitive types
  const constraints: Record<string, any> = {};
  
  // Check for _checks array (used by string, number, etc.)
  if ((schema as any)._checks && Array.isArray((schema as any)._checks)) {
    const checks = (schema as any)._checks;
    for (const check of checks) {
      if (check.kind === 'min') {
        if (schema._type === 'string') {
          constraints['minLength'] = check.value;
        } else if (schema._type === 'array') {
          constraints['minItems'] = check.value;
        } else {
          constraints['min'] = check.value;
        }
      } else if (check.kind === 'max') {
        if (schema._type === 'string') {
          constraints['maxLength'] = check.value;
        } else if (schema._type === 'array') {
          constraints['maxItems'] = check.value;
        } else {
          constraints['max'] = check.value;
        }
      } else if (check.kind === 'length') {
        constraints['length'] = check.value;
      } else if (check.kind === 'int') {
        constraints['integer'] = true;
      } else if (check.kind === 'regex') {
        const regexValue = check.regex || check.value;
        constraints['pattern'] = regexValue ? regexValue.toString() : '';
      } else if (check.kind === 'email') {
        constraints['format'] = 'email';
      } else if (check.kind === 'url') {
        constraints['format'] = 'url';
      } else if (check.kind === 'uuid') {
        constraints['format'] = 'uuid';
      }
    }
  }
  
  // Legacy support for individual properties
  if ((schema as any)._minLength !== undefined) {
    constraints['minLength'] = (schema as any)._minLength;
  }
  if ((schema as any)._maxLength !== undefined) {
    constraints['maxLength'] = (schema as any)._maxLength;
  }
  if ((schema as any)._min !== undefined) {
    constraints['min'] = (schema as any)._min;
  }
  if ((schema as any)._max !== undefined) {
    constraints['max'] = (schema as any)._max;
  }
  if ((schema as any)._isInt) {
    constraints['integer'] = true;
  }
  if ((schema as any)._minItems !== undefined) {
    constraints['minItems'] = (schema as any)._minItems;
  }
  if ((schema as any)._maxItems !== undefined) {
    constraints['maxItems'] = (schema as any)._maxItems;
  }
  
  if (Object.keys(constraints).length > 0) {
    info.constraints = constraints;
  }

  return info;
}

/**
 * Get the shape of an object schema
 */
export function getShape<T extends ObjectSchema<any>>(
  schema: T
): T extends ObjectSchema<infer S> ? S : never {
  return (schema as any)._shape;
}

/**
 * Get the element type of an array schema
 */
export function getElement<T extends ArraySchema<any>>(
  schema: T
): T extends ArraySchema<infer E> ? E : never {
  return (schema as any)._element;
}

/**
 * Get the options of a union schema
 */
export function getOptions<T extends UnionSchema<any>>(
  schema: T
): T extends UnionSchema<infer O> ? O : never {
  return (schema as any)._unionOptions || (schema as any)._options || [];
}

/**
 * Check if a schema has a specific modifier
 */
export function hasModifier(
  schema: SchemaDefinition,
  modifier: 'optional' | 'nullable' | 'nullish' | 'default' | 'catch'
): boolean {
  switch (modifier) {
    case 'optional':
      return schema.isOptional?.() || false;
    case 'nullable':
      return schema.isNullable?.() || false;
    case 'nullish':
      return schema.isNullish?.() || false;
    case 'default':
      return (schema as any)._default !== undefined;
    case 'catch':
      return (schema as any)._catch !== undefined;
    default:
      return false;
  }
}

/**
 * Get all property names from an object schema
 */
export function getPropertyNames(schema: ObjectSchema<any>): string[] {
  const shape = (schema as any)._shape;
  return Object.keys(shape);
}

/**
 * Get a specific property schema from an object schema
 */
export function getProperty<T extends ObjectSchema<any>, K extends string>(
  schema: T,
  key: K
): SchemaDefinition | undefined {
  const shape = (schema as any)._shape;
  return shape[key];
}

/**
 * Check if a schema is of a specific type
 */
export function isType(
  schema: SchemaDefinition,
  type: string
): boolean {
  return schema._type === type;
}

/**
 * Walk through a schema tree and apply a visitor function
 */
export function walkSchema(
  schema: SchemaDefinition,
  visitor: (schema: SchemaDefinition, path: string[]) => void,
  path: string[] = []
): void {
  visitor(schema, path);

  // Recursively walk object properties
  if (schema instanceof ObjectSchema) {
    const shape = (schema as any)._shape;
    for (const [key, value] of Object.entries(shape)) {
      walkSchema(value as SchemaDefinition, visitor, [...path, key]);
    }
  }

  // Recursively walk array elements
  if (schema instanceof ArraySchema) {
    const element = (schema as any)._element;
    if (element) {
      walkSchema(element, visitor, [...path, '[]']);
    }
  }

  // Recursively walk union options
  if (schema instanceof UnionSchema) {
    const options = (schema as any)._unionOptions || (schema as any)._options;
    if (options && Array.isArray(options)) {
      options.forEach((opt: SchemaDefinition, index: number) => {
        walkSchema(opt, visitor, [...path, `|${index}`]);
      });
    }
  }
}

/**
 * Generate a JSON Schema from a validator schema
 */
export function toJsonSchema(schema: SchemaDefinition): any {
  const jsonSchema: any = {};

  // Handle object schemas directly
  if (schema instanceof ObjectSchema) {
    jsonSchema.type = 'object';
    const shape = (schema as any)._shape;
    if (shape) {
      jsonSchema.properties = {};
      for (const [key, propSchema] of Object.entries(shape)) {
        jsonSchema.properties[key] = toJsonSchema(propSchema as SchemaDefinition);
      }
    }
    return jsonSchema;
  }

  // Handle array schemas directly
  if (schema instanceof ArraySchema) {
    jsonSchema.type = 'array';
    const element = (schema as any)._element;
    if (element) {
      jsonSchema.items = toJsonSchema(element);
    }
    return jsonSchema;
  }

  // Handle union schemas directly
  if (schema instanceof UnionSchema) {
    const options = (schema as any)._unionOptions || (schema as any)._options;
    if (options && Array.isArray(options)) {
      jsonSchema.oneOf = options.map((opt: SchemaDefinition) => toJsonSchema(opt));
    }
    return jsonSchema;
  }

  // For other schemas, use introspection
  const info = introspect(schema);
  
  // Map types
  switch (info.type) {
    case 'string':
      jsonSchema.type = 'string';
      break;
    case 'number':
      jsonSchema.type = info.constraints?.['integer'] ? 'integer' : 'number';
      break;
    case 'boolean':
      jsonSchema.type = 'boolean';
      break;
    case 'null':
      jsonSchema.type = 'null';
      break;
    default:
      jsonSchema.type = info.type;
  }

  // Add constraints
  if (info.constraints) {
    Object.assign(jsonSchema, info.constraints);
  }

  // Add description
  if (info.description) {
    jsonSchema.description = info.description;
  }

  // Handle optional/nullable
  if (info.nullable) {
    jsonSchema.type = [jsonSchema.type, 'null'];
  }

  return jsonSchema;
}