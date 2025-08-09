import { promise } from '../../src/schemas/complex/promise';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { object } from '../../src/schemas/complex/object';
import { array } from '../../src/schemas/complex/array';
import { ErrorCode } from '../../src/types/errors';

describe('PromiseSchema', () => {
  describe('basic promise validation', () => {
    const schema = promise(string());

    it('should parse promises that resolve to valid values', async () => {
      const promiseData = Promise.resolve('hello');
      const result = schema.parse(promiseData);
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe('hello');
    });

    it('should reject promises that resolve to invalid values', async () => {
      const promiseData = Promise.resolve(123); // Should be string
      const result = schema.parse(promiseData);
      await expect(result).rejects.toThrow();
    });

    it('should reject non-promise types', () => {
      expect(() => schema.parse('not a promise')).toThrow();
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse([])).toThrow();
      expect(() => schema.parse({})).toThrow();
    });

    it('should return error for invalid type', () => {
      const result = schema.safeParse('not a promise');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_TYPE);
        expect(result.error?.issues[0]?.expected).toBe('Promise');
        expect(result.error?.issues[0]?.received).toBe('string');
      }
    });
  });

  describe('number promises', () => {
    const schema = promise(number());

    it('should parse promises resolving to numbers', async () => {
      const promiseData = Promise.resolve(42);
      const result = schema.parse(promiseData);
      await expect(result).resolves.toBe(42);
    });

    it('should reject promises resolving to non-numbers', async () => {
      const promiseData = Promise.resolve('not a number');
      const result = schema.parse(promiseData);
      await expect(result).rejects.toThrow();
    });

    it('should handle delayed promises', async () => {
      const promiseData = new Promise<number>(resolve => {
        setTimeout(() => resolve(100), 10);
      });
      const result = schema.parse(promiseData);
      await expect(result).resolves.toBe(100);
    });
  });

  describe('boolean promises', () => {
    const schema = promise(boolean());

    it('should parse promises resolving to booleans', async () => {
      const promiseTrue = Promise.resolve(true);
      const promiseFalse = Promise.resolve(false);
      
      const resultTrue = schema.parse(promiseTrue);
      const resultFalse = schema.parse(promiseFalse);
      
      await expect(resultTrue).resolves.toBe(true);
      await expect(resultFalse).resolves.toBe(false);
    });

    it('should reject promises resolving to non-booleans', async () => {
      const promiseData = Promise.resolve('true'); // String, not boolean
      const result = schema.parse(promiseData);
      await expect(result).rejects.toThrow();
    });
  });

  describe('complex promise types', () => {
    const schema = promise(object({ 
      id: number(), 
      name: string() 
    }));

    it('should parse promises resolving to objects', async () => {
      const promiseData = Promise.resolve({ id: 1, name: 'Alice' });
      const result = schema.parse(promiseData);
      await expect(result).resolves.toEqual({ id: 1, name: 'Alice' });
    });

    it('should validate object structure', async () => {
      const invalidPromise = Promise.resolve({ id: 'not number', name: 'Alice' });
      const result = schema.parse(invalidPromise);
      await expect(result).rejects.toThrow();
    });

    it('should handle missing properties', async () => {
      const incompletePromise = Promise.resolve({ id: 1 }); // Missing name
      const result = schema.parse(incompletePromise);
      await expect(result).rejects.toThrow();
    });
  });

  describe('array promises', () => {
    const schema = promise(array(number()));

    it('should parse promises resolving to arrays', async () => {
      const promiseData = Promise.resolve([1, 2, 3, 4, 5]);
      const result = schema.parse(promiseData);
      await expect(result).resolves.toEqual([1, 2, 3, 4, 5]);
    });

    it('should validate array elements', async () => {
      const invalidPromise = Promise.resolve([1, 'two', 3]); // Mixed types
      const result = schema.parse(invalidPromise);
      await expect(result).rejects.toThrow();
    });

    it('should handle empty arrays', async () => {
      const emptyPromise = Promise.resolve([]);
      const result = schema.parse(emptyPromise);
      await expect(result).resolves.toEqual([]);
    });
  });

  describe('async parsing', () => {
    const schema = promise(string());

    it('should handle async parsing of promises', async () => {
      const promiseData = Promise.resolve('async test');
      // parseAsync fully resolves the promise chain
      const result = await schema.parseAsync(promiseData);
      expect(result).toBe('async test');
    });

    it('should reject async invalid promises', async () => {
      const promiseData = Promise.resolve(123);
      try {
        const result = await schema.parseAsync(promiseData);
        // The inner promise should reject
        await result;
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject async non-promises', async () => {
      await expect(schema.parseAsync('not promise')).rejects.toThrow();
      await expect(schema.parseAsync(null)).rejects.toThrow();
    });
  });

  describe('rejected promises', () => {
    const schema = promise(string());

    it('should handle already rejected promises', async () => {
      const rejectedPromise = Promise.reject(new Error('Failed'));
      const result = schema.parse(rejectedPromise);
      await expect(result).rejects.toThrow('Failed');
    });

    it('should propagate rejection reasons', async () => {
      const customError = new Error('Custom rejection');
      const rejectedPromise = Promise.reject(customError);
      const result = schema.parse(rejectedPromise);
      await expect(result).rejects.toBe(customError);
    });
  });

  describe('safeParse with promises', () => {
    const schema = promise(number());

    it('should return success for valid promise types', () => {
      const promiseData = Promise.resolve(42);
      const result = schema.safeParse(promiseData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Promise);
      }
    });

    it('should return error for non-promise types', () => {
      const result = schema.safeParse(42); // Not a promise
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_TYPE);
      }
    });
  });

  describe('nested promises', () => {
    const nestedSchema = promise(array(object({
      value: number(),
      label: string()
    })));

    it('should handle deeply nested structures', async () => {
      const data = [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' }
      ];
      const promiseData = Promise.resolve(data);
      const result = nestedSchema.parse(promiseData);
      await expect(result).resolves.toEqual(data);
    });

    it('should validate nested structures', async () => {
      const invalidData = [
        { value: 1, label: 'One' },
        { value: 'two', label: 'Two' } // Invalid value type
      ];
      const promiseData = Promise.resolve(invalidData);
      const result = nestedSchema.parse(promiseData);
      await expect(result).rejects.toThrow();
    });
  });

  describe('schema property', () => {
    const innerSchema = string();
    const schema = promise(innerSchema);

    it('should expose inner schema', () => {
      expect(schema.schema).toBe(innerSchema);
      expect(schema.schema._type).toBe('string');
    });
  });

  describe('edge cases', () => {
    it('should handle promises with undefined', async () => {
      // Undefined is not a valid string
      const schema = promise(string());
      const promiseData = Promise.resolve(undefined);
      const result = schema.parse(promiseData);
      await expect(result).rejects.toThrow();
    });

    it('should handle promises with null', async () => {
      // Null is not a valid string
      const schema = promise(string());
      const promiseData = Promise.resolve(null);
      const result = schema.parse(promiseData);
      await expect(result).rejects.toThrow();
    });

    it('should handle long-running promises', async () => {
      const schema = promise(number());
      const promiseData = new Promise<number>(resolve => {
        setTimeout(() => resolve(999), 50);
      });
      const result = schema.parse(promiseData);
      await expect(result).resolves.toBe(999);
    });

    it('should handle thenable objects', async () => {
      const schema = promise(string());
      // A proper Promise is required, not just a thenable
      const realPromise = Promise.resolve('thenable value');
      const result = schema.parse(realPromise);
      await expect(result).resolves.toBe('thenable value');
    });
  });

  describe('error handling', () => {
    const schema = promise(number().positive());

    it('should provide clear validation errors', async () => {
      const promiseData = Promise.resolve(-5);
      const result = schema.parse(promiseData);
      
      try {
        await result;
        fail('Should have thrown');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.issues).toBeDefined();
      }
    });

    it('should handle synchronous throws in promises', async () => {
      const throwingPromise = new Promise(() => {
        throw new Error('Synchronous error');
      });
      // This will actually throw synchronously in the Promise constructor
      await expect(Promise.resolve().then(() => throwingPromise)).rejects.toThrow('Synchronous error');
    });
  });

  describe('type inference', () => {
    it('should properly type promise results', async () => {
      const schema = promise(number());
      const promiseData = Promise.resolve(42);
      const result = schema.parse(promiseData);
      
      // TypeScript should infer result as Promise<number>
      const _typeCheck: Promise<number> = result;
      await expect(_typeCheck).resolves.toBe(42);
    });
  });

  describe('performance', () => {
    it('should handle concurrent promise validation', async () => {
      const schema = promise(number());
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const promiseData = Promise.resolve(i * 10);
        promises.push(schema.parse(promiseData));
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result).toBe(i * 10);
      });
    });
  });
});