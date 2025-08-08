import v from '../../src';
import { createGuard, createAssert, is, assert, isSchema } from '../../src/utils/guards';

describe('Type Guards', () => {
  describe('createGuard', () => {
    it('should create a type guard function', () => {
      const schema = v.object({
        name: v.string(),
        age: v.number()
      });
      
      const isUser = createGuard(schema);
      
      expect(isUser({ name: 'John', age: 30 })).toBe(true);
      expect(isUser({ name: 'John' })).toBe(false);
      expect(isUser({ name: 'John', age: '30' })).toBe(false);
      expect(isUser(null)).toBe(false);
    });
  });

  describe('createAssert', () => {
    it('should create an assertion function', () => {
      const schema = v.string().email();
      const assertEmail = createAssert(schema);
      
      expect(() => assertEmail('user@example.com')).not.toThrow();
      expect(() => assertEmail('invalid')).toThrow();
      expect(() => assertEmail(123)).toThrow();
    });
  });

  describe('is', () => {
    it('should check if value matches schema', () => {
      const schema = v.number().positive();
      
      expect(is(schema, 5)).toBe(true);
      expect(is(schema, -5)).toBe(false);
      expect(is(schema, '5')).toBe(false);
      expect(is(schema, null)).toBe(false);
    });

    it('should work with complex schemas', () => {
      const schema = v.union([
        v.string(),
        v.number()
      ]);
      
      expect(is(schema, 'hello')).toBe(true);
      expect(is(schema, 123)).toBe(true);
      expect(is(schema, true)).toBe(false);
      expect(is(schema, {})).toBe(false);
    });
  });

  describe('assert', () => {
    it('should assert value matches schema', () => {
      const schema = v.array(v.number());
      
      expect(() => assert(schema, [1, 2, 3])).not.toThrow();
      expect(() => assert(schema, [])).not.toThrow();
      expect(() => assert(schema, [1, '2', 3])).toThrow();
      expect(() => assert(schema, 'not an array')).toThrow();
    });
  });

  describe('isSchema', () => {
    it('should detect valid schemas', () => {
      expect(isSchema(v.string())).toBe(true);
      expect(isSchema(v.number())).toBe(true);
      expect(isSchema(v.object({ a: v.string() }))).toBe(true);
      expect(isSchema(v.array(v.number()))).toBe(true);
    });

    it('should reject non-schemas', () => {
      expect(isSchema(null)).toBe(false);
      expect(isSchema(undefined)).toBe(false);
      expect(isSchema({})).toBe(false);
      expect(isSchema({ parse: 'not a function' })).toBe(false);
      expect(isSchema('string')).toBe(false);
      expect(isSchema(123)).toBe(false);
    });
  });

  describe('discriminated union guards', () => {
    it('should create discriminated union guards', () => {
      const catSchema = v.object({
        type: v.literal('cat'),
        meow: v.boolean()
      });
      
      const dogSchema = v.object({
        type: v.literal('dog'),
        bark: v.boolean()
      });
      
      const animalSchema = v.union([catSchema, dogSchema]);
      
      const animal = { type: 'cat', meow: true };
      expect(is(animalSchema, animal)).toBe(true);
      
      // Type narrowing would work in TypeScript
      if (animal.type === 'cat') {
        expect(is(catSchema, animal)).toBe(true);
      }
    });
  });
});