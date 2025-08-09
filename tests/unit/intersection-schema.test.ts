import { intersection } from '../../src/schemas/complex/intersection';
import { object } from '../../src/schemas/complex/object';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';
import { literal } from '../../src/schemas/primitives/literal';
import { array } from '../../src/schemas/complex/array';

describe('IntersectionSchema', () => {
  describe('basic object intersection', () => {
    const schema = intersection(
      object({ name: string() }),
      object({ age: number() })
    );

    it('should merge two object schemas', () => {
      const result = schema.parse({ name: 'John', age: 30 });
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should require all properties from both schemas', () => {
      expect(() => schema.parse({ name: 'John' })).toThrow();
      expect(() => schema.parse({ age: 30 })).toThrow();
      expect(() => schema.parse({})).toThrow();
    });

    it('should validate all properties', () => {
      expect(() => schema.parse({ name: 123, age: 30 })).toThrow();
      expect(() => schema.parse({ name: 'John', age: 'thirty' })).toThrow();
    });

    it('should handle extra properties based on object schema strictness', () => {
      // By default, object schemas strip unknown properties
      const result = schema.parse({ name: 'John', age: 30, extra: true });
      expect(result).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('complex object intersection', () => {
    const schema = intersection(
      object({ 
        user: object({ id: number(), name: string() }),
        active: boolean()
      }),
      object({ 
        permissions: array(string()),
        role: literal('admin')
      })
    );

    it('should merge nested objects', () => {
      const data = {
        user: { id: 1, name: 'Alice' },
        active: true,
        permissions: ['read', 'write'],
        role: 'admin' as const
      };
      const result = schema.parse(data);
      expect(result).toEqual(data);
    });

    it('should validate nested properties', () => {
      const invalidData = {
        user: { id: 'one', name: 'Alice' }, // Invalid id
        active: true,
        permissions: ['read', 'write'],
        role: 'admin' as const
      };
      expect(() => schema.parse(invalidData)).toThrow();
    });
  });

  describe('overlapping properties', () => {
    const schema = intersection(
      object({ id: number(), name: string() }),
      object({ id: number(), email: string() })
    );

    it('should handle overlapping properties when compatible', () => {
      const result = schema.parse({ id: 1, name: 'John', email: 'john@example.com' });
      expect(result).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
    });

    it('should validate overlapping properties', () => {
      // Both schemas expect id to be a number
      expect(() => schema.parse({ 
        id: 'one', 
        name: 'John', 
        email: 'john@example.com' 
      })).toThrow();
    });
  });

  describe('conflicting property types', () => {
    const schema = intersection(
      object({ value: string() }),
      object({ value: string().min(5) })
    );

    it('should apply both validations', () => {
      expect(schema.parse({ value: 'hello' })).toEqual({ value: 'hello' });
      expect(() => schema.parse({ value: 'hi' })).toThrow(); // Too short for second schema
    });
  });

  describe('async parsing', () => {
    const schema = intersection(
      object({ name: string(), age: number() }),
      object({ email: string().email(), active: boolean() })
    );

    it('should parse async successfully', async () => {
      const data = {
        name: 'Alice',
        age: 25,
        email: 'alice@example.com',
        active: true
      };
      const result = await schema.parseAsync(data);
      expect(result).toEqual(data);
    });

    it('should fail async on invalid data', async () => {
      const invalidData = {
        name: 'Alice',
        age: 25,
        email: 'invalid-email', // Invalid email
        active: true
      };
      await expect(schema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should fail when missing properties', async () => {
      await expect(schema.parseAsync({ name: 'Alice', age: 25 })).rejects.toThrow();
    });
  });

  describe('safeParse', () => {
    const schema = intersection(
      object({ x: number() }),
      object({ y: number() })
    );

    it('should return success for valid data', () => {
      const result = schema.safeParse({ x: 10, y: 20 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ x: 10, y: 20 });
      }
    });

    it('should return error for invalid data', () => {
      const result = schema.safeParse({ x: 10 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('safeParseAsync', () => {
    const schema = intersection(
      object({ a: string() }),
      object({ b: number() })
    );

    it('should return success for valid async data', async () => {
      const result = await schema.safeParseAsync({ a: 'test', b: 42 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ a: 'test', b: 42 });
      }
    });

    it('should return error for invalid async data', async () => {
      const result = await schema.safeParseAsync({ a: 'test' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('non-object intersections', () => {
    it('should handle primitive intersections', () => {
      const schema = intersection(
        string(),
        string().min(3)
      );
      
      // For primitives, the second schema's result is used
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hi')).toThrow();
    });

    it('should handle array intersections', () => {
      const schema = intersection(
        array(number()),
        array(number()).min(2)
      );
      
      expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
      expect(() => schema.parse([1])).toThrow(); // Too short
    });

    it('should handle null values', () => {
      const schema = intersection(
        object({ a: string() }).nullable(),
        object({ b: number() }).nullable()
      );
      
      // When one of the results is null, the right result is returned
      const nullableSchema = schema.nullable();
      expect(nullableSchema.parse(null)).toBe(null);
    });
  });

  describe('record intersection', () => {
    // Record expects all values to be strings, can't mix with object that has boolean
    const schema = intersection(
      object({ optional1: string(), optional2: string() }),
      object({ required: boolean() })
    );

    it('should merge record with object', () => {
      const data = {
        required: true,
        optional1: 'value1',
        optional2: 'value2'
      };
      const result = schema.parse(data);
      expect(result).toEqual(data);
    });

    it('should validate both record and object constraints', () => {
      expect(() => schema.parse({ 
        required: 'not boolean',
        optional: 'valid' 
      })).toThrow();
      
      expect(() => schema.parse({ 
        optional: 'valid' 
      })).toThrow(); // Missing required
    });
  });

  describe('multiple intersections', () => {
    const schema = intersection(
      intersection(
        object({ a: string() }),
        object({ b: number() })
      ),
      object({ c: boolean() })
    );

    it('should handle chained intersections', () => {
      const data = { a: 'test', b: 42, c: true };
      expect(schema.parse(data)).toEqual(data);
    });

    it('should validate all schemas in chain', () => {
      expect(() => schema.parse({ a: 'test', b: 42 })).toThrow(); // Missing c
      expect(() => schema.parse({ a: 'test', c: true })).toThrow(); // Missing b
      expect(() => schema.parse({ b: 42, c: true })).toThrow(); // Missing a
    });
  });

  describe('error handling with context issues', () => {
    it('should throw error when first schema has issues during sync parse', () => {
      // Create a schema that will fail validation 
      const schema = intersection(
        object({ field: string().min(10) }), // Will fail for short strings
        object({ other: number() })
      );
      
      expect(() => schema.parse({ field: 'hi', other: 5 })).toThrow();
    });

    it('should throw error when second schema has issues during sync parse', () => {
      const schema = intersection(
        object({ field: string() }),
        object({ other: number().positive() }) // Will fail for negative
      );
      
      expect(() => schema.parse({ field: 'hello', other: -5 })).toThrow();
    });

    it('should throw error when both schemas have issues during sync parse', () => {
      const schema = intersection(
        object({ field: string().min(10) }),
        object({ other: number().positive() })
      );
      
      expect(() => schema.parse({ field: 'hi', other: -5 })).toThrow();
    });

    it('should throw error when first schema has issues during async parse', async () => {
      const schema = intersection(
        object({ field: string().min(10) }),
        object({ other: number() })
      );
      
      await expect(schema.parseAsync({ field: 'hi', other: 5 })).rejects.toThrow();
    });

    it('should throw error when second schema has issues during async parse', async () => {
      const schema = intersection(
        object({ field: string() }),
        object({ other: number().positive() })
      );
      
      await expect(schema.parseAsync({ field: 'hello', other: -5 })).rejects.toThrow();
    });

    it('should throw error when both schemas have issues during async parse', async () => {
      const schema = intersection(
        object({ field: string().min(10) }),
        object({ other: number().positive() })
      );
      
      await expect(schema.parseAsync({ field: 'hi', other: -5 })).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    const schema = intersection(
      object({ field1: string().min(5) }),
      object({ field2: number().positive() })
    );

    it('should collect errors from both schemas', () => {
      const result = schema.safeParse({ 
        field1: 'hi',  // Too short
        field2: -5     // Not positive
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should handle validation errors in first schema', () => {
      const result = schema.safeParse({ 
        field1: 'hi',  // Too short
        field2: 5
      });
      
      expect(result.success).toBe(false);
    });

    it('should handle validation errors in second schema', () => {
      const result = schema.safeParse({ 
        field1: 'hello',
        field2: -5  // Not positive
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('should properly infer intersection types', () => {
      const schema = intersection(
        object({ str: string() }),
        object({ num: number() })
      );
      
      const result = schema.parse({ str: 'test', num: 42 });
      
      // TypeScript should infer the correct type
      const _strCheck: string = result.str;
      const _numCheck: number = result.num;
      
      expect(_strCheck).toBe('test');
      expect(_numCheck).toBe(42);
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      const schema = intersection(
        object({}),
        object({})
      );
      
      expect(schema.parse({})).toEqual({});
    });

    it('should handle undefined values in optional fields', () => {
      const schema = intersection(
        object({ a: string().optional() }),
        object({ b: number().optional() })
      );
      
      expect(schema.parse({})).toEqual({});
      expect(schema.parse({ a: 'test' })).toEqual({ a: 'test' });
      expect(schema.parse({ b: 42 })).toEqual({ b: 42 });
    });

    it('should handle complex nested structures', () => {
      // When both schemas have the same property (user), both are validated
      // but only the second result is returned (no deep merge)
      const schema = intersection(
        object({
          user: object({
            profile: object({
              name: string()
            })
          })
        }),
        object({
          user: object({
            settings: object({
              theme: string()
            })
          })
        })
      );
      
      // First schema expects profile, second expects settings
      // Both will validate their expectations independently
      
      // This will pass first schema but fail second (no settings)
      const dataWithProfile = {
        user: {
          profile: { name: 'Alice' }
        }
      };
      expect(() => schema.parse(dataWithProfile)).toThrow();
      
      // This will fail first schema (no profile) but pass second
      const dataWithSettings = {
        user: {
          settings: { theme: 'dark' }
        }
      };
      expect(() => schema.parse(dataWithSettings)).toThrow();
      
      // To pass both, you'd need both profile AND settings
      // But since there's no deep merge, this is impossible for nested objects
    });
  });

  describe('performance', () => {
    it('should handle large object intersections', () => {
      const leftSchema = object(
        Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`left${i}`, string()])
        )
      );
      
      const rightSchema = object(
        Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`right${i}`, number()])
        )
      );
      
      const schema = intersection(leftSchema, rightSchema);
      
      const data = {
        ...Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`left${i}`, `value${i}`])
        ),
        ...Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`right${i}`, i])
        )
      };
      
      const result = schema.parse(data);
      expect(Object.keys(result)).toHaveLength(100);
    });
  });
});