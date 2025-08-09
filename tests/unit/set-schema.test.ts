import { set } from '../../src/schemas/complex/set';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { object } from '../../src/schemas/complex/object';
import { array } from '../../src/schemas/complex/array';
import { ErrorCode } from '../../src/types/errors';

describe('SetSchema', () => {
  describe('basic set validation', () => {
    const schema = set(number());

    it('should parse valid sets', () => {
      const setData = new Set([1, 2, 3, 4, 5]);
      const result = schema.parse(setData);
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(5);
      expect(result.has(1)).toBe(true);
      expect(result.has(5)).toBe(true);
    });

    it('should parse empty sets', () => {
      const emptySet = new Set();
      const result = schema.parse(emptySet);
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('should reject non-set types', () => {
      expect(() => schema.parse('not a set')).toThrow();
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse([])).toThrow();
      expect(() => schema.parse({})).toThrow();
    });

    it('should validate all elements', () => {
      const invalidSet = new Set([1, 2, 'not number', 4] as any);
      expect(() => schema.parse(invalidSet)).toThrow();
    });

    it('should return error for invalid type', () => {
      const result = schema.safeParse([1, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_TYPE);
        expect(result.error?.issues[0]?.expected).toBe('Set');
        expect(result.error?.issues[0]?.received).toBe('array');
      }
    });
  });

  describe('string elements', () => {
    const schema = set(string());

    it('should parse sets of strings', () => {
      const setData = new Set(['apple', 'banana', 'cherry']);
      const result = schema.parse(setData);
      expect(result.size).toBe(3);
      expect(result.has('apple')).toBe(true);
      expect(result.has('banana')).toBe(true);
      expect(result.has('cherry')).toBe(true);
    });

    it('should handle duplicate values correctly', () => {
      // Sets naturally deduplicate
      const setData = new Set(['a', 'b', 'a', 'c', 'b']);
      expect(setData.size).toBe(3); // Original set already deduped
      const result = schema.parse(setData);
      expect(result.size).toBe(3);
    });

    it('should reject non-string elements', () => {
      const invalidSet = new Set(['valid', 123, 'another'] as any);
      expect(() => schema.parse(invalidSet)).toThrow();
    });
  });

  describe('boolean elements', () => {
    const schema = set(boolean());

    it('should parse sets of booleans', () => {
      const setData = new Set([true, false]);
      const result = schema.parse(setData);
      expect(result.size).toBe(2);
      expect(result.has(true)).toBe(true);
      expect(result.has(false)).toBe(true);
    });

    it('should handle single boolean', () => {
      const setData = new Set([true]);
      const result = schema.parse(setData);
      expect(result.size).toBe(1);
      expect(result.has(true)).toBe(true);
    });

    it('should reject non-boolean elements', () => {
      const invalidSet = new Set([true, 'not boolean'] as any);
      expect(() => schema.parse(invalidSet)).toThrow();
    });
  });

  describe('complex element types', () => {
    const schema = set(object({ id: number(), name: string() }));

    it('should parse sets of objects', () => {
      const obj1 = { id: 1, name: 'Alice' };
      const obj2 = { id: 2, name: 'Bob' };
      const setData = new Set([obj1, obj2]);
      const result = schema.parse(setData);
      expect(result.size).toBe(2);
      // Note: Set equality for objects is by reference
      const resultArray = Array.from(result);
      expect(resultArray[0]).toEqual(obj1);
      expect(resultArray[1]).toEqual(obj2);
    });

    it('should validate object structure', () => {
      const invalidSet = new Set([
        { id: 1, name: 'Valid' },
        { id: 'not number', name: 'Invalid' }
      ] as any);
      expect(() => schema.parse(invalidSet)).toThrow();
    });

    it('should handle empty object sets', () => {
      const emptySet = new Set<{ id: number; name: string }>();
      const result = schema.parse(emptySet);
      expect(result.size).toBe(0);
    });
  });

  describe('async parsing', () => {
    const schema = set(number());

    it('should parse async valid sets', async () => {
      const setData = new Set([10, 20, 30]);
      const result = await schema.parseAsync(setData);
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(3);
      expect(result.has(20)).toBe(true);
    });

    it('should parse async empty sets', async () => {
      const emptySet = new Set();
      const result = await schema.parseAsync(emptySet);
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('should reject async non-sets', async () => {
      await expect(schema.parseAsync('not set')).rejects.toThrow();
      await expect(schema.parseAsync(123)).rejects.toThrow();
      await expect(schema.parseAsync(null)).rejects.toThrow();
    });

    it('should validate async all elements', async () => {
      const invalidSet = new Set([1, 2, 'invalid', 4] as any);
      await expect(schema.parseAsync(invalidSet)).rejects.toThrow();
    });

    it('should handle async errors gracefully', async () => {
      const mixedSet = new Set([1, 'string', 3] as any);
      await expect(schema.parseAsync(mixedSet)).rejects.toThrow();
    });
  });

  describe('safeParse with sets', () => {
    const schema = set(string().min(3));

    it('should return success for valid sets', () => {
      const setData = new Set(['abc', 'def', 'ghi']);
      const result = schema.safeParse(setData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Set);
        expect(result.data.size).toBe(3);
      }
    });

    it('should return error for invalid elements', () => {
      const setData = new Set(['abc', 'de', 'ghi']); // 'de' is too short
      const result = schema.safeParse(setData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle large sets', () => {
      const schema = set(number());
      const setData = new Set();
      for (let i = 0; i < 1000; i++) {
        setData.add(i);
      }
      const result = schema.parse(setData);
      expect(result.size).toBe(1000);
      expect(result.has(500)).toBe(true);
    });

    it('should preserve unique values only', () => {
      const schema = set(string());
      // Input set already has unique values
      const setData = new Set(['a', 'b', 'c']);
      const result = schema.parse(setData);
      expect(result.size).toBe(3);
      expect(Array.from(result).sort()).toEqual(['a', 'b', 'c']);
    });

    it('should handle Symbol elements', () => {
      const sym1 = Symbol('test1');
      const sym2 = Symbol('test2');
      const setData = new Set([sym1, sym2, 'string'] as any);
      const schema = set(string());
      // Symbols will fail string validation
      expect(() => schema.parse(setData)).toThrow();
    });

    it('should handle undefined elements', () => {
      const setData = new Set([1, undefined, 3] as any);
      const schema = set(number());
      expect(() => schema.parse(setData)).toThrow();
    });
  });

  describe('nested sets', () => {
    const nestedSchema = set(array(number()));

    it('should parse sets of arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      const setData = new Set([arr1, arr2]);
      const result = nestedSchema.parse(setData);
      expect(result.size).toBe(2);
      const resultArray = Array.from(result);
      expect(resultArray[0]).toEqual(arr1);
      expect(resultArray[1]).toEqual(arr2);
    });

    it('should validate nested structures', () => {
      const invalidSet = new Set([
        [1, 2, 3],
        [4, 'not number', 6]
      ] as any);
      expect(() => nestedSchema.parse(invalidSet)).toThrow();
    });
  });

  describe('schema properties', () => {
    const schema = set(string());

    it('should expose element schema', () => {
      expect(schema.element).toBeDefined();
      expect(schema.element._type).toBe('string');
    });
  });

  describe('error handling', () => {
    const schema = set(number().positive());

    it('should collect validation errors', () => {
      const setData = new Set([1, -2, 3, -4]);
      const result = schema.safeParse(setData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should provide clear error paths', () => {
      const setData = new Set(['not a number'] as any);
      const result = schema.safeParse(setData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.path).toBeDefined();
      }
    });
  });

  describe('type inference', () => {
    it('should properly type parsed results', () => {
      const schema = set(number());
      const setData = new Set([1, 2, 3]);
      const result = schema.parse(setData);
      
      // TypeScript should infer result as Set<number>
      const _typeCheck: Set<number> = result;
      expect(_typeCheck.has(2)).toBe(true);
    });
  });

  describe('performance', () => {
    it('should handle concurrent async validation', async () => {
      const schema = set(number());
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const setData = new Set([i, i + 1, i + 2]);
        promises.push(schema.parseAsync(setData));
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result.has(i)).toBe(true);
      });
    });
  });

  describe('set operations', () => {
    const schema = set(number());

    it('should work with set operations after parsing', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([3, 4, 5]);
      
      const result1 = schema.parse(set1);
      const result2 = schema.parse(set2);
      
      // Intersection
      const intersection = new Set([...result1].filter(x => result2.has(x)));
      expect(intersection.size).toBe(1);
      expect(intersection.has(3)).toBe(true);
      
      // Union
      const union = new Set([...result1, ...result2]);
      expect(union.size).toBe(5);
    });
  });
});