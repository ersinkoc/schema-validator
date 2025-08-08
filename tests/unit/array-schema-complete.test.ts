import v from '../../src/index';
import { array } from '../../src/schemas/complex/array';

describe('Array Schema - Complete Coverage', () => {
  describe('array function', () => {
    it('should create an array schema', () => {
      const schema = array(v.string());
      expect(schema).toBeDefined();
      expect(schema._type).toBe('array');
    });

    it('should access element schema', () => {
      const elementSchema = v.string();
      const arraySchema = array(elementSchema);
      expect(arraySchema.element).toBe(elementSchema);
    });
  });

  describe('_parse method', () => {
    it('should parse valid arrays', () => {
      const schema = array(v.string());
      const result = schema.parse(['a', 'b', 'c']);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should fail on non-array input', () => {
      const schema = array(v.string());
      expect(() => schema.parse('not-array')).toThrow('Expected array, received string');
      expect(() => schema.parse(123)).toThrow('Expected array, received number');
      expect(() => schema.parse(null)).toThrow('Expected array, received null');
      expect(() => schema.parse(undefined)).toThrow('Expected array, received undefined');
    });

    it('should validate array elements', () => {
      const schema = array(v.number());
      expect(() => schema.parse([1, 'invalid', 3])).toThrow();
    });

    it('should handle empty arrays', () => {
      const schema = array(v.string());
      const result = schema.parse([]);
      expect(result).toEqual([]);
    });

    it('should throw on validation issues', () => {
      const schema = array(v.string());
      expect(() => schema.parse([1, 2, 3])).toThrow(); // numbers instead of strings
    });
  });

  describe('_parseAsync method', () => {
    it('should parse valid arrays asynchronously', async () => {
      const schema = array(v.string());
      const result = await schema.parseAsync(['a', 'b', 'c']);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should fail on non-array input asynchronously', async () => {
      const schema = array(v.string());
      await expect(schema.parseAsync('not-array')).rejects.toThrow('Expected array, received string');
      await expect(schema.parseAsync(123)).rejects.toThrow('Expected array, received number');
    });

    it('should handle async element validation', async () => {
      const schema = array(v.string());
      const result = await schema.parseAsync(['hello', 'world']);
      expect(result).toEqual(['hello', 'world']);
    });

    it('should handle empty arrays asynchronously', async () => {
      const schema = array(v.string());
      const result = await schema.parseAsync([]);
      expect(result).toEqual([]);
    });

    it('should handle validation errors in async parsing', async () => {
      const schema = array(v.number());
      await expect(schema.parseAsync([1, 'invalid', 3])).rejects.toThrow();
    });

    it('should handle Promise.allSettled results', async () => {
      const schema = array(v.string());
      // Test case where some elements might be valid but overall validation fails due to checks
      const result = await schema.parseAsync(['valid', 'also-valid']);
      expect(result).toEqual(['valid', 'also-valid']);
    });
  });

  describe('min constraint', () => {
    it('should enforce minimum length', () => {
      const schema = array(v.string()).min(2);
      expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
      expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should fail when array is too short', () => {
      const schema = array(v.string()).min(3);
      expect(() => schema.parse(['a'])).toThrow();
      expect(() => schema.parse(['a', 'b'])).toThrow();
    });

    it('should use custom min message', () => {
      const schema = array(v.string()).min(2, 'Need at least 2 items');
      try {
        schema.parse(['one']);
        fail('Expected validation to fail');
      } catch (error: any) {
        expect(error.message).toContain('Need at least 2 items');
      }
    });

    it('should handle min validation in async parsing', async () => {
      const schema = array(v.string()).min(2);
      const result = await schema.parseAsync(['a', 'b']);
      expect(result).toEqual(['a', 'b']);
      
      await expect(schema.parseAsync(['a'])).rejects.toThrow();
    });
  });

  describe('max constraint', () => {
    it('should enforce maximum length', () => {
      const schema = array(v.string()).max(3);
      expect(schema.parse(['a'])).toEqual(['a']);
      expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should fail when array is too long', () => {
      const schema = array(v.string()).max(2);
      expect(() => schema.parse(['a', 'b', 'c'])).toThrow();
    });

    it('should use custom max message', () => {
      const schema = array(v.string()).max(1, 'Too many items');
      try {
        schema.parse(['one', 'two']);
        fail('Expected validation to fail');
      } catch (error: any) {
        expect(error.message).toContain('Too many items');
      }
    });

    it('should handle max validation in async parsing', async () => {
      const schema = array(v.string()).max(2);
      const result = await schema.parseAsync(['a', 'b']);
      expect(result).toEqual(['a', 'b']);
      
      await expect(schema.parseAsync(['a', 'b', 'c'])).rejects.toThrow();
    });
  });

  describe('length constraint', () => {
    it('should enforce exact length', () => {
      const schema = array(v.string()).length(3);
      expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should fail when array length is incorrect', () => {
      const schema = array(v.string()).length(2);
      expect(() => schema.parse(['a'])).toThrow('Array must have exactly 2 elements');
      expect(() => schema.parse(['a', 'b', 'c'])).toThrow('Array must have exactly 2 elements');
    });

    it('should use custom length message', () => {
      const schema = array(v.string()).length(2, 'Must have exactly 2');
      try {
        schema.parse(['one']);
        fail('Expected validation to fail');
      } catch (error: any) {
        expect(error.message).toContain('Must have exactly 2');
      }
    });

    it('should handle length validation in async parsing', async () => {
      const schema = array(v.string()).length(2);
      const result = await schema.parseAsync(['a', 'b']);
      expect(result).toEqual(['a', 'b']);
      
      await expect(schema.parseAsync(['a'])).rejects.toThrow();
      await expect(schema.parseAsync(['a', 'b', 'c'])).rejects.toThrow();
    });
  });

  describe('nonempty constraint', () => {
    it('should enforce non-empty arrays', () => {
      const schema = array(v.string()).nonempty();
      expect(schema.parse(['a'])).toEqual(['a']);
      expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('should fail on empty arrays', () => {
      const schema = array(v.string()).nonempty();
      expect(() => schema.parse([])).toThrow('Array must not be empty');
    });

    it('should use custom nonempty message', () => {
      const schema = array(v.string()).nonempty('Cannot be empty');
      try {
        schema.parse([]);
        fail('Expected validation to fail');
      } catch (error: any) {
        expect(error.message).toContain('Cannot be empty');
      }
    });

    it('should handle nonempty validation in async parsing', async () => {
      const schema = array(v.string()).nonempty();
      const result = await schema.parseAsync(['a']);
      expect(result).toEqual(['a']);
      
      await expect(schema.parseAsync([])).rejects.toThrow();
    });
  });

  describe('multiple constraints', () => {
    it('should enforce multiple constraints', () => {
      const schema = array(v.string()).min(2).max(4);
      expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
      expect(schema.parse(['a', 'b', 'c', 'd'])).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should fail when multiple constraints are violated', () => {
      const schema = array(v.string()).min(2).max(4);
      expect(() => schema.parse(['a'])).toThrow(); // too short
      expect(() => schema.parse(['a', 'b', 'c', 'd', 'e'])).toThrow(); // too long
    });

    it('should chain constraints', () => {
      const schema = array(v.number()).min(1).max(3).nonempty();
      expect(schema.parse([1, 2])).toEqual([1, 2]);
      expect(() => schema.parse([])).toThrow(); // empty and below min
    });
  });

  describe('complex element types', () => {
    it('should handle object arrays', () => {
      const schema = array(v.object({ name: v.string(), age: v.number() }));
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
      ];
      expect(schema.parse(data)).toEqual(data);
    });

    it('should handle nested arrays', () => {
      const schema = array(array(v.string()));
      const data = [['a', 'b'], ['c', 'd']];
      expect(schema.parse(data)).toEqual(data);
    });

    it('should validate complex nested structures', () => {
      const schema = array(v.object({
        items: array(v.string()).min(1)
      }));
      
      const validData = [
        { items: ['item1'] },
        { items: ['item2', 'item3'] }
      ];
      expect(schema.parse(validData)).toEqual(validData);
      
      const invalidData = [
        { items: [] }, // empty array violates min(1)
        { items: ['valid'] }
      ];
      expect(() => schema.parse(invalidData)).toThrow();
    });
  });

  describe('safeParse method', () => {
    it('should return success for valid arrays', () => {
      const schema = array(v.string()).min(1);
      const result = schema.safeParse(['a', 'b']);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['a', 'b']);
      }
    });

    it('should return error for invalid arrays', () => {
      const schema = array(v.string()).min(2);
      const result = schema.safeParse(['a']);
      expect(result.success).toBe(false);
    });

    it('should return error for non-array input', () => {
      const schema = array(v.string());
      const result = schema.safeParse('not-array');
      expect(result.success).toBe(false);
    });
  });

  describe('safeParseAsync method', () => {
    it('should return success for valid arrays asynchronously', async () => {
      const schema = array(v.string()).min(1);
      const result = await schema.safeParseAsync(['a', 'b']);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['a', 'b']);
      }
    });

    it('should return error for invalid arrays asynchronously', async () => {
      const schema = array(v.string()).min(2);
      const result = await schema.safeParseAsync(['a']);
      expect(result.success).toBe(false);
    });
  });

  describe('integration with v.array', () => {
    it('should work with v.array syntax', () => {
      const schema = v.array(v.string()).min(1).max(5);
      expect(schema.parse(['hello', 'world'])).toEqual(['hello', 'world']);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle context errors properly in sync parsing', () => {
      const schema = array(v.string().min(5)); // Each string must be at least 5 chars
      expect(() => schema.parse(['hello', 'hi'])).toThrow(); // 'hi' is too short
    });

    it('should accumulate multiple validation errors', () => {
      const schema = array(v.number()).min(1).max(2);
      expect(() => schema.parse([])).toThrow(); // violates min
      expect(() => schema.parse([1, 2, 3])).toThrow(); // violates max
    });
  });
});