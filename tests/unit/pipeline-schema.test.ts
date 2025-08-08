import v from '../../src/index';
import { pipeline } from '../../src/schemas/complex/pipeline';

describe('Pipeline Schema', () => {
  describe('pipeline function', () => {
    it('should create a pipeline schema', () => {
      const schema = pipeline(v.string(), v.string().transform(s => s.toUpperCase()));
      expect(schema).toBeDefined();
      expect(schema._type).toBe('pipeline');
    });

    it('should provide access to schemas', () => {
      const schema1 = v.string();
      const schema2 = v.number();
      const pipelineSchema = pipeline(schema1, schema2);
      
      expect(pipelineSchema.schemas).toEqual([schema1, schema2]);
      expect(pipelineSchema.schemas.length).toBe(2);
    });
  });

  describe('_parse method', () => {
    it('should process input through pipeline stages', () => {
      const schema = pipeline(
        v.string(),
        v.string().min(1)
      );
      
      const result = schema.parse('hello');
      expect(result).toBe('hello');
    });

    it('should handle single schema in pipeline', () => {
      const schema = pipeline(v.string());
      expect(schema.parse('test')).toBe('test');
    });

    it('should pass validation through all stages', () => {
      const schema = pipeline(
        v.string(),
        v.string().min(3),
        v.string().max(10)
      );
      
      expect(schema.parse('hello')).toBe('hello');
    });

    it('should fail if any stage fails', () => {
      const schema = pipeline(
        v.string(),
        v.string().min(10) // This will fail for short strings
      );
      
      expect(() => schema.parse('short')).toThrow();
    });

    it('should handle type transformations', () => {
      const schema = pipeline(
        v.string(),
        v.string().min(1)
      );
      
      expect(schema.parse('42')).toBe('42');
    });

    it('should stop on first validation error', () => {
      const schema = pipeline(
        v.string().min(10), // This fails first
        v.string().min(1)
      );
      
      expect(() => schema.parse('short')).toThrow();
    });

    it('should handle object validation pipeline', () => {
      const schema = pipeline(
        v.object({ name: v.string(), age: v.string() }),
        v.object({ name: v.string().min(1), age: v.string().min(1) })
      );
      
      const result = schema.parse({ name: 'John', age: '25' });
      expect(result).toEqual({ name: 'John', age: '25' });
    });
  });

  describe('_parseAsync method', () => {
    it('should process input through async pipeline stages', async () => {
      const schema = pipeline(
        v.string(),
        v.string().min(1)
      );
      
      const result = await schema.parseAsync('hello');
      expect(result).toBe('hello');
    });

    it('should handle async validation', async () => {
      const schema = pipeline(
        v.string(),
        v.string().min(5)
      );
      
      const result = await schema.parseAsync('hello');
      expect(result).toBe('hello');
    });

    it('should fail on async validation error', async () => {
      const schema = pipeline(
        v.string(),
        v.string().min(10)
      );
      
      await expect(schema.parseAsync('short')).rejects.toThrow();
    });
  });

  describe('safeParse method', () => {
    it('should return success for valid pipeline', () => {
      const schema = pipeline(
        v.string(),
        v.string().min(1)
      );
      
      const result = schema.safeParse('hello');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hello');
      }
    });

    it('should return error for invalid pipeline', () => {
      const schema = pipeline(
        v.string().min(10),
        v.string().min(1)
      );
      
      const result = schema.safeParse('short');
      expect(result.success).toBe(false);
    });
  });

  describe('safeParseAsync method', () => {
    it('should return success for valid async pipeline', async () => {
      const schema = pipeline(
        v.string(),
        v.string().min(1)
      );
      
      const result = await schema.safeParseAsync('hello');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hello');
      }
    });

    it('should return error for invalid async pipeline', async () => {
      const schema = pipeline(
        v.string().min(10),
        v.string().min(1)
      );
      
      const result = await schema.safeParseAsync('short');
      expect(result.success).toBe(false);
    });
  });

  describe('integration with v.pipeline', () => {
    it('should work with v.pipeline', () => {
      const schema = v.pipeline(
        v.string(),
        v.string().min(1)
      );
      
      expect(schema.parse('hello')).toBe('hello');
    });
  });

  describe('complex pipeline scenarios', () => {
    it('should handle multi-stage validation', () => {
      const userSchema = pipeline(
        v.object({
          name: v.string(),
          age: v.string(),
          email: v.string()
        }),
        v.object({
          name: v.string().min(1),
          age: v.string().min(1),
          email: v.string().min(5)
        })
      );

      const input = {
        name: 'John Doe',
        age: '25',
        email: 'john@example.com'
      };

      const result = userSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should handle array validation pipeline', () => {
      const arrayPipeline = pipeline(
        v.array(v.string()),
        v.array(v.string()).min(1)
      );

      const input = ['hello', 'world'];
      const result = arrayPipeline.parse(input);
      expect(result).toEqual(['hello', 'world']);
    });
  });
});