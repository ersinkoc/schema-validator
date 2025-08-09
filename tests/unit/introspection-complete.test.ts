import {
  introspect,
  getShape,
  getElement,
  getOptions,
  hasModifier,
  getPropertyNames,
  getProperty,
  isType,
  walkSchema,
  toJsonSchema
} from '../../src/utils/introspection';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { object } from '../../src/schemas/complex/object';
import { array } from '../../src/schemas/complex/array';
import { union } from '../../src/schemas/complex/union';
import { literal } from '../../src/schemas/primitives/literal';
import { nullSchema } from '../../src/schemas/primitives/null';
import { SchemaDefinition } from '../../src/types/base';

describe('Introspection - Complete Coverage', () => {
  describe('introspect', () => {
    it('should extract basic schema information', () => {
      const schema = string();
      const info = introspect(schema);
      
      expect(info.type).toBe('string');
      expect(info.optional).toBe(false);
      expect(info.nullable).toBe(false);
    });

    it('should extract description when available', () => {
      const schema = string().describe('Test description');
      const info = introspect(schema);
      
      expect(info.description).toBe('Test description');
    });

    it('should extract object properties', () => {
      const schema = object({
        name: string(),
        age: number(),
        active: boolean()
      });
      const info = introspect(schema);
      
      expect(info.type).toBe('object');
      expect(info.properties).toBeDefined();
      expect(info.properties?.['name']?.type).toBe('string');
      expect(info.properties?.['age']?.type).toBe('number');
      expect(info.properties?.['active']?.type).toBe('boolean');
    });

    it('should extract array element type', () => {
      const schema = array(string());
      const info = introspect(schema);
      
      expect(info.type).toBe('array');
      expect(info.items).toBeDefined();
      expect(info.items?.type).toBe('string');
    });

    it('should extract union options', () => {
      const schema = union([string(), number(), boolean()]);
      const info = introspect(schema);
      
      expect(info.type).toBe('union');
      expect(info.options).toBeDefined();
      expect(info.options?.length).toBe(3);
      expect(info.options?.[0]?.type).toBe('string');
      expect(info.options?.[1]?.type).toBe('number');
      expect(info.options?.[2]?.type).toBe('boolean');
    });

    it('should extract string constraints', () => {
      const schema = string()
        .min(3)
        .max(10)
        .length(5)
        .regex(/^[a-z]+$/)
        .email()
        .url()
        .uuid();
      
      const info = introspect(schema);
      
      expect(info.constraints).toBeDefined();
      expect(info.constraints?.['minLength']).toBe(3);
      expect(info.constraints?.['maxLength']).toBe(10);
      expect(info.constraints?.['length']).toBe(5);
      expect(info.constraints?.['pattern']).toContain('[a-z]+');
      expect(info.constraints?.['format']).toBe('uuid'); // Last format wins
    });

    it('should extract number constraints', () => {
      const schema = number()
        .min(0)
        .max(100)
        .int();
      
      const info = introspect(schema);
      
      expect(info.constraints).toBeDefined();
      expect(info.constraints?.['min']).toBe(0);
      expect(info.constraints?.['max']).toBe(100);
      expect(info.constraints?.['integer']).toBe(true);
    });

    it('should extract array constraints', () => {
      const schema = array(string()).min(1).max(10);
      const info = introspect(schema);
      
      expect(info.constraints).toBeDefined();
      expect(info.constraints?.['minItems']).toBe(1);
      expect(info.constraints?.['maxItems']).toBe(10);
    });

    it('should handle nested schemas', () => {
      const schema = object({
        user: object({
          profile: object({
            name: string().min(1),
            age: number().positive()
          }),
          posts: array(object({
            title: string(),
            tags: array(string())
          }))
        })
      });
      
      const info = introspect(schema);
      
      expect(info.properties?.['user']?.properties?.['profile']?.properties?.['name']?.type).toBe('string');
      expect(info.properties?.['user']?.properties?.['profile']?.properties?.['name']?.constraints?.['minLength']).toBe(1);
      expect(info.properties?.['user']?.properties?.['posts']?.items?.properties?.['tags']?.items?.type).toBe('string');
    });

    it('should handle legacy constraint properties', () => {
      // Create a mock schema with legacy properties
      const schema: any = {
        _type: 'custom',
        _minLength: 5,
        _maxLength: 20,
        _min: 0,
        _max: 100,
        _isInt: true,
        _minItems: 2,
        _maxItems: 10,
        isOptional: () => false,
        isNullable: () => false
      };
      
      const info = introspect(schema as SchemaDefinition);
      
      expect(info.constraints?.['minLength']).toBe(5);
      expect(info.constraints?.['maxLength']).toBe(20);
      expect(info.constraints?.['min']).toBe(0);
      expect(info.constraints?.['max']).toBe(100);
      expect(info.constraints?.['integer']).toBe(true);
      expect(info.constraints?.['minItems']).toBe(2);
      expect(info.constraints?.['maxItems']).toBe(10);
    });
  });

  describe('getShape', () => {
    it('should get the shape of an object schema', () => {
      const schema = object({
        name: string(),
        age: number()
      });
      
      const shape = getShape(schema);
      expect(shape).toBeDefined();
      expect(shape.name).toBeDefined();
      expect(shape.age).toBeDefined();
    });

    it('should work with empty object', () => {
      const schema = object({});
      const shape = getShape(schema);
      expect(shape).toEqual({});
    });
  });

  describe('getElement', () => {
    it('should get the element type of an array schema', () => {
      const elementSchema = string();
      const schema = array(elementSchema);
      
      const element = getElement(schema);
      expect(element).toBe(elementSchema);
    });

    it('should work with complex element types', () => {
      const elementSchema = object({ id: number(), name: string() });
      const schema = array(elementSchema);
      
      const element = getElement(schema);
      expect(element).toBe(elementSchema);
    });
  });

  describe('getOptions', () => {
    it('should get the options of a union schema', () => {
      const opt1 = string();
      const opt2 = number();
      const opt3 = boolean();
      const schema = union([opt1, opt2, opt3]);
      
      const options = getOptions(schema);
      expect(options).toEqual([opt1, opt2, opt3]);
    });

    it('should work with discriminated unions', () => {
      const catSchema = object({ type: literal('cat'), meow: boolean() });
      const dogSchema = object({ type: literal('dog'), bark: boolean() });
      const schema = union([catSchema, dogSchema]);
      
      const options = getOptions(schema);
      expect(options).toHaveLength(2);
    });
  });

  describe('hasModifier', () => {
    it('should check for optional modifier', () => {
      const optional = string().optional();
      const required = string();
      
      expect(hasModifier(optional, 'optional')).toBe(true);
      expect(hasModifier(required, 'optional')).toBe(false);
    });

    it('should check for nullable modifier', () => {
      const nullable = string().nullable();
      const nonNullable = string();
      
      expect(hasModifier(nullable, 'nullable')).toBe(true);
      expect(hasModifier(nonNullable, 'nullable')).toBe(false);
    });

    it('should check for nullish modifier', () => {
      const nullish = string().nullish();
      const nonNullish = string();
      
      expect(hasModifier(nullish, 'nullish')).toBe(true);
      expect(hasModifier(nonNullish, 'nullish')).toBe(false);
    });

    it('should check for default modifier', () => {
      const withDefault = string().default('test');
      const withoutDefault = string();
      
      expect(hasModifier(withDefault, 'default')).toBe(true);
      expect(hasModifier(withoutDefault, 'default')).toBe(false);
    });

    it('should check for catch modifier', () => {
      const withCatch = string().catch('fallback');
      const withoutCatch = string();
      
      expect(hasModifier(withCatch, 'catch')).toBe(true);
      expect(hasModifier(withoutCatch, 'catch')).toBe(false);
    });

    it('should return false for unknown modifiers', () => {
      const schema = string();
      expect(hasModifier(schema, 'unknown' as any)).toBe(false);
    });
  });

  describe('getPropertyNames', () => {
    it('should get all property names from an object schema', () => {
      const schema = object({
        firstName: string(),
        lastName: string(),
        age: number(),
        email: string()
      });
      
      const names = getPropertyNames(schema);
      expect(names).toEqual(['firstName', 'lastName', 'age', 'email']);
    });

    it('should return empty array for empty object', () => {
      const schema = object({});
      const names = getPropertyNames(schema);
      expect(names).toEqual([]);
    });
  });

  describe('getProperty', () => {
    it('should get a specific property schema', () => {
      const nameSchema = string();
      const ageSchema = number();
      const schema = object({
        name: nameSchema,
        age: ageSchema
      });
      
      expect(getProperty(schema, 'name')).toBe(nameSchema);
      expect(getProperty(schema, 'age')).toBe(ageSchema);
    });

    it('should return undefined for non-existent property', () => {
      const schema = object({ name: string() });
      expect(getProperty(schema, 'nonExistent')).toBeUndefined();
    });
  });

  describe('isType', () => {
    it('should check if schema is of specific type', () => {
      expect(isType(string(), 'string')).toBe(true);
      expect(isType(string(), 'number')).toBe(false);
      
      expect(isType(number(), 'number')).toBe(true);
      expect(isType(number(), 'string')).toBe(false);
      
      expect(isType(object({}), 'object')).toBe(true);
      expect(isType(array(string()), 'array')).toBe(true);
      expect(isType(union([string(), number()]), 'union')).toBe(true);
    });
  });

  describe('walkSchema', () => {
    it('should visit all nodes in a schema tree', () => {
      const schema = object({
        user: object({
          name: string(),
          posts: array(object({
            title: string(),
            tags: array(string())
          }))
        }),
        settings: object({
          theme: union([literal('light'), literal('dark')])
        })
      });
      
      const visited: Array<{ type: string; path: string[] }> = [];
      walkSchema(schema, (s, path) => {
        visited.push({ type: s._type, path });
      });
      
      expect(visited).toContainEqual({ type: 'object', path: [] });
      expect(visited).toContainEqual({ type: 'object', path: ['user'] });
      expect(visited).toContainEqual({ type: 'string', path: ['user', 'name'] });
      expect(visited).toContainEqual({ type: 'array', path: ['user', 'posts'] });
      expect(visited).toContainEqual({ type: 'object', path: ['user', 'posts', '[]'] });
      expect(visited).toContainEqual({ type: 'string', path: ['user', 'posts', '[]', 'title'] });
      expect(visited).toContainEqual({ type: 'array', path: ['user', 'posts', '[]', 'tags'] });
      expect(visited).toContainEqual({ type: 'string', path: ['user', 'posts', '[]', 'tags', '[]'] });
      expect(visited).toContainEqual({ type: 'union', path: ['settings', 'theme'] });
      expect(visited).toContainEqual({ type: 'literal', path: ['settings', 'theme', '|0'] });
      expect(visited).toContainEqual({ type: 'literal', path: ['settings', 'theme', '|1'] });
    });

    it('should handle simple schemas', () => {
      const schema = string();
      const visited: string[] = [];
      
      walkSchema(schema, (s) => {
        visited.push(s._type);
      });
      
      expect(visited).toEqual(['string']);
    });

    it('should handle array schemas', () => {
      const schema = array(array(number()));
      const visited: Array<{ type: string; path: string[] }> = [];
      
      walkSchema(schema, (s, path) => {
        visited.push({ type: s._type, path });
      });
      
      expect(visited).toContainEqual({ type: 'array', path: [] });
      expect(visited).toContainEqual({ type: 'array', path: ['[]'] });
      expect(visited).toContainEqual({ type: 'number', path: ['[]', '[]'] });
    });

    it('should handle union schemas', () => {
      const schema = union([
        string(),
        number(),
        object({ value: boolean() })
      ]);
      
      const visited: Array<{ type: string; path: string[] }> = [];
      walkSchema(schema, (s, path) => {
        visited.push({ type: s._type, path });
      });
      
      expect(visited).toContainEqual({ type: 'union', path: [] });
      expect(visited).toContainEqual({ type: 'string', path: ['|0'] });
      expect(visited).toContainEqual({ type: 'number', path: ['|1'] });
      expect(visited).toContainEqual({ type: 'object', path: ['|2'] });
      expect(visited).toContainEqual({ type: 'boolean', path: ['|2', 'value'] });
    });
  });

  describe('toJsonSchema', () => {
    it('should convert string schema to JSON Schema', () => {
      const schema = string();
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('string');
    });

    it('should convert number schema to JSON Schema', () => {
      const schema = number();
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('number');
    });

    it('should convert integer schema to JSON Schema', () => {
      const schema = number().int();
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('integer');
    });

    it('should convert boolean schema to JSON Schema', () => {
      const schema = boolean();
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('boolean');
    });

    it('should convert null schema to JSON Schema', () => {
      const schema = nullSchema();
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('null');
    });

    it('should convert object schema to JSON Schema', () => {
      const schema = object({
        name: string(),
        age: number(),
        active: boolean()
      });
      
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties).toBeDefined();
      expect(jsonSchema.properties.name.type).toBe('string');
      expect(jsonSchema.properties.age.type).toBe('number');
      expect(jsonSchema.properties.active.type).toBe('boolean');
    });

    it('should convert array schema to JSON Schema', () => {
      const schema = array(string());
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('array');
      expect(jsonSchema.items).toBeDefined();
      expect(jsonSchema.items.type).toBe('string');
    });

    it('should convert union schema to JSON Schema', () => {
      const schema = union([string(), number()]);
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.oneOf).toBeDefined();
      expect(jsonSchema.oneOf).toHaveLength(2);
      expect(jsonSchema.oneOf[0].type).toBe('string');
      expect(jsonSchema.oneOf[1].type).toBe('number');
    });

    it('should handle constraints in JSON Schema', () => {
      const schema = string().min(3).max(10).describe('Test string');
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('string');
      expect(jsonSchema.minLength).toBe(3);
      expect(jsonSchema.maxLength).toBe(10);
      expect(jsonSchema.description).toBe('Test string');
    });

    it('should handle nullable types in JSON Schema', () => {
      const schema = string().nullable();
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toEqual(['string', 'null']);
    });

    it('should handle default types in JSON Schema', () => {
      const schema = literal('test');
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('literal');
    });

    it('should handle nested object schemas', () => {
      const schema = object({
        user: object({
          profile: object({
            name: string()
          })
        })
      });
      
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties.user.type).toBe('object');
      expect(jsonSchema.properties.user.properties.profile.type).toBe('object');
      expect(jsonSchema.properties.user.properties.profile.properties.name.type).toBe('string');
    });

    it('should handle union with unionOptions property', () => {
      // Create a mock union schema with _unionOptions
      const mockUnion = union([string(), number()]);
      // Union already uses _unionOptions internally
      
      const jsonSchema = toJsonSchema(mockUnion);
      
      expect(jsonSchema.oneOf).toBeDefined();
      expect(jsonSchema.oneOf).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should handle schemas without checks array', () => {
      const schema: any = {
        _type: 'custom',
        isOptional: () => false,
        isNullable: () => false
      };
      
      const info = introspect(schema as SchemaDefinition);
      expect(info.constraints).toBeUndefined();
    });

    it('should handle union schemas without options', () => {
      const schema: any = {
        _type: 'union',
        isOptional: () => false,
        isNullable: () => false
      };
      Object.setPrototypeOf(schema, union([string()]).constructor.prototype);
      
      const info = introspect(schema as SchemaDefinition);
      expect(info.options).toBeUndefined();
    });

    it('should handle array schemas without element', () => {
      const schema: any = {
        _type: 'array',
        isOptional: () => false,
        isNullable: () => false
      };
      Object.setPrototypeOf(schema, array(string()).constructor.prototype);
      
      const info = introspect(schema as SchemaDefinition);
      expect(info.items).toBeUndefined();
    });
  });
});