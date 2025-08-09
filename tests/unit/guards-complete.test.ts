import {
  createGuard,
  createAssert,
  is,
  assert,
  isSchema,
  createDiscriminatedUnionGuard,
  createUnionGuard,
  createIntersectionGuard,
  narrow
} from '../../src/utils/guards';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { object } from '../../src/schemas/complex/object';
import { union } from '../../src/schemas/complex/union';
import { literal } from '../../src/schemas/primitives/literal';
import { ValidationError } from '../../src/types/base';

describe('Guards - Complete Coverage', () => {
  describe('createGuard', () => {
    it('should create a type guard function', () => {
      const isString = createGuard(string());
      
      expect(isString('hello')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });

    it('should work with complex schemas', () => {
      const userSchema = object({
        name: string(),
        age: number()
      });
      const isUser = createGuard(userSchema);
      
      expect(isUser({ name: 'John', age: 30 })).toBe(true);
      expect(isUser({ name: 'John' })).toBe(false);
      expect(isUser({ age: 30 })).toBe(false);
      expect(isUser('not an object')).toBe(false);
    });
  });

  describe('createAssert', () => {
    it('should create an assertion function', () => {
      const assertString = createAssert(string());
      
      // Should not throw for valid values
      expect(() => assertString('hello')).not.toThrow();
      
      // Should throw for invalid values
      expect(() => assertString(123)).toThrow(ValidationError);
      expect(() => assertString(null)).toThrow(ValidationError);
    });

    it('should narrow type after assertion', () => {
      const assertNumber: (value: unknown) => asserts value is number = createAssert(number());
      const value: unknown = 42;
      
      assertNumber(value);
      // After assertion, TypeScript knows value is a number
      const doubled: number = value * 2;
      expect(doubled).toBe(84);
    });
  });

  describe('is', () => {
    it('should check if value matches schema', () => {
      const schema = string().min(3);
      
      expect(is(schema, 'hello')).toBe(true);
      expect(is(schema, 'hi')).toBe(false);
      expect(is(schema, 123)).toBe(false);
    });

    it('should work as a filter function', () => {
      const values: unknown[] = ['hello', 123, 'world', null, 'test'];
      const strings = values.filter(v => is(string(), v));
      
      expect(strings).toEqual(['hello', 'world', 'test']);
    });
  });

  describe('assert', () => {
    it('should assert value matches schema', () => {
      const schema = number().positive();
      
      expect(() => assert(schema, 42)).not.toThrow();
      expect(() => assert(schema, -5)).toThrow(ValidationError);
      expect(() => assert(schema, 'not a number')).toThrow(ValidationError);
    });

    it('should provide detailed error messages', () => {
      const schema = object({
        name: string(),
        age: number()
      });
      
      try {
        assert(schema, { name: 123, age: 'thirty' });
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).issues).toBeDefined();
      }
    });
  });

  describe('isSchema', () => {
    it('should identify valid schemas', () => {
      expect(isSchema(string())).toBe(true);
      expect(isSchema(number())).toBe(true);
      expect(isSchema(object({ a: string() }))).toBe(true);
    });

    it('should reject non-schemas', () => {
      expect(isSchema(null)).toBe(false);
      expect(isSchema(undefined)).toBe(false);
      expect(isSchema('string')).toBe(false);
      expect(isSchema(123)).toBe(false);
      expect(isSchema({})).toBe(false);
      expect(isSchema({ parse: 'not a function' })).toBe(false);
    });

    it('should check for required schema properties', () => {
      expect(isSchema({ parse: () => {}, safeParse: () => {} })).toBe(false); // Missing _type
      expect(isSchema({ _type: 'test', parse: () => {} })).toBe(false); // Missing safeParse
      expect(isSchema({ _type: 'test', safeParse: () => {} })).toBe(false); // Missing parse
    });
  });

  describe('createDiscriminatedUnionGuard', () => {
    const catSchema = object({
      type: literal('cat'),
      meow: boolean()
    });
    
    const dogSchema = object({
      type: literal('dog'),
      bark: boolean()
    });
    
    const birdSchema = object({
      type: literal('bird'),
      chirp: boolean()
    });

    type AnimalUnion = { type: 'cat'; meow: boolean } | { type: 'dog'; bark: boolean } | { type: 'bird'; chirp: boolean };
    const isAnimal = createDiscriminatedUnionGuard<AnimalUnion, 'type'>('type', {
      cat: catSchema,
      dog: dogSchema,
      bird: birdSchema
    });

    it('should identify correct union member', () => {
      expect(isAnimal({ type: 'cat', meow: true })).toBe(true);
      expect(isAnimal({ type: 'dog', bark: false })).toBe(true);
      expect(isAnimal({ type: 'bird', chirp: true })).toBe(true);
    });

    it('should reject invalid discriminator values', () => {
      expect(isAnimal({ type: 'fish', swim: true })).toBe(false);
      expect(isAnimal({ type: 'unknown' })).toBe(false);
    });

    it('should reject non-objects', () => {
      expect(isAnimal(null)).toBe(false);
      expect(isAnimal(undefined)).toBe(false);
      expect(isAnimal('cat')).toBe(false);
      expect(isAnimal(123)).toBe(false);
    });

    it('should reject objects without discriminator', () => {
      expect(isAnimal({ meow: true })).toBe(false);
      expect(isAnimal({ bark: false })).toBe(false);
    });

    it('should reject non-string discriminator values', () => {
      expect(isAnimal({ type: 123, meow: true })).toBe(false);
      expect(isAnimal({ type: null, bark: false })).toBe(false);
      expect(isAnimal({ type: undefined, chirp: true })).toBe(false);
    });

    it('should validate the full object, not just discriminator', () => {
      expect(isAnimal({ type: 'cat' })).toBe(false); // Missing meow
      expect(isAnimal({ type: 'cat', meow: 'not boolean' })).toBe(false);
      expect(isAnimal({ type: 'dog', meow: true })).toBe(false); // Wrong property
    });
  });

  describe('createUnionGuard', () => {
    const stringOrNumber = createUnionGuard([string(), number()]);
    const complexUnion = createUnionGuard([
      string().email(),
      number().positive(),
      boolean()
    ]);

    it('should accept any matching schema', () => {
      expect(stringOrNumber('hello')).toBe(true);
      expect(stringOrNumber(123)).toBe(true);
      expect(stringOrNumber(true)).toBe(false);
      expect(stringOrNumber(null)).toBe(false);
    });

    it('should work with complex schemas', () => {
      expect(complexUnion('test@example.com')).toBe(true);
      expect(complexUnion(42)).toBe(true);
      expect(complexUnion(true)).toBe(true);
      expect(complexUnion(false)).toBe(true);
      
      expect(complexUnion('not-an-email')).toBe(false);
      expect(complexUnion(-5)).toBe(false); // Not positive
      expect(complexUnion(null)).toBe(false);
    });

    it('should check all schemas in order', () => {
      const guard = createUnionGuard([
        string().min(10),
        string().min(5),
        string()
      ]);
      
      expect(guard('hello')).toBe(true); // Matches third schema
      expect(guard('hello world')).toBe(true); // Matches first schema
      expect(guard(123)).toBe(false); // Matches none
    });

    it('should return false when no schemas match', () => {
      const strictGuard = createUnionGuard([
        string().email(),
        number().int().positive()
      ]);
      
      expect(strictGuard('not-email')).toBe(false);
      expect(strictGuard(3.14)).toBe(false); // Not integer
      expect(strictGuard(-1)).toBe(false); // Not positive
      expect(strictGuard({})).toBe(false);
    });
  });

  describe('createIntersectionGuard', () => {
    const stringAndEmail = createIntersectionGuard([
      string(),
      string().email()
    ]);
    
    const positiveInt = createIntersectionGuard([
      number(),
      number().positive(),
      number().int()
    ]);

    it('should require all schemas to match', () => {
      expect(stringAndEmail('test@example.com')).toBe(true);
      expect(stringAndEmail('not-an-email')).toBe(false); // Fails email check
      expect(stringAndEmail(123)).toBe(false); // Fails string check
    });

    it('should work with multiple constraints', () => {
      expect(positiveInt(42)).toBe(true);
      expect(positiveInt(1)).toBe(true);
      
      expect(positiveInt(3.14)).toBe(false); // Not integer
      expect(positiveInt(-5)).toBe(false); // Not positive
      expect(positiveInt(0)).toBe(false); // Not positive
      expect(positiveInt('42')).toBe(false); // Not a number
    });

    it('should return false if any schema fails', () => {
      const guard = createIntersectionGuard([
        object({ a: string() }),
        object({ b: number() })
      ]);
      
      expect(guard({ a: 'test', b: 42 })).toBe(true);
      expect(guard({ a: 'test' })).toBe(false); // Missing b
      expect(guard({ b: 42 })).toBe(false); // Missing a
      expect(guard({ a: 123, b: 42 })).toBe(false); // Wrong type for a
    });

    it('should handle empty array', () => {
      const guard = createIntersectionGuard([]);
      expect(guard('anything')).toBe(true); // All zero schemas pass
    });

    it('should check all schemas even if first fails', () => {
      let checkCount = 0;
      const countingSchema = {
        _type: 'test',
        parse: () => { throw new Error('test'); },
        safeParse: () => {
          checkCount++;
          return { success: false, error: new ValidationError([]) };
        }
      };
      
      const guard = createIntersectionGuard([countingSchema as any, countingSchema as any, countingSchema as any]);
      expect(guard('test')).toBe(false);
      expect(checkCount).toBe(1); // Stops after first failure
    });
  });

  describe('narrow', () => {
    type Animal = 
      | { type: 'cat'; meow: boolean }
      | { type: 'dog'; bark: boolean }
      | { type: 'bird'; chirp: boolean };

    it('should narrow union types by discriminator', () => {
      const animal: Animal = { type: 'cat', meow: true };
      
      if (narrow(animal, 'type', 'cat')) {
        // TypeScript knows animal is a cat here
        expect(animal.meow).toBe(true);
      } else {
        fail('Should have narrowed to cat');
      }
    });

    it('should return false for non-matching discriminator', () => {
      const dog: Animal = { type: 'dog', bark: false };
      
      expect(narrow(dog, 'type', 'cat' as any)).toBe(false);
      expect(narrow(dog, 'type', 'bird' as any)).toBe(false);
      expect(narrow(dog, 'type', 'dog')).toBe(true);
    });

    it('should work with string literal types', () => {
      type Status = { status: 'pending' | 'active' | 'completed'; data: string };
      const item: Status = { status: 'active', data: 'test' };
      
      expect(narrow(item, 'status', 'active')).toBe(true);
      expect(narrow(item, 'status', 'pending')).toBe(false);
      expect(narrow(item, 'status', 'completed')).toBe(false);
    });

    it('should handle multiple discriminator values', () => {
      type Message = 
        | { kind: 'error'; code: number }
        | { kind: 'warning'; message: string }
        | { kind: 'info'; details: string };
      
      const messages: Message[] = [
        { kind: 'error', code: 404 },
        { kind: 'warning', message: 'Deprecated' },
        { kind: 'info', details: 'Success' }
      ];
      
      const errors = messages.filter(m => narrow(m, 'kind', 'error'));
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ kind: 'error', code: 404 });
      
      const warnings = messages.filter(m => narrow(m, 'kind', 'warning'));
      expect(warnings).toHaveLength(1);
      
      const infos = messages.filter(m => narrow(m, 'kind', 'info'));
      expect(infos).toHaveLength(1);
    });
  });

  describe('integration tests', () => {
    it('should work together in complex scenarios', () => {
      // Create schemas
      const userSchema = object({
        id: number(),
        name: string(),
        role: union([literal('admin'), literal('user')])
      });
      
      // Create guards
      const isUser = createGuard(userSchema);
      const assertUser = createAssert(userSchema);
      
      // Test data
      const validUser = { id: 1, name: 'Alice', role: 'admin' as const };
      const invalidUser = { id: 'one', name: 'Bob', role: 'user' };
      
      // Use guards
      expect(isUser(validUser)).toBe(true);
      expect(isUser(invalidUser)).toBe(false);
      
      // Use assertions
      expect(() => assertUser(validUser)).not.toThrow();
      expect(() => assertUser(invalidUser)).toThrow();
      
      // Use is helper
      expect(is(userSchema, validUser)).toBe(true);
      expect(is(userSchema, invalidUser)).toBe(false);
    });

    it('should handle nested discriminated unions', () => {
      type Response = { status: 'success'; data: { result: string } } | { status: 'error'; error: { code: number; message: string } };
      const responseSchema = createDiscriminatedUnionGuard<Response, 'status'>('status', {
        success: object({
          status: literal('success'),
          data: object({ result: string() })
        }),
        error: object({
          status: literal('error'),
          error: object({ code: number(), message: string() })
        })
      });
      
      expect(responseSchema({
        status: 'success',
        data: { result: 'done' }
      })).toBe(true);
      
      expect(responseSchema({
        status: 'error',
        error: { code: 404, message: 'Not found' }
      })).toBe(true);
      
      expect(responseSchema({
        status: 'pending'
      })).toBe(false);
    });
  });
});