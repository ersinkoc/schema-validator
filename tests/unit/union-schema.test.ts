import { union } from '../../src/schemas/complex/union';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { literal } from '../../src/schemas/primitives/literal';
import { object } from '../../src/schemas/complex/object';
import { array } from '../../src/schemas/complex/array';
import { ErrorCode } from '../../src/types/errors';

describe('UnionSchema', () => {
  describe('basic union validation', () => {
    const schema = union([string(), number(), boolean()]);

    it('should parse string values', () => {
      expect(schema.parse('hello')).toBe('hello');
    });

    it('should parse number values', () => {
      expect(schema.parse(42)).toBe(42);
    });

    it('should parse boolean values', () => {
      expect(schema.parse(true)).toBe(true);
      expect(schema.parse(false)).toBe(false);
    });

    it('should reject values not in union', () => {
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse([])).toThrow();
      expect(() => schema.parse({})).toThrow();
    });

    it('should return error for invalid union', () => {
      const result = schema.safeParse(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_UNION);
        expect(result.error?.issues[0]?.message).toContain('Invalid union');
      }
    });
  });

  describe('literal union', () => {
    const schema = union([literal('red'), literal('green'), literal('blue')]);

    it('should parse literal values', () => {
      expect(schema.parse('red')).toBe('red');
      expect(schema.parse('green')).toBe('green');
      expect(schema.parse('blue')).toBe('blue');
    });

    it('should reject non-matching literals', () => {
      expect(() => schema.parse('yellow')).toThrow();
      expect(() => schema.parse('RED')).toThrow(); // Case sensitive
      expect(() => schema.parse('')).toThrow();
    });
  });

  describe('complex type union', () => {
    const schema = union([
      string(),
      number(),
      object({ type: literal('object'), value: string() }),
      array(number())
    ]);

    it('should parse primitive types', () => {
      expect(schema.parse('text')).toBe('text');
      expect(schema.parse(123)).toBe(123);
    });

    it('should parse object type', () => {
      const obj = { type: 'object' as const, value: 'test' };
      expect(schema.parse(obj)).toEqual(obj);
    });

    it('should parse array type', () => {
      const arr = [1, 2, 3];
      expect(schema.parse(arr)).toEqual(arr);
    });

    it('should reject invalid complex types', () => {
      expect(() => schema.parse({ type: 'wrong', value: 'test' })).toThrow();
      expect(() => schema.parse(['not', 'numbers'])).toThrow();
    });
  });

  describe('nullable/optional pattern', () => {
    const nullableString = union([string(), literal(null)]);
    const optionalNumber = union([number(), literal(undefined)]);

    it('should handle nullable string', () => {
      expect(nullableString.parse('hello')).toBe('hello');
      expect(nullableString.parse(null)).toBe(null);
      expect(() => nullableString.parse(undefined)).toThrow();
    });

    it('should handle optional number', () => {
      expect(optionalNumber.parse(42)).toBe(42);
      expect(optionalNumber.parse(undefined)).toBe(undefined);
      expect(() => optionalNumber.parse(null)).toThrow();
    });
  });

  describe('async parsing', () => {
    const schema = union([string(), number()]);

    it('should parse async valid values', async () => {
      await expect(schema.parseAsync('hello')).resolves.toBe('hello');
      await expect(schema.parseAsync(42)).resolves.toBe(42);
    });

    it('should reject async invalid values', async () => {
      await expect(schema.parseAsync(true)).rejects.toThrow();
      await expect(schema.parseAsync(null)).rejects.toThrow();
      await expect(schema.parseAsync([])).rejects.toThrow();
    });

    it('should include union errors in async', async () => {
      const result = await schema.safeParseAsync(true);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_UNION);
        expect(result.error?.issues[0]?.options?.['unionErrors']).toBeDefined();
      }
    });
  });

  describe('nested unions', () => {
    const innerUnion = union([string(), number()]);
    const outerUnion = union([innerUnion, boolean()]);

    it('should parse nested union values', () => {
      expect(outerUnion.parse('text')).toBe('text');
      expect(outerUnion.parse(123)).toBe(123);
      expect(outerUnion.parse(true)).toBe(true);
    });

    it('should reject invalid nested values', () => {
      expect(() => outerUnion.parse(null)).toThrow();
      expect(() => outerUnion.parse([])).toThrow();
    });
  });

  describe('safeParse with unions', () => {
    const schema = union([string(), number()]);

    it('should return success for valid values', () => {
      const stringResult = schema.safeParse('test');
      expect(stringResult.success).toBe(true);
      if (stringResult.success) {
        expect(stringResult.data).toBe('test');
      }

      const numberResult = schema.safeParse(42);
      expect(numberResult.success).toBe(true);
      if (numberResult.success) {
        expect(numberResult.data).toBe(42);
      }
    });

    it('should return error with union errors', () => {
      const result = schema.safeParse(true);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.options?.['unionErrors']).toHaveLength(2);
      }
    });
  });

  describe('discriminated vs regular union', () => {
    const regularUnion = union([
      object({ type: literal('a'), value: string() }),
      object({ type: literal('b'), value: number() })
    ]);

    it('should work as discriminated union alternative', () => {
      expect(regularUnion.parse({ type: 'a', value: 'test' })).toEqual({ type: 'a', value: 'test' });
      expect(regularUnion.parse({ type: 'b', value: 42 })).toEqual({ type: 'b', value: 42 });
    });

    it('should validate all properties', () => {
      expect(() => regularUnion.parse({ type: 'a', value: 123 })).toThrow();
      expect(() => regularUnion.parse({ type: 'b', value: 'string' })).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle single option union', () => {
      const schema = union([string()]);
      expect(schema.parse('test')).toBe('test');
      expect(() => schema.parse(123)).toThrow();
    });

    it('should handle many options', () => {
      const types = [
        string(),
        number(),
        boolean(),
        literal(null),
        literal(undefined),
        array(string()),
        object({ x: number() })
      ];
      const schema = union(types as any);

      expect(schema.parse('str')).toBe('str');
      expect(schema.parse(123)).toBe(123);
      expect(schema.parse(true)).toBe(true);
      expect(schema.parse(null)).toBe(null);
      expect(schema.parse(undefined)).toBe(undefined);
      expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
      expect(schema.parse({ x: 1 })).toEqual({ x: 1 });
    });

    it('should try options in order', () => {
      // This union will match string first, even if it could match a more specific literal
      const schema = union([string(), literal('specific')]);
      expect(schema.parse('specific')).toBe('specific'); // Matches string(), not literal('specific')
      expect(schema.parse('other')).toBe('other');
    });

    it('should handle recursive structures', () => {
      const treeSchema: any = union([
        object({
          value: string(),
          children: array(object({
            value: string()
          })).optional()
        }),
        object({
          value: string()
        })
      ]);

      const tree = {
        value: 'root',
        children: [
          { value: 'child1' },
          { value: 'child2' }
        ]
      };

      expect(treeSchema.parse(tree)).toEqual(tree);
    });
  });

  describe('error accumulation', () => {
    const schema = union([
      string().min(5),
      number().positive(),
      boolean()
    ]);

    it('should collect errors from all branches', () => {
      const result = schema.safeParse([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        const unionErrors = result.error?.issues[0]?.options?.['unionErrors'];
        expect(unionErrors).toHaveLength(3);
        // Each branch should have tried to parse and failed
      }
    });

    it('should include detailed error info', () => {
      const result = schema.safeParse('ab'); // Too short for string().min(5)
      expect(result.success).toBe(false);
      if (!result.success) {
        const unionErrors = result.error?.issues[0]?.options?.['unionErrors'] as any;
        expect(unionErrors).toBeDefined();
        // First option (string) should have a "too small" error
        expect(unionErrors[0].issues[0].code).toBe(ErrorCode.TOO_SMALL);
      }
    });
  });

  describe('type inference', () => {
    it('should properly type union results', () => {
      const schema = union([string(), number(), boolean()]);
      const result = schema.parse('test');
      
      // TypeScript should infer result as string | number | boolean
      const _typeCheck: string | number | boolean = result;
      expect(_typeCheck).toBe('test');
    });
  });

  describe('methods', () => {
    it('should expose options', () => {
      const options = [string(), number()];
      const schema = union(options as [typeof options[0], ...typeof options]);
      expect(schema.options).toEqual(options);
    });
  });

  describe('performance', () => {
    it('should short-circuit on first match', () => {
      let checkCount = 0;
      
      const expensiveCheck = string().refine((val) => {
        checkCount++;
        return val.length > 0;
      });
      
      const schema = union([
        number(), // Will match first for numbers
        expensiveCheck // Should not be checked for numbers
      ]);
      
      schema.parse(42);
      expect(checkCount).toBe(0); // Expensive check was never run
    });
  });
});