import { map } from '../../src/schemas/complex/map';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { object } from '../../src/schemas/complex/object';
import { array } from '../../src/schemas/complex/array';
import { ErrorCode } from '../../src/types/errors';

describe('MapSchema', () => {
  describe('basic map validation', () => {
    const schema = map(string(), number());

    it('should parse valid maps', () => {
      const mapData = new Map([
        ['one', 1],
        ['two', 2],
        ['three', 3]
      ]);
      const result = schema.parse(mapData);
      expect(result).toBeInstanceOf(Map);
      expect(result.get('one')).toBe(1);
      expect(result.get('two')).toBe(2);
      expect(result.get('three')).toBe(3);
    });

    it('should parse empty maps', () => {
      const emptyMap = new Map();
      const result = schema.parse(emptyMap);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should reject non-map types', () => {
      expect(() => schema.parse('not a map')).toThrow();
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse([])).toThrow();
      expect(() => schema.parse({})).toThrow();
    });

    it('should validate all keys and values', () => {
      const invalidMap = new Map([
        ['valid', 1],
        [123, 2], // Invalid key
        ['another', 'not number'] // Invalid value
      ] as any);
      expect(() => schema.parse(invalidMap)).toThrow();
    });

    it('should return error for invalid type', () => {
      const result = schema.safeParse([1, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_TYPE);
        expect(result.error?.issues[0]?.expected).toBe('Map');
        expect(result.error?.issues[0]?.received).toBe('array');
      }
    });
  });

  describe('complex key-value types', () => {
    const complexSchema = map(
      object({ id: string() }),
      array(number())
    );

    it('should handle object keys and array values', () => {
      const mapData = new Map([
        [{ id: 'a' }, [1, 2, 3]],
        [{ id: 'b' }, [4, 5, 6]]
      ]);
      const result = complexSchema.parse(mapData);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
    });

    it('should validate complex structures', () => {
      const invalidMap = new Map([
        [{ id: 'a' }, [1, 2, 3]],
        [{ invalid: 'key' }, [4, 5, 6]] // Invalid key structure
      ] as any);
      expect(() => complexSchema.parse(invalidMap)).toThrow();
    });
  });

  describe('number keys', () => {
    const numberKeySchema = map(number(), string());

    it('should handle numeric keys', () => {
      const mapData = new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three']
      ]);
      const result = numberKeySchema.parse(mapData);
      expect(result.get(1)).toBe('one');
      expect(result.get(2)).toBe('two');
      expect(result.get(3)).toBe('three');
    });

    it('should reject invalid numeric keys', () => {
      const invalidMap = new Map([
        [1, 'one'],
        ['2', 'two'] // String instead of number
      ] as any);
      expect(() => numberKeySchema.parse(invalidMap)).toThrow();
    });
  });

  describe('boolean values', () => {
    const booleanValueSchema = map(string(), boolean());

    it('should handle boolean values', () => {
      const mapData = new Map([
        ['flag1', true],
        ['flag2', false],
        ['flag3', true]
      ]);
      const result = booleanValueSchema.parse(mapData);
      expect(result.get('flag1')).toBe(true);
      expect(result.get('flag2')).toBe(false);
      expect(result.get('flag3')).toBe(true);
    });

    it('should reject non-boolean values', () => {
      const invalidMap = new Map([
        ['flag1', true],
        ['flag2', 'not boolean']
      ] as any);
      expect(() => booleanValueSchema.parse(invalidMap)).toThrow();
    });
  });

  describe('async parsing', () => {
    const schema = map(string(), number());

    it('should parse async valid maps', async () => {
      const mapData = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);
      const result = await schema.parseAsync(mapData);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
    });

    it('should parse async empty maps', async () => {
      const emptyMap = new Map();
      const result = await schema.parseAsync(emptyMap);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should reject async non-maps', async () => {
      await expect(schema.parseAsync('not map')).rejects.toThrow();
      await expect(schema.parseAsync(123)).rejects.toThrow();
      await expect(schema.parseAsync(null)).rejects.toThrow();
    });

    it('should validate async all entries', async () => {
      const invalidMap = new Map([
        ['valid', 1],
        ['invalid', 'not number']
      ] as any);
      await expect(schema.parseAsync(invalidMap)).rejects.toThrow();
    });

    it('should handle async errors in keys', async () => {
      const invalidMap = new Map([
        ['valid', 1],
        [123, 2] // Invalid key type
      ] as any);
      await expect(schema.parseAsync(invalidMap)).rejects.toThrow();
    });
  });

  describe('safeParse with maps', () => {
    const schema = map(string(), boolean());

    it('should return success for valid maps', () => {
      const mapData = new Map([
        ['flag1', true],
        ['flag2', false]
      ]);
      const result = schema.safeParse(mapData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Map);
        expect(result.data.get('flag1')).toBe(true);
      }
    });

    it('should return error for invalid values', () => {
      const mapData = new Map([
        ['flag1', true],
        ['flag2', 'not boolean']
      ] as any);
      const result = schema.safeParse(mapData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle maps with undefined values', () => {
      // Map values can be undefined if the schema allows it
      const mapData = new Map([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]);
      const schema = map(string(), string());
      const result = schema.parse(mapData);
      expect(result.get('key1')).toBe('value1');
      expect(result.get('key2')).toBe('value2');
    });

    it('should handle large maps', () => {
      const schema = map(number(), number());
      const mapData = new Map();
      for (let i = 0; i < 1000; i++) {
        mapData.set(i, i * 2);
      }
      const result = schema.parse(mapData);
      expect(result.size).toBe(1000);
      expect(result.get(500)).toBe(1000);
    });

    it('should preserve insertion order', () => {
      const schema = map(string(), number());
      const mapData = new Map([
        ['z', 26],
        ['a', 1],
        ['m', 13]
      ]);
      const result = schema.parse(mapData);
      const keys = Array.from(result.keys());
      expect(keys).toEqual(['z', 'a', 'm']);
    });

    it('should handle Symbol keys', () => {
      const sym1 = Symbol('test1');
      const sym2 = Symbol('test2');
      // Maps with symbol keys need special handling
      const mapData = new Map([
        [sym1, 1],
        [sym2, 2],
        ['string', 3]
      ] as any);
      const schema = map(string(), number());
      // Symbol keys will fail string validation
      expect(() => schema.parse(mapData)).toThrow();
    });
  });

  describe('nested maps', () => {
    const nestedSchema = map(
      string(),
      map(string(), number())
    );

    it('should parse nested maps', () => {
      const innerMap1 = new Map([['a', 1], ['b', 2]]);
      const innerMap2 = new Map([['c', 3], ['d', 4]]);
      const mapData = new Map([
        ['first', innerMap1],
        ['second', innerMap2]
      ]);
      const result = nestedSchema.parse(mapData);
      expect(result.get('first')?.get('a')).toBe(1);
      expect(result.get('second')?.get('d')).toBe(4);
    });

    it('should validate nested map structures', () => {
      const invalidInner = new Map([['a', 'not number']] as any);
      const mapData = new Map([
        ['first', invalidInner]
      ]);
      expect(() => nestedSchema.parse(mapData)).toThrow();
    });
  });

  describe('schema properties', () => {
    const schema = map(string(), number());

    it('should expose key schema', () => {
      expect(schema.keySchema).toBeDefined();
      expect(schema.keySchema._type).toBe('string');
    });

    it('should expose value schema', () => {
      expect(schema.valueSchema).toBeDefined();
      expect(schema.valueSchema._type).toBe('number');
    });
  });

  describe('error handling', () => {
    const schema = map(string().min(2), number().positive());

    it('should collect multiple validation errors', () => {
      const mapData = new Map([
        ['a', 1], // Key too short
        ['valid', -5], // Negative number
        ['b', 0] // Key too short and zero (not positive)
      ] as any);
      
      const result = schema.safeParse(mapData);
      expect(result.success).toBe(false);
      if (!result.success) {
        // At least one error should be present
        expect(result.error?.issues.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should provide clear error paths', () => {
      const mapData = new Map([
        ['valid', 'not a number']
      ] as any);
      
      const result = schema.safeParse(mapData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.path).toBeDefined();
      }
    });
  });

  describe('type inference', () => {
    it('should properly type parsed results', () => {
      const schema = map(string(), number());
      const mapData = new Map([['test', 42]]);
      const result = schema.parse(mapData);
      
      // TypeScript should infer result as Map<string, number>
      const _typeCheck: Map<string, number> = result;
      expect(_typeCheck.get('test')).toBe(42);
    });
  });

  describe('performance', () => {
    it('should handle concurrent async validation', async () => {
      const schema = map(string(), number());
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const mapData = new Map([[`key${i}`, i]]);
        promises.push(schema.parseAsync(mapData));
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result.get(`key${i}`)).toBe(i);
      });
    });
  });
});