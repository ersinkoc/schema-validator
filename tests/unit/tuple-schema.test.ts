import { tuple } from '../../src/schemas/complex/tuple';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { literal } from '../../src/schemas/primitives/literal';
import { ErrorCode } from '../../src/types/errors';
import { object } from '../../src/schemas/complex/object';
import { array } from '../../src/schemas/complex/array';

describe('TupleSchema', () => {
  describe('basic tuple validation', () => {
    const schema = tuple([string(), number(), boolean()]);

    it('should parse valid tuples', () => {
      const data = ['hello', 42, true];
      expect(schema.parse(data)).toEqual(data);
    });

    it('should reject invalid types', () => {
      expect(() => schema.parse('not an array')).toThrow();
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse({})).toThrow();
    });

    it('should validate each element type', () => {
      expect(() => schema.parse([123, 42, true])).toThrow(); // First should be string
      expect(() => schema.parse(['hello', 'not number', true])).toThrow(); // Second should be number
      expect(() => schema.parse(['hello', 42, 'not boolean'])).toThrow(); // Third should be boolean
    });

    it('should reject wrong length arrays', () => {
      expect(() => schema.parse(['hello', 42])).toThrow(); // Too short
      expect(() => schema.parse(['hello', 42, true, 'extra'])).toThrow(); // Too long
    });

    it('should return correct error for invalid type', () => {
      const result = schema.safeParse({ not: 'array' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_TYPE);
        expect(result.error?.issues[0]?.expected).toBe('array');
        expect(result.error?.issues[0]?.received).toBe('object');
      }
    });

    it('should return correct error for wrong length', () => {
      const result = schema.safeParse(['hello', 42]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.TOO_SMALL);
      }
    });
  });

  describe('tuple with rest elements', () => {
    const schema = tuple([string(), number()]).rest(boolean());

    it('should parse tuples with rest elements', () => {
      expect(schema.parse(['hello', 42])).toEqual(['hello', 42]);
      expect(schema.parse(['hello', 42, true])).toEqual(['hello', 42, true]);
      expect(schema.parse(['hello', 42, true, false, true])).toEqual(['hello', 42, true, false, true]);
    });

    it('should validate rest element types', () => {
      expect(() => schema.parse(['hello', 42, 'not boolean'])).toThrow();
      expect(() => schema.parse(['hello', 42, true, 'not boolean'])).toThrow();
    });

    it('should still validate fixed elements', () => {
      expect(() => schema.parse([123, 42])).toThrow(); // First should be string
      expect(() => schema.parse(['hello', 'not number'])).toThrow(); // Second should be number
    });

    it('should allow empty rest', () => {
      expect(schema.parse(['hello', 42])).toEqual(['hello', 42]);
    });
  });

  describe('empty tuple', () => {
    const emptyRestSchema = tuple([string()] as const);

    it('should handle arrays with required element', () => {
      expect(emptyRestSchema.parse(['test'])).toEqual(['test']);
    });

    it('should reject arrays missing required element', () => {
      expect(() => emptyRestSchema.parse([])).toThrow();
    });
  });

  describe('single element tuple', () => {
    const schema = tuple([string()]);

    it('should parse single element arrays', () => {
      expect(schema.parse(['hello'])).toEqual(['hello']);
    });

    it('should reject wrong type', () => {
      expect(() => schema.parse([123])).toThrow();
    });

    it('should reject wrong length', () => {
      expect(() => schema.parse([])).toThrow();
      expect(() => schema.parse(['hello', 'extra'])).toThrow();
    });
  });

  describe('complex element types', () => {
    const schema = tuple([
      object({ name: string(), age: number() }),
      array(string()),
      literal('constant')
    ]);

    it('should parse complex tuples', () => {
      const data = [
        { name: 'John', age: 30 },
        ['item1', 'item2'],
        'constant' as const
      ];
      expect(schema.parse(data)).toEqual(data);
    });

    it('should validate nested structures', () => {
      expect(() => schema.parse([
        { name: 'John', age: 'not number' },
        ['item1', 'item2'],
        'constant'
      ])).toThrow();

      expect(() => schema.parse([
        { name: 'John', age: 30 },
        ['item1', 123], // Should be all strings
        'constant'
      ])).toThrow();

      expect(() => schema.parse([
        { name: 'John', age: 30 },
        ['item1', 'item2'],
        'wrong' // Should be 'constant'
      ])).toThrow();
    });
  });

  describe('async parsing', () => {
    const schema = tuple([string(), number()]);

    it('should parse async valid tuples', async () => {
      const data = ['hello', 42];
      await expect(schema.parseAsync(data)).resolves.toEqual(data);
    });

    it('should reject async invalid types', async () => {
      await expect(schema.parseAsync('not array')).rejects.toThrow();
      await expect(schema.parseAsync(null)).rejects.toThrow();
    });

    it('should validate async element types', async () => {
      await expect(schema.parseAsync([123, 42])).rejects.toThrow();
      await expect(schema.parseAsync(['hello', 'not number'])).rejects.toThrow();
    });

    it('should reject async wrong length', async () => {
      await expect(schema.parseAsync(['hello'])).rejects.toThrow();
      await expect(schema.parseAsync(['hello', 42, 'extra'])).rejects.toThrow();
    });
  });

  describe('async with rest elements', () => {
    const schema = tuple([string()]).rest(number());

    it('should parse async tuples with rest', async () => {
      await expect(schema.parseAsync(['hello'])).resolves.toEqual(['hello']);
      await expect(schema.parseAsync(['hello', 1, 2, 3])).resolves.toEqual(['hello', 1, 2, 3]);
    });

    it('should validate async rest elements', async () => {
      await expect(schema.parseAsync(['hello', 'not number'])).rejects.toThrow();
    });
  });

  describe('safeParse with tuples', () => {
    const schema = tuple([boolean(), string()]);

    it('should return success for valid tuples', () => {
      const result = schema.safeParse([true, 'test']);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([true, 'test']);
      }
    });

    it('should return error for invalid elements', () => {
      const result = schema.safeParse(['not boolean', 'test']);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toBeDefined();
      }
    });
  });

  describe('nested tuples', () => {
    const schema = tuple([
      tuple([string(), number()]),
      tuple([boolean()])
    ]);

    it('should parse nested tuples', () => {
      const data = [['hello', 42], [true]];
      expect(schema.parse(data)).toEqual(data);
    });

    it('should validate nested tuple structures', () => {
      expect(() => schema.parse([['hello'], [true]])).toThrow(); // Inner tuple wrong length
      expect(() => schema.parse([['hello', 'not number'], [true]])).toThrow(); // Inner element wrong type
    });
  });

  describe('edge cases', () => {
    it('should handle large tuples', () => {
      const schemas = Array(100).fill(null).map(() => number());
      const schema = tuple(schemas as any);
      const data = Array(100).fill(null).map((_, i) => i);
      
      expect(schema.parse(data)).toEqual(data);
    });

    it('should handle mixed primitive and complex types', () => {
      const schema = tuple([
        string(),
        number(),
        boolean(),
        object({ x: number() }),
        array(string()),
        tuple([number(), number()])
      ]);
      
      const data = [
        'text',
        123,
        false,
        { x: 456 },
        ['a', 'b'],
        [1, 2]
      ];
      
      expect(schema.parse(data)).toEqual(data);
    });

    it('should handle rest with complex types', () => {
      const schema = tuple([string()]).rest(object({ value: number() }));
      
      const data = [
        'first',
        { value: 1 },
        { value: 2 },
        { value: 3 }
      ];
      
      expect(schema.parse(data)).toEqual(data);
    });
  });

  describe('error messages', () => {
    const schema = tuple([string(), number(), boolean()]);

    it('should provide clear error for wrong length', () => {
      const result = schema.safeParse(['a', 1]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.message).toContain('Expected array of length 3');
      }
    });

    it('should provide clear error for element type mismatch', () => {
      const result = schema.safeParse(['a', 'not number', true]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_TYPE);
      }
    });
  });

  describe('type inference', () => {
    it('should properly type parsed results', () => {
      const schema = tuple([string(), number(), boolean()]);
      const result = schema.parse(['test', 42, true]);
      
      // TypeScript should infer result as [string, number, boolean]
      const _typeCheck: [string, number, boolean] = result;
      expect(_typeCheck).toEqual(['test', 42, true]);
    });

    it('should properly type rest elements', () => {
      const schema = tuple([string()]).rest(number());
      const result = schema.parse(['test', 1, 2, 3]);
      
      // TypeScript should infer result as [string, ...number[]]
      const [first, ...rest] = result;
      const _firstCheck: string = first;
      const _restCheck: number[] = rest;
      
      expect(_firstCheck).toBe('test');
      expect(_restCheck).toEqual([1, 2, 3]);
    });
  });

  describe('methods', () => {
    it('should expose items', () => {
      const schema = tuple([string(), number()] as const);
      expect(schema.items).toEqual([string(), number()]);
    });

    it('should chain rest method', () => {
      const schema1 = tuple([string()]);
      const schema2 = schema1.rest(number());
      
      expect(schema1).not.toBe(schema2);
      expect(schema2.parse(['test', 1, 2])).toEqual(['test', 1, 2]);
    });
  });
});