import { functionSchema } from '../../src/schemas/complex/function';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { ErrorCode } from '../../src/types/errors';

describe('FunctionSchema', () => {
  describe('basic function validation', () => {
    const schema = functionSchema();

    it('should parse function types', () => {
      const fn = () => {};
      expect(schema.parse(fn)).toBe(fn);
      
      const fn2 = function() {};
      expect(schema.parse(fn2)).toBe(fn2);
      
      const fn3 = async () => {};
      expect(schema.parse(fn3)).toBe(fn3);
    });

    it('should reject non-function types', () => {
      expect(() => schema.parse('not a function')).toThrow();
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
    });

    it('should return correct error for non-functions', () => {
      const result = schema.safeParse('string');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_TYPE);
        expect(result.error?.issues[0]?.expected).toBe('function');
        expect(result.error?.issues[0]?.received).toBe('string');
      }
    });
  });

  describe('function with arguments validation', () => {
    const schema = functionSchema()
      .args(string(), number())
      .returns(boolean());

    it('should accept functions with any signature', () => {
      const fn1 = (_a: string, _b: number) => true;
      const fn2 = () => false;
      const fn3 = (_x: any, _y: any, _z: any) => true;
      
      expect(schema.parse(fn1)).toBe(fn1);
      expect(schema.parse(fn2)).toBe(fn2);
      expect(schema.parse(fn3)).toBe(fn3);
    });
  });

  describe('function implementation', () => {
    it('should validate arguments when implemented', () => {
      const schema = functionSchema()
        .args(string(), number())
        .implement((a: string, b: number) => a.repeat(b));

      const validFn = (s: string, n: number) => s.length * n;
      const wrappedFn = schema.parse(validFn);
      
      // Valid arguments should work
      expect(() => wrappedFn('hello', 3)).not.toThrow();
      
      // Invalid arguments should throw
      expect(() => wrappedFn(123 as any, 3)).toThrow();
      expect(() => wrappedFn('hello', 'not a number' as any)).toThrow();
    });

    it('should validate return value when implemented', () => {
      const schema = functionSchema()
        .returns(string())
        .implement(() => 'result');

      const fn = () => 123; // Returns number instead of string
      const wrappedFn = schema.parse(fn);
      
      // The wrapped function should throw because return type doesn't match
      expect(() => wrappedFn()).toThrow();
    });

    it('should validate both args and return when implemented', () => {
      const schema = functionSchema()
        .args(number(), number())
        .returns(number())
        .implement((a: number, b: number) => a + b);

      const fn = (x: number, y: number) => x * y;
      const wrappedFn = schema.parse(fn);
      
      // Valid args and return
      expect(wrappedFn(2, 3)).toBe(6);
      
      // Invalid args
      expect(() => wrappedFn('2' as any, 3)).toThrow();
      expect(() => wrappedFn(2, '3' as any)).toThrow();
    });
  });

  describe('async function parsing', () => {
    it('should parse async functions', async () => {
      const schema = functionSchema();
      const asyncFn = async () => 'result';
      
      await expect(schema.parseAsync(asyncFn)).resolves.toBe(asyncFn);
    });

    it('should reject non-functions async', async () => {
      const schema = functionSchema();
      
      await expect(schema.parseAsync('not a function')).rejects.toThrow();
      await expect(schema.parseAsync(123)).rejects.toThrow();
      await expect(schema.parseAsync(null)).rejects.toThrow();
    });

    it('should validate async function implementation', async () => {
      const schema = functionSchema()
        .args(string())
        .returns(number())
        .implement(async (s: string) => s.length);

      const fn = async (s: string) => s.length;
      const wrappedFn = await schema.parseAsync(fn);
      
      // Valid async call
      await expect(wrappedFn('hello')).resolves.toBe(5);
      
      // Invalid async args
      await expect(wrappedFn(123 as any)).rejects.toThrow();
    });
  });

  describe('safeParse with functions', () => {
    const schema = functionSchema();

    it('should return success for functions', () => {
      const fn = () => 'test';
      const result = schema.safeParse(fn);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(fn);
      }
    });

    it('should return error for non-functions', () => {
      const result = schema.safeParse([1, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toHaveLength(1);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle arrow functions', () => {
      const schema = functionSchema();
      const arrow = (x: number) => x * 2;
      expect(schema.parse(arrow)).toBe(arrow);
    });

    it('should handle function expressions', () => {
      const schema = functionSchema();
      const expr = function(x: number) { return x * 2; };
      expect(schema.parse(expr)).toBe(expr);
    });

    it('should handle async functions', () => {
      const schema = functionSchema();
      const asyncFn = async function() { return 'async'; };
      expect(schema.parse(asyncFn)).toBe(asyncFn);
    });

    it('should handle generator functions', () => {
      const schema = functionSchema();
      const genFn = function*() { yield 1; };
      expect(schema.parse(genFn)).toBe(genFn);
    });

    it('should handle class constructors', () => {
      const schema = functionSchema();
      class MyClass {}
      expect(schema.parse(MyClass)).toBe(MyClass);
    });

    it('should handle bound functions', () => {
      const schema = functionSchema();
      const obj = { value: 42 };
      function getValue(this: any) { return this.value; }
      const bound = getValue.bind(obj);
      expect(schema.parse(bound)).toBe(bound);
    });
  });

  describe('chaining methods', () => {
    it('should chain args method', () => {
      const schema1 = functionSchema();
      const schema2 = schema1.args(string(), number());
      
      expect(schema1).not.toBe(schema2);
      expect(schema2).toBeInstanceOf(functionSchema().constructor);
    });

    it('should chain returns method', () => {
      const schema1 = functionSchema();
      const schema2 = schema1.returns(string());
      
      expect(schema1).not.toBe(schema2);
      expect(schema2).toBeInstanceOf(functionSchema().constructor);
    });

    it('should chain implement method', () => {
      const schema1 = functionSchema();
      const schema2 = schema1.implement(() => 'test');
      
      expect(schema1).not.toBe(schema2);
      expect(schema2).toBeInstanceOf(functionSchema().constructor);
    });

    it('should chain multiple methods', () => {
      const schema = functionSchema()
        .args(string())
        .returns(number())
        .implement((s: string) => s.length);
      
      const fn = (s: string) => s.charCodeAt(0);
      const wrapped = schema.parse(fn);
      
      expect(wrapped('A')).toBe(65);
    });
  });

  describe('no validation (pass-through)', () => {
    it('should pass through function without implementation', () => {
      const schema = functionSchema()
        .args(string(), number())
        .returns(boolean());
      
      const fn = (_a: any, _b: any) => 'not boolean';
      const parsed = schema.parse(fn);
      
      // Without implementation, it just passes through
      expect(parsed).toBe(fn);
      expect(parsed(1 as any, 2 as any)).toBe('not boolean');
    });
  });

  describe('validation with implementation', () => {
    it('should wrap function when implementation is provided', () => {
      const schema = functionSchema()
        .implement(() => 'implemented');
      
      const originalFn = () => 'original';
      const wrappedFn = schema.parse(originalFn);
      
      // Should call original function (not the implementation)
      expect(wrappedFn()).toBe('original');
    });

    it('should validate all arguments', () => {
      const schema = functionSchema()
        .args(string(), number(), boolean())
        .implement((s: string, n: number, b: boolean) => `${s}-${n}-${b}`);
      
      const fn = (s: string, n: number, b: boolean) => `${s}:${n}:${b}`;
      const wrapped = schema.parse(fn);
      
      expect(wrapped('test', 42, true)).toBe('test:42:true');
      expect(() => wrapped('test', 42, 'not boolean' as any)).toThrow();
      expect(() => wrapped('test', 'not number' as any, true)).toThrow();
      expect(() => wrapped(123 as any, 42, true)).toThrow();
    });

    it('should handle missing arguments', () => {
      const schema = functionSchema()
        .args(string(), number())
        .implement((s: string, n: number) => s.repeat(n));
      
      const fn = (s: string, n: number) => s + n;
      const wrapped = schema.parse(fn);
      
      // Missing arguments should be undefined
      expect(() => (wrapped as any)('test')).toThrow(); // undefined is not a number
      expect(() => (wrapped as any)()).toThrow(); // undefined is not a string
    });
  });
});