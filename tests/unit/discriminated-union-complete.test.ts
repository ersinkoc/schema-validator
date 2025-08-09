import { discriminatedUnion } from '../../src/schemas/complex/discriminated-union';
import { object } from '../../src/schemas/complex/object';
import { literal } from '../../src/schemas/primitives/literal';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { boolean } from '../../src/schemas/primitives/boolean';

describe('DiscriminatedUnion - 100% Coverage', () => {
  describe('Basic discrimination', () => {
    const userSchema = object({
      type: literal('user'),
      name: string(),
      age: number()
    });

    const adminSchema = object({
      type: literal('admin'),
      name: string(),
      permissions: string()
    });

    const guestSchema = object({
      type: literal('guest'),
      id: string()
    });

    const schema = discriminatedUnion('type', [userSchema, adminSchema, guestSchema]);

    it('should parse user type correctly', () => {
      const userData = {
        type: 'user' as const,
        name: 'John',
        age: 30
      };
      expect(schema.parse(userData)).toEqual(userData);
    });

    it('should parse admin type correctly', () => {
      const adminData = {
        type: 'admin' as const,
        name: 'Jane',
        permissions: 'all'
      };
      expect(schema.parse(adminData)).toEqual(adminData);
    });

    it('should parse guest type correctly', () => {
      const guestData = {
        type: 'guest' as const,
        id: '12345'
      };
      expect(schema.parse(guestData)).toEqual(guestData);
    });

    it('should throw on invalid discriminator value', () => {
      const invalidData = {
        type: 'unknown',
        name: 'Bob'
      };
      expect(() => schema.parse(invalidData)).toThrow('Invalid discriminator value');
    });

    it('should throw on missing discriminator key', () => {
      const missingKey = {
        name: 'Bob',
        age: 25
      };
      expect(() => schema.parse(missingKey)).toThrow();
    });

    it('should throw on non-object input', () => {
      expect(() => schema.parse('not an object')).toThrow('Expected object');
      expect(() => schema.parse(123)).toThrow('Expected object');
      expect(() => schema.parse(null)).toThrow('Expected object');
      expect(() => schema.parse(undefined)).toThrow('Expected object');
      expect(() => schema.parse([])).toThrow('Expected object');
    });

    it('should handle parse errors in option schemas', () => {
      const invalidUserData = {
        type: 'user' as const,
        name: 'John',
        age: 'not a number' // Invalid age
      };
      expect(() => schema.parse(invalidUserData)).toThrow();
    });
  });

  describe('Async parsing', () => {
    const schema = discriminatedUnion('kind', [
      object({
        kind: literal('async1'),
        value: string()
      }),
      object({
        kind: literal('async2'),
        count: number()
      })
    ]);

    it('should handle async parsing for valid data', async () => {
      const data1 = { kind: 'async1' as const, value: 'test' };
      const result1 = await schema.parseAsync(data1);
      expect(result1).toEqual(data1);

      const data2 = { kind: 'async2' as const, count: 42 };
      const result2 = await schema.parseAsync(data2);
      expect(result2).toEqual(data2);
    });

    it('should throw on async parsing with invalid discriminator', async () => {
      const invalidData = { kind: 'invalid', value: 'test' };
      await expect(schema.parseAsync(invalidData)).rejects.toThrow('Invalid discriminator value');
    });

    it('should throw on async parsing with non-object', async () => {
      await expect(schema.parseAsync('not an object')).rejects.toThrow('Expected object');
      await expect(schema.parseAsync(123)).rejects.toThrow('Expected object');
      await expect(schema.parseAsync(null)).rejects.toThrow('Expected object');
    });

    it('should throw on async parsing with missing discriminator', async () => {
      const missingKey = { value: 'test', count: 42 };
      await expect(schema.parseAsync(missingKey)).rejects.toThrow();
    });

    it('should handle async parse errors in option schemas', async () => {
      const invalidData = {
        kind: 'async1' as const,
        value: 123 // Should be string
      };
      await expect(schema.parseAsync(invalidData)).rejects.toThrow();
    });
  });

  describe('Complex discriminator scenarios', () => {
    it('should work with nested objects', () => {
      const schema = discriminatedUnion('action', [
        object({
          action: literal('create'),
          data: object({
            title: string(),
            content: string()
          })
        }),
        object({
          action: literal('update'),
          id: number(),
          changes: object({
            title: string().optional(),
            content: string().optional()
          })
        }),
        object({
          action: literal('delete'),
          id: number()
        })
      ]);

      const createData = {
        action: 'create' as const,
        data: {
          title: 'Test',
          content: 'Content'
        }
      };
      expect(schema.parse(createData)).toEqual(createData);

      const updateData = {
        action: 'update' as const,
        id: 1,
        changes: {
          title: 'New Title'
        }
      };
      expect(schema.parse(updateData)).toEqual(updateData);

      const deleteData = {
        action: 'delete' as const,
        id: 1
      };
      expect(schema.parse(deleteData)).toEqual(deleteData);
    });

    it('should work with different discriminator keys', () => {
      const schemaWithType = discriminatedUnion('type', [
        object({ type: literal('a'), value: string() })
      ]);

      const schemaWithKind = discriminatedUnion('kind', [
        object({ kind: literal('b'), value: number() })
      ]);

      const schemaWithAction = discriminatedUnion('action', [
        object({ action: literal('c'), value: boolean() })
      ]);

      expect(schemaWithType.parse({ type: 'a', value: 'test' })).toEqual({ type: 'a', value: 'test' });
      expect(schemaWithKind.parse({ kind: 'b', value: 42 })).toEqual({ kind: 'b', value: 42 });
      expect(schemaWithAction.parse({ action: 'c', value: true })).toEqual({ action: 'c', value: true });
    });

    it('should handle multiple options with same structure', () => {
      const schema = discriminatedUnion('status', [
        object({
          status: literal('pending'),
          message: string(),
          timestamp: number()
        }),
        object({
          status: literal('processing'),
          message: string(),
          timestamp: number()
        }),
        object({
          status: literal('completed'),
          message: string(),
          timestamp: number()
        }),
        object({
          status: literal('failed'),
          message: string(),
          timestamp: number(),
          error: string()
        })
      ]);

      const pendingData = {
        status: 'pending' as const,
        message: 'Waiting',
        timestamp: Date.now()
      };
      expect(schema.parse(pendingData)).toEqual(pendingData);

      const failedData = {
        status: 'failed' as const,
        message: 'Error occurred',
        timestamp: Date.now(),
        error: 'Network error'
      };
      expect(schema.parse(failedData)).toEqual(failedData);
    });
  });

  describe('Error messages and edge cases', () => {
    it('should provide clear error messages', () => {
      const schema = discriminatedUnion('type', [
        object({ type: literal('valid'), data: string() })
      ]);

      try {
        schema.parse({ type: 'invalid', data: 'test' });
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('discriminator');
      }
    });

    it('should handle empty options array', () => {
      // Empty options array is allowed in this implementation
      const schema = discriminatedUnion('type', []);
      expect(schema).toBeDefined();
    });

    it('should validate discriminator key exists in all options', () => {
      const invalidOption = object({ 
        notType: literal('test'), // Wrong key
        value: string() 
      });

      expect(() => discriminatedUnion('type', [invalidOption as any])).toThrow();
    });

    it('should handle special characters in discriminator values', () => {
      const schema = discriminatedUnion('type', [
        object({ type: literal('with-dash'), value: string() }),
        object({ type: literal('with_underscore'), value: string() }),
        object({ type: literal('with.dot'), value: string() }),
        object({ type: literal('with space'), value: string() })
      ]);

      expect(schema.parse({ type: 'with-dash', value: 'test' })).toEqual({ type: 'with-dash', value: 'test' });
      expect(schema.parse({ type: 'with_underscore', value: 'test' })).toEqual({ type: 'with_underscore', value: 'test' });
      expect(schema.parse({ type: 'with.dot', value: 'test' })).toEqual({ type: 'with.dot', value: 'test' });
      expect(schema.parse({ type: 'with space', value: 'test' })).toEqual({ type: 'with space', value: 'test' });
    });
  });

  describe('Performance and optimization', () => {
    it('should handle large number of options efficiently', () => {
      const options = Array.from({ length: 100 }, (_, i) => 
        object({
          type: literal(`option${i}`),
          value: number()
        })
      );

      const schema = discriminatedUnion('type', options);

      const testData = {
        type: 'option50',
        value: 42
      };

      expect(schema.parse(testData)).toEqual(testData);
    });

    it('should cache discriminator maps correctly', () => {
      const schema = discriminatedUnion('type', [
        object({ type: literal('a'), v: string() }),
        object({ type: literal('b'), v: number() })
      ]);

      // Parse multiple times to test caching
      const data1 = { type: 'a' as const, v: 'test' };
      const data2 = { type: 'b' as const, v: 42 };

      expect(schema.parse(data1)).toEqual(data1);
      expect(schema.parse(data2)).toEqual(data2);
      expect(schema.parse(data1)).toEqual(data1);
      expect(schema.parse(data2)).toEqual(data2);
    });
  });
});