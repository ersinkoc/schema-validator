import { pipeline } from '../../src/schemas/complex/pipeline';
import { string } from '../../src/schemas/primitives/string';
import { number } from '../../src/schemas/primitives/number';
import { preprocess } from '../../src/schemas/complex/preprocess';
import { ParseContext } from '../../src/core/parser';

describe('PipelineSchema - Complete Coverage', () => {
  describe('basic pipeline operations', () => {
    it('should process through multiple schemas', () => {
      const schema = pipeline(
        string(),
        string().min(2),
        string().max(10)
      );
      
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('a')).toThrow(); // Too short
      expect(() => schema.parse('this is too long')).toThrow(); // Too long
    });

    it('should transform data through pipeline', () => {
      const schema = pipeline(
        preprocess((val) => String(val), string()),
        string().toUpperCase(),
        preprocess((val) => `PREFIX_${val}`, string())
      );
      
      expect(schema.parse(123)).toBe('PREFIX_123');
      expect(schema.parse('hello')).toBe('PREFIX_HELLO');
    });

    it('should handle single schema pipeline', () => {
      const schema = pipeline(string());
      expect(schema.parse('test')).toBe('test');
      expect(() => schema.parse(123)).toThrow();
    });
  });

  describe('error handling with context issues', () => {
    it('should throw error when context has issues during sync parse', () => {
      // Create a custom schema that adds issues to context
      const problematicSchema = {
        _type: 'custom',
        _parse: (input: unknown, ctx: ParseContext) => {
          ctx.addIssue({
            code: 'custom',
            message: 'Custom error'
          });
          // Return value but context has issues
          return input;
        },
        _parseAsync: async (input: unknown, ctx: ParseContext) => {
          ctx.addIssue({
            code: 'custom',
            message: 'Custom async error'
          });
          return input;
        },
        safeParse: () => ({ success: false, error: new Error('test') }),
        parse: () => { throw new Error('test'); }
      };

      const schema = pipeline(
        string(),
        problematicSchema as any
      );

      // This should throw because the second schema adds issues
      expect(() => schema.parse('test')).toThrow();
    });

    it('should handle multiple schemas with the first one failing', () => {
      const schema = pipeline(
        string().min(10), // Will fail for short strings
        string().max(20)
      );

      expect(() => schema.parse('short')).toThrow();
    });

    it('should handle multiple schemas with middle one failing', () => {
      const schema = pipeline(
        string(),
        string().regex(/^[A-Z]/), // Must start with uppercase
        string().max(10)
      );

      expect(schema.parse('Hello')).toBe('Hello');
      expect(() => schema.parse('hello')).toThrow(); // Doesn't start with uppercase
    });

    it('should handle multiple schemas with last one failing', () => {
      const schema = pipeline(
        string(),
        string().min(2),
        string().max(5) // Will fail for long strings
      );

      expect(() => schema.parse('toolong')).toThrow();
    });
  });

  describe('async pipeline operations', () => {
    it('should process async through multiple schemas', async () => {
      const schema = pipeline(
        string(),
        string().min(2),
        string().max(10)
      );
      
      await expect(schema.parseAsync('hello')).resolves.toBe('hello');
      await expect(schema.parseAsync('a')).rejects.toThrow();
      await expect(schema.parseAsync('this is too long')).rejects.toThrow();
    });

    it('should handle async transformation pipeline', async () => {
      const schema = pipeline(
        preprocess((val) => String(val), string()),
        string().toLowerCase(),
        preprocess((s) => String(s).replace(/[aeiou]/g, '*'), string())
      );
      
      await expect(schema.parseAsync('HELLO')).resolves.toBe('h*ll*');
      await expect(schema.parseAsync(123)).resolves.toBe('123');
    });

    it('should throw error when context has issues during async parse', async () => {
      // Create a custom schema that adds issues to context
      const problematicAsyncSchema = {
        _type: 'custom',
        _parseAsync: async (input: unknown, ctx: ParseContext) => {
          ctx.addIssue({
            code: 'custom',
            message: 'Async custom error'
          });
          // Return value but context has issues
          return input;
        },
        _parse: (input: unknown, ctx: ParseContext) => {
          ctx.addIssue({
            code: 'custom',
            message: 'Sync custom error'  
          });
          return input;
        },
        safeParse: () => ({ success: false, error: new Error('test') }),
        parse: () => { throw new Error('test'); }
      };

      const schema = pipeline(
        string(),
        problematicAsyncSchema as any
      );

      // This should throw because the second schema adds issues
      await expect(schema.parseAsync('test')).rejects.toThrow();
    });

    it('should handle async pipeline with first schema failing', async () => {
      const schema = pipeline(
        string().min(10),
        string().max(20)
      );

      await expect(schema.parseAsync('short')).rejects.toThrow();
    });

    it('should handle async pipeline with middle schema failing', async () => {
      const schema = pipeline(
        string(),
        string().regex(/^\d+$/), // Must be all digits
        string().max(10)
      );

      await expect(schema.parseAsync('123')).resolves.toBe('123');
      await expect(schema.parseAsync('abc')).rejects.toThrow();
    });

    it('should handle async pipeline with last schema failing', async () => {
      const schema = pipeline(
        string(),
        string().min(2),
        string().max(5)
      );

      await expect(schema.parseAsync('ok')).resolves.toBe('ok');
      await expect(schema.parseAsync('toolong')).rejects.toThrow();
    });
  });

  describe('complex pipeline scenarios', () => {
    it('should handle type transformations in pipeline', () => {
      const schema = pipeline(
        preprocess((val) => String(val), string()),
        preprocess((s) => String(s).length, number()),
        number().min(3)
      );

      expect(schema.parse('hello')).toBe(5);
      expect(schema.parse(12345)).toBe(5);
      expect(() => schema.parse('hi')).toThrow(); // Length 2 < 3
    });

    it('should handle nested pipelines', () => {
      const innerPipeline = pipeline(
        string(),
        string().toUpperCase()
      );

      const outerPipeline = pipeline(
        string(),
        innerPipeline,
        preprocess((s) => `[${s}]`, string())
      );

      expect(outerPipeline.parse('hello')).toBe('[HELLO]');
    });

    it('should preserve error information through pipeline', () => {
      const schema = pipeline(
        string(),
        string().email() // Will fail for non-email strings
      );

      const result = schema.safeParse('not-an-email');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should handle empty string through pipeline', () => {
      const schema = pipeline(
        string(),
        string().min(0) // Allow empty
      );

      expect(schema.parse('')).toBe('');
    });

    it('should handle whitespace strings', () => {
      const schema = pipeline(
        string(),
        string().trim(),
        string().min(1)
      );

      expect(schema.parse('  hello  ')).toBe('hello');
      expect(() => schema.parse('   ')).toThrow(); // Only whitespace
    });
  });

  describe('schema property access', () => {
    it('should expose all schemas in pipeline', () => {
      const s1 = string();
      const s2 = string().min(2);
      const s3 = string().max(10);
      
      const schema = pipeline(s1, s2, s3);
      
      expect(schema.schemas).toHaveLength(3);
      expect(schema.schemas[0]).toBe(s1);
      expect(schema.schemas[1]).toBe(s2);
      expect(schema.schemas[2]).toBe(s3);
    });

    it('should maintain schema order', () => {
      const schemas = [
        string(),
        string().min(1),
        string().max(10),
        string().regex(/^[a-z]+$/)
      ];
      
      const schema = pipeline(...schemas as any);
      
      expect(schema.schemas).toEqual(schemas);
    });
  });

  describe('edge cases', () => {
    it('should handle very long pipelines', () => {
      const schemas = Array(20).fill(null).map(() => string());
      const schema = pipeline(...schemas as any);
      
      expect(schema.parse('test')).toBe('test');
      expect(schema.schemas).toHaveLength(20);
    });

    it('should handle pipeline with all transformations', () => {
      const schema = pipeline(
        string(),
        preprocess((s) => s + '1', string()),
        preprocess((s) => s + '2', string()),
        preprocess((s) => s + '3', string())
      );

      expect(schema.parse('test')).toBe('test123');
    });

    it('should handle pipeline with mixed sync/async schemas', async () => {
      const schema = pipeline(
        string(),
        string().min(2),
        string().max(10)
      );

      // Even though all schemas are sync, parseAsync should work
      await expect(schema.parseAsync('hello')).resolves.toBe('hello');
    });
  });
});