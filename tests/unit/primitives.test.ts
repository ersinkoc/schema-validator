import { string, number, boolean, date, bigint, literal, nullSchema, undefinedSchema } from '../../src';

describe('Primitive Validators', () => {
  describe('string', () => {
    const schema = string();

    it('should validate string values', () => {
      expect(schema.parse('hello')).toBe('hello');
      expect(schema.parse('')).toBe('');
    });

    it('should reject non-string values', () => {
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
    });

    it('should validate with min length', () => {
      const minSchema = string().min(3);
      expect(minSchema.parse('abc')).toBe('abc');
      expect(minSchema.parse('abcd')).toBe('abcd');
      expect(() => minSchema.parse('ab')).toThrow();
    });

    it('should validate with max length', () => {
      const maxSchema = string().max(5);
      expect(maxSchema.parse('hello')).toBe('hello');
      expect(maxSchema.parse('hi')).toBe('hi');
      expect(() => maxSchema.parse('hello world')).toThrow();
    });

    it('should validate email', () => {
      const emailSchema = string().email();
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
      expect(() => emailSchema.parse('invalid')).toThrow();
    });

    it('should validate URL', () => {
      const urlSchema = string().url();
      expect(urlSchema.parse('https://example.com')).toBe('https://example.com');
      expect(() => urlSchema.parse('not a url')).toThrow();
    });

    it('should validate UUID', () => {
      const uuidSchema = string().uuid();
      expect(uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
    });

    it('should validate regex pattern', () => {
      const regexSchema = string().regex(/^[A-Z]/);
      expect(regexSchema.parse('Hello')).toBe('Hello');
      expect(() => regexSchema.parse('hello')).toThrow();
    });

    it('should transform with trim', () => {
      const trimSchema = string().trim();
      expect(trimSchema.parse('  hello  ')).toBe('hello');
    });

    it('should transform with toLowerCase', () => {
      const lowerSchema = string().toLowerCase();
      expect(lowerSchema.parse('HELLO')).toBe('hello');
    });

    it('should transform with toUpperCase', () => {
      const upperSchema = string().toUpperCase();
      expect(upperSchema.parse('hello')).toBe('HELLO');
    });

    it('should coerce values when enabled', () => {
      const coerceSchema = string({ coerce: true });
      expect(coerceSchema.parse(123)).toBe('123');
      expect(coerceSchema.parse(true)).toBe('true');
    });
  });

  describe('number', () => {
    const schema = number();

    it('should validate number values', () => {
      expect(schema.parse(123)).toBe(123);
      expect(schema.parse(0)).toBe(0);
      expect(schema.parse(-456)).toBe(-456);
      expect(schema.parse(3.14)).toBe(3.14);
    });

    it('should reject non-number values', () => {
      expect(() => schema.parse('123')).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse(NaN)).toThrow();
    });

    it('should validate integers', () => {
      const intSchema = number().int();
      expect(intSchema.parse(123)).toBe(123);
      expect(() => intSchema.parse(3.14)).toThrow();
    });

    it('should validate positive numbers', () => {
      const positiveSchema = number().positive();
      expect(positiveSchema.parse(1)).toBe(1);
      expect(() => positiveSchema.parse(0)).toThrow();
      expect(() => positiveSchema.parse(-1)).toThrow();
    });

    it('should validate negative numbers', () => {
      const negativeSchema = number().negative();
      expect(negativeSchema.parse(-1)).toBe(-1);
      expect(() => negativeSchema.parse(0)).toThrow();
      expect(() => negativeSchema.parse(1)).toThrow();
    });

    it('should validate min value', () => {
      const minSchema = number().min(10);
      expect(minSchema.parse(10)).toBe(10);
      expect(minSchema.parse(11)).toBe(11);
      expect(() => minSchema.parse(9)).toThrow();
    });

    it('should validate max value', () => {
      const maxSchema = number().max(100);
      expect(maxSchema.parse(100)).toBe(100);
      expect(maxSchema.parse(99)).toBe(99);
      expect(() => maxSchema.parse(101)).toThrow();
    });

    it('should validate finite numbers', () => {
      const finiteSchema = number().finite();
      expect(finiteSchema.parse(123)).toBe(123);
      expect(() => finiteSchema.parse(Infinity)).toThrow();
      expect(() => finiteSchema.parse(-Infinity)).toThrow();
    });

    it('should validate safe integers', () => {
      const safeSchema = number().safe();
      expect(safeSchema.parse(123)).toBe(123);
      expect(() => safeSchema.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow();
    });

    it('should coerce values when enabled', () => {
      const coerceSchema = number({ coerce: true });
      expect(coerceSchema.parse('123')).toBe(123);
      expect(coerceSchema.parse('3.14')).toBe(3.14);
    });
  });

  describe('boolean', () => {
    const schema = boolean();

    it('should validate boolean values', () => {
      expect(schema.parse(true)).toBe(true);
      expect(schema.parse(false)).toBe(false);
    });

    it('should reject non-boolean values', () => {
      expect(() => schema.parse(1)).toThrow();
      expect(() => schema.parse('true')).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it('should coerce values when enabled', () => {
      const coerceSchema = boolean({ coerce: true });
      expect(coerceSchema.parse(1)).toBe(true);
      expect(coerceSchema.parse(0)).toBe(false);
      expect(coerceSchema.parse('true')).toBe(true);
      expect(coerceSchema.parse('')).toBe(false);
    });
  });

  describe('date', () => {
    const schema = date();

    it('should validate Date objects', () => {
      const now = new Date();
      expect(schema.parse(now)).toEqual(now);
    });

    it('should reject non-Date values', () => {
      expect(() => schema.parse('2024-01-01')).toThrow();
      expect(() => schema.parse(Date.now())).toThrow();
    });

    it('should reject invalid dates', () => {
      expect(() => schema.parse(new Date('invalid'))).toThrow();
    });

    it('should validate min date', () => {
      const minDate = new Date('2024-01-01');
      const minSchema = date().min(minDate);
      expect(minSchema.parse(new Date('2024-06-01'))).toEqual(new Date('2024-06-01'));
      expect(() => minSchema.parse(new Date('2023-12-31'))).toThrow();
    });

    it('should validate max date', () => {
      const maxDate = new Date('2024-12-31');
      const maxSchema = date().max(maxDate);
      expect(maxSchema.parse(new Date('2024-06-01'))).toEqual(new Date('2024-06-01'));
      expect(() => maxSchema.parse(new Date('2025-01-01'))).toThrow();
    });

    it('should coerce values when enabled', () => {
      const coerceSchema = date({ coerce: true });
      const dateString = '2024-01-01';
      const result = coerceSchema.parse(dateString);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toContain('2024-01-01');
    });
  });

  describe('bigint', () => {
    const schema = bigint();

    it('should validate bigint values', () => {
      expect(schema.parse(123n)).toBe(123n);
      expect(schema.parse(0n)).toBe(0n);
      expect(schema.parse(-456n)).toBe(-456n);
    });

    it('should reject non-bigint values', () => {
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse('123')).toThrow();
    });

    it('should coerce values when enabled', () => {
      const coerceSchema = bigint({ coerce: true });
      expect(coerceSchema.parse('123')).toBe(123n);
      expect(coerceSchema.parse(123)).toBe(123n);
    });
  });

  describe('literal', () => {
    it('should validate literal values', () => {
      const helloSchema = literal('hello');
      expect(helloSchema.parse('hello')).toBe('hello');
      expect(() => helloSchema.parse('world')).toThrow();

      const numberSchema = literal(42);
      expect(numberSchema.parse(42)).toBe(42);
      expect(() => numberSchema.parse(43)).toThrow();

      const boolSchema = literal(true);
      expect(boolSchema.parse(true)).toBe(true);
      expect(() => boolSchema.parse(false)).toThrow();
    });
  });

  describe('null', () => {
    const schema = nullSchema();

    it('should validate null', () => {
      expect(schema.parse(null)).toBe(null);
    });

    it('should reject non-null values', () => {
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse(0)).toThrow();
      expect(() => schema.parse('')).toThrow();
    });
  });

  describe('undefined', () => {
    const schema = undefinedSchema();

    it('should validate undefined', () => {
      expect(schema.parse(undefined)).toBe(undefined);
    });

    it('should reject non-undefined values', () => {
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(0)).toThrow();
      expect(() => schema.parse('')).toThrow();
    });
  });
});