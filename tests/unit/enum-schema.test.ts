import { enumSchema, nativeEnum } from '../../src/schemas/complex/enum';
import { ErrorCode } from '../../src/types/errors';

describe('EnumSchema', () => {
  describe('basic enum validation', () => {
    const colors = enumSchema(['red', 'green', 'blue'] as const);

    it('should parse valid enum values', () => {
      expect(colors.parse('red')).toBe('red');
      expect(colors.parse('green')).toBe('green');
      expect(colors.parse('blue')).toBe('blue');
    });

    it('should reject invalid enum values', () => {
      expect(() => colors.parse('yellow')).toThrow();
      expect(() => colors.parse('')).toThrow();
      expect(() => colors.parse(null)).toThrow();
      expect(() => colors.parse(undefined)).toThrow();
      expect(() => colors.parse(123)).toThrow();
    });

    it('should return correct error for invalid values', () => {
      const result = colors.safeParse('purple');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_ENUM_VALUE);
        expect(result.error?.issues[0]?.options?.['expected']).toEqual(['red', 'green', 'blue']);
        expect(result.error?.issues[0]?.options?.['received']).toBe('purple');
      }
    });

    it('should expose values', () => {
      expect(colors.values).toEqual(['red', 'green', 'blue']);
    });

    it('should expose options', () => {
      expect(colors.options).toEqual(['red', 'green', 'blue']);
    });
  });

  describe('single value enum', () => {
    const single = enumSchema(['only'] as const);

    it('should parse the single value', () => {
      expect(single.parse('only')).toBe('only');
    });

    it('should reject other values', () => {
      expect(() => single.parse('other')).toThrow();
    });
  });

  describe('numeric-like string enum', () => {
    const nums = enumSchema(['1', '2', '3'] as const);

    it('should parse string numbers', () => {
      expect(nums.parse('1')).toBe('1');
      expect(nums.parse('2')).toBe('2');
      expect(nums.parse('3')).toBe('3');
    });

    it('should reject actual numbers', () => {
      expect(() => nums.parse(1)).toThrow();
      expect(() => nums.parse(2)).toThrow();
    });
  });

  describe('async parsing', () => {
    const statuses = enumSchema(['pending', 'active', 'inactive'] as const);

    it('should parse async valid values', async () => {
      await expect(statuses.parseAsync('pending')).resolves.toBe('pending');
      await expect(statuses.parseAsync('active')).resolves.toBe('active');
      await expect(statuses.parseAsync('inactive')).resolves.toBe('inactive');
    });

    it('should reject async invalid values', async () => {
      await expect(statuses.parseAsync('unknown')).rejects.toThrow();
      await expect(statuses.parseAsync(null)).rejects.toThrow();
    });
  });

  describe('safeParse with enum', () => {
    const priorities = enumSchema(['low', 'medium', 'high'] as const);

    it('should return success for valid values', () => {
      const result = priorities.safeParse('medium');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('medium');
      }
    });

    it('should return error for invalid values', () => {
      const result = priorities.safeParse('urgent');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toHaveLength(1);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in enum values', () => {
      const special = enumSchema(['hello-world', 'foo_bar', 'baz@123'] as const);
      expect(special.parse('hello-world')).toBe('hello-world');
      expect(special.parse('foo_bar')).toBe('foo_bar');
      expect(special.parse('baz@123')).toBe('baz@123');
    });

    it('should handle empty string as enum value', () => {
      const withEmpty = enumSchema(['', 'nonempty'] as const);
      expect(withEmpty.parse('')).toBe('');
      expect(withEmpty.parse('nonempty')).toBe('nonempty');
    });

    it('should handle unicode in enum values', () => {
      const unicode = enumSchema(['😀', '🎉', '✨'] as const);
      expect(unicode.parse('😀')).toBe('😀');
      expect(unicode.parse('🎉')).toBe('🎉');
      expect(unicode.parse('✨')).toBe('✨');
    });
  });
});

describe('NativeEnumSchema', () => {
  // String enum
  enum StringColors {
    Red = 'RED',
    Green = 'GREEN', 
    Blue = 'BLUE'
  }

  // Numeric enum
  enum NumericStatus {
    Pending = 0,
    Active = 1,
    Inactive = 2
  }

  // Mixed enum
  enum MixedEnum {
    StringValue = 'string',
    NumericValue = 42
  }

  describe('string native enum', () => {
    const schema = nativeEnum(StringColors);

    it('should parse valid string enum values', () => {
      expect(schema.parse('RED')).toBe('RED');
      expect(schema.parse('GREEN')).toBe('GREEN');
      expect(schema.parse('BLUE')).toBe('BLUE');
    });

    it('should reject invalid values', () => {
      expect(() => schema.parse('red')).toThrow(); // lowercase
      expect(() => schema.parse('YELLOW')).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it('should expose enum object', () => {
      expect(schema.enum).toBe(StringColors);
    });

    it('should expose options', () => {
      const options = schema.options;
      expect(options).toContain('RED');
      expect(options).toContain('GREEN');
      expect(options).toContain('BLUE');
      expect(options.length).toBe(3);
    });
  });

  describe('numeric native enum', () => {
    const schema = nativeEnum(NumericStatus);

    it('should parse valid numeric enum values', () => {
      expect(schema.parse(0)).toBe(0);
      expect(schema.parse(1)).toBe(1);
      expect(schema.parse(2)).toBe(2);
    });

    it('should reject invalid values', () => {
      expect(() => schema.parse(3)).toThrow();
      expect(() => schema.parse(-1)).toThrow();
      expect(() => schema.parse('0')).toThrow(); // string version
    });

    it('should handle reverse mappings correctly', () => {
      // TypeScript creates reverse mappings for numeric enums
      // The schema should only accept the numeric values, not the keys
      expect(() => schema.parse('Pending')).toThrow();
      expect(() => schema.parse('Active')).toThrow();
    });

    it('should expose correct options', () => {
      const options = schema.options;
      expect(options).toContain(0);
      expect(options).toContain(1);
      expect(options).toContain(2);
      // Should not include reverse mapping keys
      expect(options).not.toContain('Pending');
      expect(options).not.toContain('Active');
    });
  });

  describe('mixed native enum', () => {
    const schema = nativeEnum(MixedEnum);

    it('should parse both string and numeric values', () => {
      expect(schema.parse('string')).toBe('string');
      expect(schema.parse(42)).toBe(42);
    });

    it('should reject invalid values', () => {
      expect(() => schema.parse('StringValue')).toThrow();
      expect(() => schema.parse('NumericValue')).toThrow();
      expect(() => schema.parse(43)).toThrow();
    });

    it('should expose correct options', () => {
      const options = schema.options;
      expect(options).toContain('string');
      expect(options).toContain(42);
      expect(options.length).toBe(2);
    });
  });

  describe('async parsing with native enum', () => {
    const schema = nativeEnum(StringColors);

    it('should parse async valid values', async () => {
      await expect(schema.parseAsync('RED')).resolves.toBe('RED');
      await expect(schema.parseAsync('GREEN')).resolves.toBe('GREEN');
    });

    it('should reject async invalid values', async () => {
      await expect(schema.parseAsync('PURPLE')).rejects.toThrow();
      await expect(schema.parseAsync(123)).rejects.toThrow();
    });
  });

  describe('safeParse with native enum', () => {
    const schema = nativeEnum(NumericStatus);

    it('should return success for valid values', () => {
      const result = schema.safeParse(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1);
      }
    });

    it('should return error for invalid values', () => {
      const result = schema.safeParse(99);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.code).toBe(ErrorCode.INVALID_ENUM_VALUE);
        expect(result.error?.issues[0]?.options?.['received']).toBe('99');
      }
    });
  });

  describe('const assertion enum', () => {
    const MyEnum = {
      A: 'a',
      B: 'b',
      C: 'c'
    } as const;

    const schema = nativeEnum(MyEnum);

    it('should parse const assertion enum values', () => {
      expect(schema.parse('a')).toBe('a');
      expect(schema.parse('b')).toBe('b');
      expect(schema.parse('c')).toBe('c');
    });

    it('should reject keys', () => {
      expect(() => schema.parse('A')).toThrow();
      expect(() => schema.parse('B')).toThrow();
    });
  });

  describe('edge cases for native enum', () => {
    it('should handle single value enum', () => {
      enum SingleValue {
        Only = 'ONLY'
      }
      const schema = nativeEnum(SingleValue);
      expect(schema.parse('ONLY')).toBe('ONLY');
      expect(() => schema.parse('other')).toThrow();
    });

    it('should handle numeric enum starting from non-zero', () => {
      enum NonZeroEnum {
        First = 5,
        Second = 6,
        Third = 7
      }
      const schema = nativeEnum(NonZeroEnum);
      expect(schema.parse(5)).toBe(5);
      expect(schema.parse(6)).toBe(6);
      expect(schema.parse(7)).toBe(7);
      expect(() => schema.parse(0)).toThrow();
    });

    it('should handle const numeric enum', () => {
      const NumEnum = {
        One: 1,
        Two: 2,
        Three: 3
      } as const;
      const schema = nativeEnum(NumEnum);
      expect(schema.parse(1)).toBe(1);
      expect(schema.parse(2)).toBe(2);
      expect(() => schema.parse('One')).toThrow();
    });
  });
});