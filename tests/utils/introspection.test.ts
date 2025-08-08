import v from '../../src';
import { 
  introspect, 
  getShape, 
  getPropertyNames, 
  getProperty,
  isType,
  hasModifier,
  toJsonSchema
} from '../../src/utils/introspection';

describe('Schema Introspection', () => {
  describe('introspect', () => {
    it('should introspect string schema', () => {
      const schema = v.string().min(5).max(10);
      const info = introspect(schema);
      
      expect(info.type).toBe('string');
      expect(info.optional).toBe(false);
      expect(info.nullable).toBe(false);
      expect(info.constraints).toMatchObject({
        minLength: 5,
        maxLength: 10
      });
    });

    it('should introspect number schema', () => {
      const schema = v.number().int().min(0).max(100);
      const info = introspect(schema);
      
      expect(info.type).toBe('number');
      expect(info.constraints).toMatchObject({
        min: 0,
        max: 100,
        integer: true
      });
    });

    it('should introspect object schema', () => {
      const schema = v.object({
        name: v.string(),
        age: v.number().optional()
      });
      const info = introspect(schema);
      
      expect(info.type).toBe('object');
      expect(info.properties).toBeDefined();
      expect(info.properties?.['name']?.type).toBe('string');
      expect(info.properties?.['age']?.type).toBe('number');
      expect(info.properties?.['age']?.optional).toBe(true);
    });

    it('should introspect array schema', () => {
      const schema = v.array(v.string()).min(1).max(5);
      const info = introspect(schema);
      
      expect(info.type).toBe('array');
      expect(info.items).toBeDefined();
      expect(info.items!.type).toBe('string');
      expect(info.constraints).toMatchObject({
        minItems: 1,
        maxItems: 5
      });
    });

    it('should introspect union schema', () => {
      const schema = v.union([v.string(), v.number()]);
      const info = introspect(schema);
      
      expect(info.type).toBe('union');
      expect(info.options).toBeDefined();
      expect(info.options).toHaveLength(2);
      expect(info.options?.[0]?.type).toBe('string');
      expect(info.options?.[1]?.type).toBe('number');
    });
  });

  describe('getShape', () => {
    it('should get object schema shape', () => {
      const schema = v.object({
        foo: v.string(),
        bar: v.number()
      });
      
      const shape = getShape(schema as any);
      expect(shape).toBeDefined();
      expect(shape['foo']).toBeDefined();
      expect(shape['bar']).toBeDefined();
    });
  });

  describe('getPropertyNames', () => {
    it('should get property names from object schema', () => {
      const schema = v.object({
        id: v.string(),
        name: v.string(),
        email: v.string().email()
      });
      
      const names = getPropertyNames(schema as any);
      expect(names).toEqual(['id', 'name', 'email']);
    });
  });

  describe('getProperty', () => {
    it('should get specific property from object schema', () => {
      const schema = v.object({
        id: v.string().uuid(),
        name: v.string()
      });
      
      const idSchema = getProperty(schema as any, 'id');
      expect(idSchema).toBeDefined();
      expect(idSchema!._type).toBe('string');
      
      const unknownSchema = getProperty(schema as any, 'unknown');
      expect(unknownSchema).toBeUndefined();
    });
  });

  describe('isType', () => {
    it('should check schema type', () => {
      expect(isType(v.string(), 'string')).toBe(true);
      expect(isType(v.string(), 'number')).toBe(false);
      expect(isType(v.array(v.string()), 'array')).toBe(true);
      expect(isType(v.object({}), 'object')).toBe(true);
    });
  });

  describe('hasModifier', () => {
    it('should check for optional modifier', () => {
      const required = v.string();
      const optional = v.string().optional();
      
      expect(hasModifier(required, 'optional')).toBe(false);
      expect(hasModifier(optional, 'optional')).toBe(true);
    });

    it('should check for nullable modifier', () => {
      const nonNullable = v.string();
      const nullable = v.string().nullable();
      
      expect(hasModifier(nonNullable, 'nullable')).toBe(false);
      expect(hasModifier(nullable, 'nullable')).toBe(true);
    });

    it('should check for default modifier', () => {
      const noDefault = v.string();
      const withDefault = v.string().default('hello');
      
      expect(hasModifier(noDefault, 'default')).toBe(false);
      expect(hasModifier(withDefault, 'default')).toBe(true);
    });
  });

  describe('toJsonSchema', () => {
    it('should convert string schema to JSON Schema', () => {
      const schema = v.string().min(3).max(10);
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema).toMatchObject({
        type: 'string',
        minLength: 3,
        maxLength: 10
      });
    });

    it('should convert number schema to JSON Schema', () => {
      const schema = v.number().int().positive();
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema).toMatchObject({
        type: 'integer'
      });
    });

    it('should convert object schema to JSON Schema', () => {
      const schema = v.object({
        name: v.string(),
        age: v.number()
      });
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema).toMatchObject({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      });
    });

    it('should convert array schema to JSON Schema', () => {
      const schema = v.array(v.string());
      const jsonSchema = toJsonSchema(schema);
      
      expect(jsonSchema).toMatchObject({
        type: 'array',
        items: { type: 'string' }
      });
    });
  });
});