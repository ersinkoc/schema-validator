import { preprocess } from '../../src/schemas/complex/preprocess';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { object } from '../../src/schemas/complex/object';
import { array } from '../../src/schemas/complex/array';

describe('PreprocessSchema', () => {
  describe('basic preprocessing', () => {
    const schema = preprocess(
      (val) => String(val).toUpperCase(),
      string()
    );

    it('should preprocess and validate', () => {
      expect(schema.parse('hello')).toBe('HELLO');
      expect(schema.parse('World')).toBe('WORLD');
    });

    it('should handle non-string inputs', () => {
      expect(schema.parse(123)).toBe('123');
      expect(schema.parse(true)).toBe('TRUE');
    });
  });

  describe('type coercion', () => {
    const numberCoercion = preprocess(
      (val) => Number(val),
      number()
    );

    it('should coerce strings to numbers', () => {
      expect(numberCoercion.parse('42')).toBe(42);
      expect(numberCoercion.parse('3.14')).toBe(3.14);
    });

    it('should handle already numeric values', () => {
      expect(numberCoercion.parse(100)).toBe(100);
    });

    it('should fail for non-numeric strings', () => {
      expect(() => numberCoercion.parse('not a number')).toThrow();
    });
  });

  describe('trimming strings', () => {
    const trimmedString = preprocess(
      (val) => String(val).trim(),
      string().min(1)
    );

    it('should trim whitespace', () => {
      expect(trimmedString.parse('  hello  ')).toBe('hello');
      expect(trimmedString.parse('\n\tworld\n\t')).toBe('world');
    });

    it('should reject empty strings after trimming', () => {
      expect(() => trimmedString.parse('   ')).toThrow();
    });
  });

  describe('JSON parsing', () => {
    const jsonSchema = preprocess(
      (val) => {
        if (typeof val === 'string') {
          return JSON.parse(val);
        }
        return val;
      },
      object({
        name: string(),
        age: number()
      })
    );

    it('should parse JSON strings', () => {
      const jsonStr = '{"name": "John", "age": 30}';
      expect(jsonSchema.parse(jsonStr)).toEqual({ name: 'John', age: 30 });
    });

    it('should handle already parsed objects', () => {
      const obj = { name: 'Jane', age: 25 };
      expect(jsonSchema.parse(obj)).toEqual(obj);
    });

    it('should fail for invalid JSON', () => {
      expect(() => jsonSchema.parse('not json')).toThrow();
    });

    it('should validate parsed structure', () => {
      expect(() => jsonSchema.parse('{"name": "John"}')).toThrow(); // Missing age
      expect(() => jsonSchema.parse('{"name": "John", "age": "not number"}')).toThrow();
    });
  });

  describe('array normalization', () => {
    const arrayNormalizer = preprocess(
      (val) => {
        if (Array.isArray(val)) return val;
        return [val];
      },
      array(string())
    );

    it('should wrap non-arrays in arrays', () => {
      expect(arrayNormalizer.parse('single')).toEqual(['single']);
    });

    it('should keep arrays as-is', () => {
      expect(arrayNormalizer.parse(['one', 'two'])).toEqual(['one', 'two']);
    });

    it('should validate array elements', () => {
      expect(() => arrayNormalizer.parse([1, 2, 3])).toThrow();
    });
  });

  describe('boolean coercion', () => {
    const booleanCoercion = preprocess(
      (val) => {
        if (typeof val === 'boolean') return val;
        if (val === 'true' || val === '1' || val === 1) return true;
        if (val === 'false' || val === '0' || val === 0) return false;
        throw new Error('Cannot convert to boolean');
      },
      boolean()
    );

    it('should coerce truthy values', () => {
      expect(booleanCoercion.parse('true')).toBe(true);
      expect(booleanCoercion.parse('1')).toBe(true);
      expect(booleanCoercion.parse(1)).toBe(true);
    });

    it('should coerce falsy values', () => {
      expect(booleanCoercion.parse('false')).toBe(false);
      expect(booleanCoercion.parse('0')).toBe(false);
      expect(booleanCoercion.parse(0)).toBe(false);
    });

    it('should handle actual booleans', () => {
      expect(booleanCoercion.parse(true)).toBe(true);
      expect(booleanCoercion.parse(false)).toBe(false);
    });

    it('should fail for non-convertible values', () => {
      expect(() => booleanCoercion.parse('yes')).toThrow('Cannot convert to boolean');
      expect(() => booleanCoercion.parse('no')).toThrow('Cannot convert to boolean');
    });
  });

  describe('error handling', () => {
    const errorSchema = preprocess(
      (_val) => {
        throw new Error('Preprocessing error');
      },
      string()
    );

    it('should catch preprocessing errors', () => {
      expect(() => errorSchema.parse('anything')).toThrow('Preprocessing failed: Preprocessing error');
    });

    it('should handle non-Error throws', () => {
      const throwingSchema = preprocess(
        (_val) => {
          throw 'string error';
        },
        string()
      );
      expect(() => throwingSchema.parse('test')).toThrow('Preprocessing failed: string error');
    });

    it('should report preprocessing error in safeParse', () => {
      const result = errorSchema.safeParse('test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.message).toContain('Preprocessing failed');
      }
    });
  });

  describe('async preprocessing', () => {
    // Note: Async preprocessors are handled in _parseAsync
    const syncSchema = preprocess(
      (val) => String(val).toUpperCase(),
      string()
    );

    it('should handle async preprocessing', async () => {
      await expect(syncSchema.parseAsync('hello')).resolves.toBe('HELLO');
    });

    it('should handle async preprocessing errors', async () => {
      const errorAsyncSchema = preprocess(
        (_val) => {
          throw new Error('Async error');
        },
        string()
      );
      await expect(errorAsyncSchema.parseAsync('test')).rejects.toThrow('Preprocessing failed: Async error');
    });
  });

  describe('chained preprocessing', () => {
    const chainedSchema = preprocess(
      (val) => String(val).trim(),
      preprocess(
        (val) => String(val).toLowerCase(),
        string().min(1)
      )
    );

    it('should apply multiple preprocessors', () => {
      expect(chainedSchema.parse('  HELLO  ')).toBe('hello');
      expect(chainedSchema.parse(' WORLD ')).toBe('world');
    });
  });

  describe('complex preprocessing', () => {
    const dateSchema = preprocess(
      (val) => {
        if (val instanceof Date) return val.toISOString();
        if (typeof val === 'string') return new Date(val).toISOString();
        if (typeof val === 'number') return new Date(val).toISOString();
        throw new Error('Invalid date input');
      },
      string().regex(/^\d{4}-\d{2}-\d{2}T/)
    );

    it('should preprocess Date objects', () => {
      const date = new Date('2024-01-01');
      const result = dateSchema.parse(date);
      expect(result).toMatch(/^2024-01-01T/);
    });

    it('should preprocess date strings', () => {
      const result = dateSchema.parse('2024-01-01');
      expect(result).toMatch(/^2024-01-01T/);
    });

    it('should preprocess timestamps', () => {
      const timestamp = new Date('2024-01-01').getTime();
      const result = dateSchema.parse(timestamp);
      expect(result).toMatch(/^2024-01-01T/);
    });

    it('should fail for invalid date inputs', () => {
      expect(() => dateSchema.parse({})).toThrow('Invalid date input');
    });
  });

  describe('safeParse with preprocessing', () => {
    const schema = preprocess(
      (val) => Number(val),
      number().positive()
    );

    it('should return success for valid preprocessing', () => {
      const result = schema.safeParse('42');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should return error for preprocessing failures', () => {
      const result = schema.safeParse('not a number');
      expect(result.success).toBe(false);
    });

    it('should return error for validation failures', () => {
      const result = schema.safeParse('-5');
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should fail validation (negative number) not preprocessing
        expect(result.error?.issues[0]?.code).toBeDefined();
      }
    });
  });

  describe('default value preprocessing', () => {
    const defaultSchema = preprocess(
      (val) => val ?? 'default',
      string()
    );

    it('should provide default for undefined', () => {
      expect(defaultSchema.parse(undefined)).toBe('default');
    });

    it('should provide default for null', () => {
      expect(defaultSchema.parse(null)).toBe('default');
    });

    it('should not override actual values', () => {
      expect(defaultSchema.parse('')).toBe('');
      expect(defaultSchema.parse('value')).toBe('value');
      // Number 0 is not null/undefined, so it passes through and needs to be converted to string
      const numberSchema = preprocess(
        (val) => val === 0 ? '0' : val ?? 'default',
        string()
      );
      expect(numberSchema.parse(0)).toBe('0');
    });
  });

  describe('sanitization', () => {
    const sanitizeSchema = preprocess(
      (val) => {
        const str = String(val);
        // Remove potentially dangerous characters
        return str.replace(/[<>]/g, '');
      },
      string()
    );

    it('should sanitize input', () => {
      expect(sanitizeSchema.parse('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeSchema.parse('normal text')).toBe('normal text');
    });
  });

  describe('type inference', () => {
    it('should properly type preprocessed values', () => {
      const schema = preprocess(
        (val) => String(val).toUpperCase(),
        string()
      );
      const result = schema.parse('test');
      
      // TypeScript should infer result as string
      const _typeCheck: string = result;
      expect(_typeCheck).toBe('TEST');
    });
  });
});