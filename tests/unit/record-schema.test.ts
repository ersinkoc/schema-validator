import { record } from '../../src/schemas/complex/record';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { literal } from '../../src/schemas/primitives/literal';
import { ErrorCode } from '../../src/types/errors';
import { union } from '../../src/schemas/complex/union';

describe('RecordSchema', () => {
  describe('basic record validation', () => {
    const schema = record(string(), number());

    it('should parse valid records', () => {
      const data = {
        one: 1,
        two: 2,
        three: 3
      };
      const result = schema.parse(data);
      expect(result).toEqual(data);
    });

    it('should parse empty records', () => {
      const result = schema.parse({});
      expect(result).toEqual({});
    });

    it('should reject non-object types', () => {
      expect(() => schema.parse('not an object')).toThrow();
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse([])).toThrow();
    });

    it('should validate all values', () => {
      const data = {
        valid1: 1,
        valid2: 2,
        invalid: 'not a number'
      };
      expect(() => schema.parse(data)).toThrow();
    });

    it('should return error for invalid type', () => {
      const result = schema.safeParse([1, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_TYPE);
        expect(result.error?.issues[0]?.expected).toBe('object');
        expect(result.error?.issues[0]?.received).toBe('array');
      }
    });
  });

  describe('key validation', () => {
    it('should validate string keys', () => {
      const schema = record(string().min(3), number());
      const data = {
        abc: 1,
        defg: 2,
        hi: 3 // Too short
      };
      expect(() => schema.parse(data)).toThrow();
    });

    it('should validate literal keys', () => {
      const schema = record(
        union([literal('allowed1'), literal('allowed2')]),
        string()
      );
      
      const validData = {
        allowed1: 'value1',
        allowed2: 'value2'
      };
      expect(schema.parse(validData)).toEqual(validData);

      const invalidData = {
        allowed1: 'value1',
        notAllowed: 'value3'
      };
      expect(() => schema.parse(invalidData)).toThrow();
    });

    it('should handle numeric string keys', () => {
      const schema = record(string().regex(/^\d+$/), string());
      const data = {
        '123': 'value1',
        '456': 'value2',
        'abc': 'value3' // Should fail
      };
      expect(() => schema.parse(data)).toThrow();
    });
  });

  describe('value validation', () => {
    it('should validate complex value types', () => {
      const schema = record(string(), record(string(), number()));
      const data = {
        group1: {
          a: 1,
          b: 2
        },
        group2: {
          c: 3,
          d: 4
        }
      };
      expect(schema.parse(data)).toEqual(data);
    });

    it('should validate mixed value types', () => {
      const schema = record(string(), union([string(), number()]));
      const data = {
        strVal: 'hello',
        numVal: 42,
        anotherStr: 'world'
      };
      expect(schema.parse(data)).toEqual(data);
    });

    it('should reject invalid nested values', () => {
      const schema = record(string(), record(string(), boolean()));
      const data = {
        group1: {
          a: true,
          b: 'not boolean' // Invalid
        }
      };
      expect(() => schema.parse(data)).toThrow();
    });
  });

  describe('async parsing', () => {
    const schema = record(string(), number());

    it('should parse async valid records', async () => {
      const data = { a: 1, b: 2, c: 3 };
      await expect(schema.parseAsync(data)).resolves.toEqual(data);
    });

    it('should parse async empty records', async () => {
      await expect(schema.parseAsync({})).resolves.toEqual({});
    });

    it('should reject async non-objects', async () => {
      await expect(schema.parseAsync('not object')).rejects.toThrow();
      await expect(schema.parseAsync(123)).rejects.toThrow();
      await expect(schema.parseAsync(null)).rejects.toThrow();
    });

    it('should validate async all entries', async () => {
      const data = {
        valid: 1,
        invalid: 'not number'
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });
  });

  describe('safeParse with records', () => {
    const schema = record(string(), boolean());

    it('should return success for valid records', () => {
      const data = { flag1: true, flag2: false };
      const result = schema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return error for invalid values', () => {
      const data = { flag1: true, flag2: 'not boolean' };
      const result = schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle records with special characters in keys', () => {
      const schema = record(string(), string());
      const data = {
        'key-with-dash': 'value1',
        'key_with_underscore': 'value2',
        'key.with.dots': 'value3',
        'key@with@at': 'value4'
      };
      expect(schema.parse(data)).toEqual(data);
    });

    it('should handle records with unicode keys', () => {
      const schema = record(string(), number());
      const data = {
        '😀': 1,
        '日本語': 2,
        'Ñoño': 3
      };
      expect(schema.parse(data)).toEqual(data);
    });

    it('should handle large records', () => {
      const schema = record(string(), number());
      const data: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        data[`key${i}`] = i;
      }
      const result = schema.parse(data);
      expect(Object.keys(result)).toHaveLength(1000);
    });

    it('should not include prototype properties', () => {
      const schema = record(string(), string());
      const obj = Object.create({ inherited: 'should not appear' });
      obj.own = 'should appear';
      
      const result = schema.parse(obj);
      expect(result).toEqual({ own: 'should appear' });
      expect(result['inherited']).toBeUndefined();
    });
  });

  describe('complex nested structures', () => {
    it('should handle deeply nested records', () => {
      const schema = record(
        string(),
        record(
          string(),
          record(string(), number())
        )
      );

      const data = {
        level1: {
          level2a: {
            level3a: 1,
            level3b: 2
          },
          level2b: {
            level3c: 3
          }
        }
      };

      expect(schema.parse(data)).toEqual(data);
    });

    it('should validate all levels of nesting', () => {
      const schema = record(
        string(),
        record(string(), number())
      );

      const data = {
        valid: {
          a: 1,
          b: 2
        },
        invalid: {
          c: 3,
          d: 'not a number'
        }
      };

      expect(() => schema.parse(data)).toThrow();
    });
  });

  describe('performance', () => {
    it('should handle concurrent async validation', async () => {
      const schema = record(string(), number());
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const data = { [`key${i}`]: i };
        promises.push(schema.parseAsync(data));
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result).toEqual({ [`key${i}`]: i });
      });
    });
  });

  describe('type inference', () => {
    it('should properly type parsed results', () => {
      const schema = record(string(), number());
      const data = { a: 1, b: 2 };
      const result = schema.parse(data);
      
      // TypeScript should infer result as Record<string, number>
      const _typeCheck: Record<string, number> = result;
      expect(_typeCheck).toEqual(data);
    });
  });

  describe('error handling', () => {
    it('should collect multiple validation errors', () => {
      const schema = record(string().min(2), number());
      const data = {
        a: 1, // Key too short
        b: 'not number', // Invalid value
        c: 2 // Key too short
      };
      
      const result = schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have multiple issues
        expect(result.error?.issues.length).toBeGreaterThan(1);
      }
    });

    it('should provide clear error messages', () => {
      const schema = record(string(), number());
      const data = { key: 'not a number' };
      
      const result = schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBeDefined();
      }
    });
  });
});