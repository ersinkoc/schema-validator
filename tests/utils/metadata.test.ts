import v from '../../src/index';
import * as metadata from '../../src/utils/metadata';

describe('Metadata System', () => {
  let testSchema: ReturnType<typeof v.string>;

  beforeEach(() => {
    // Create a fresh schema instance for each test
    testSchema = v.string();
  });

  describe('Basic metadata operations', () => {
    it('should set and get metadata', () => {
      const key = 'testKey';
      const value = 'testValue';
      
      metadata.setMetadata(testSchema, key, value);
      expect(metadata.getMetadata(testSchema, key)).toBe(value);
    });

    it('should set and get metadata with symbol keys', () => {
      const key = Symbol('testSymbol');
      const value = { test: true };
      
      metadata.setMetadata(testSchema, key, value);
      expect(metadata.getMetadata(testSchema, key)).toEqual(value);
    });

    it('should return undefined for non-existent metadata', () => {
      expect(metadata.getMetadata(testSchema, 'nonExistent')).toBeUndefined();
    });

    it('should check if metadata exists', () => {
      const key = 'existsKey';
      expect(metadata.hasMetadata(testSchema, key)).toBe(false);
      
      metadata.setMetadata(testSchema, key, 'value');
      expect(metadata.hasMetadata(testSchema, key)).toBe(true);
    });

    it('should delete metadata', () => {
      const key = 'deleteKey';
      metadata.setMetadata(testSchema, key, 'value');
      
      expect(metadata.deleteMetadata(testSchema, key)).toBe(true);
      expect(metadata.hasMetadata(testSchema, key)).toBe(false);
    });

    it('should return false when deleting non-existent metadata', () => {
      expect(metadata.deleteMetadata(testSchema, 'nonExistent')).toBe(false);
    });

    it('should get all metadata', () => {
      metadata.setMetadata(testSchema, 'key1', 'value1');
      metadata.setMetadata(testSchema, 'key2', 'value2');
      
      const allMetadata = metadata.getAllMetadata(testSchema);
      expect(allMetadata).toBeInstanceOf(Map);
      expect(allMetadata?.get('key1')).toBe('value1');
      expect(allMetadata?.get('key2')).toBe('value2');
    });

    it('should return undefined when getting all metadata for schema without metadata', () => {
      expect(metadata.getAllMetadata(testSchema)).toBeUndefined();
    });

    it('should clear all metadata', () => {
      metadata.setMetadata(testSchema, 'key1', 'value1');
      metadata.setMetadata(testSchema, 'key2', 'value2');
      
      metadata.clearMetadata(testSchema);
      expect(metadata.getAllMetadata(testSchema)).toBeUndefined();
    });
  });

  describe('Copy and merge metadata', () => {
    it('should copy metadata from source to target', () => {
      const sourceSchema = v.number();
      const targetSchema = v.boolean();
      
      metadata.setMetadata(sourceSchema, 'key1', 'value1');
      metadata.setMetadata(sourceSchema, 'key2', 'value2');
      
      metadata.copyMetadata(sourceSchema, targetSchema);
      
      expect(metadata.getMetadata(targetSchema, 'key1')).toBe('value1');
      expect(metadata.getMetadata(targetSchema, 'key2')).toBe('value2');
    });

    it('should not affect source metadata when copying', () => {
      const sourceSchema = v.number();
      const targetSchema = v.boolean();
      
      metadata.setMetadata(sourceSchema, 'key1', 'value1');
      metadata.copyMetadata(sourceSchema, targetSchema);
      
      metadata.setMetadata(targetSchema, 'key1', 'modified');
      expect(metadata.getMetadata(sourceSchema, 'key1')).toBe('value1');
    });

    it('should handle copying from schema with no metadata', () => {
      const sourceSchema = v.number();
      const targetSchema = v.boolean();
      
      metadata.copyMetadata(sourceSchema, targetSchema);
      expect(metadata.getAllMetadata(targetSchema)).toBeUndefined();
    });

    it('should merge metadata from multiple sources', () => {
      const targetSchema = v.string();
      const source1 = v.number();
      const source2 = v.boolean();
      
      metadata.setMetadata(source1, 'key1', 'value1');
      metadata.setMetadata(source2, 'key2', 'value2');
      
      metadata.mergeMetadata(targetSchema, source1, source2);
      
      expect(metadata.getMetadata(targetSchema, 'key1')).toBe('value1');
      expect(metadata.getMetadata(targetSchema, 'key2')).toBe('value2');
    });

    it('should overwrite keys when merging', () => {
      const targetSchema = v.string();
      const source1 = v.number();
      const source2 = v.boolean();
      
      metadata.setMetadata(source1, 'key', 'value1');
      metadata.setMetadata(source2, 'key', 'value2');
      
      metadata.mergeMetadata(targetSchema, source1, source2);
      
      expect(metadata.getMetadata(targetSchema, 'key')).toBe('value2');
    });

    it('should merge into existing metadata', () => {
      const targetSchema = v.string();
      const source = v.number();
      
      metadata.setMetadata(targetSchema, 'existing', 'existingValue');
      metadata.setMetadata(source, 'new', 'newValue');
      
      metadata.mergeMetadata(targetSchema, source);
      
      expect(metadata.getMetadata(targetSchema, 'existing')).toBe('existingValue');
      expect(metadata.getMetadata(targetSchema, 'new')).toBe('newValue');
    });

    it('should handle merging from schemas with no metadata', () => {
      const targetSchema = v.string();
      const source1 = v.number();
      const source2 = v.boolean();
      
      metadata.setMetadata(targetSchema, 'existing', 'value');
      metadata.mergeMetadata(targetSchema, source1, source2);
      
      expect(metadata.getMetadata(targetSchema, 'existing')).toBe('value');
    });
  });

  describe('Metadata keys constants', () => {
    it('should have all expected metadata keys', () => {
      expect(metadata.MetadataKeys).toHaveProperty('DESCRIPTION');
      expect(metadata.MetadataKeys).toHaveProperty('EXAMPLE');
      expect(metadata.MetadataKeys).toHaveProperty('DEPRECATED');
      expect(metadata.MetadataKeys).toHaveProperty('VERSION');
      expect(metadata.MetadataKeys).toHaveProperty('TAGS');
      expect(metadata.MetadataKeys).toHaveProperty('DOCUMENTATION');
      expect(metadata.MetadataKeys).toHaveProperty('SOURCE');
      expect(metadata.MetadataKeys).toHaveProperty('AUTHOR');
      expect(metadata.MetadataKeys).toHaveProperty('CREATED');
      expect(metadata.MetadataKeys).toHaveProperty('MODIFIED');
      expect(metadata.MetadataKeys).toHaveProperty('CUSTOM');
    });

    it('should use symbols for keys', () => {
      Object.values(metadata.MetadataKeys).forEach(key => {
        expect(typeof key).toBe('symbol');
      });
    });
  });

  describe('Decorator functions', () => {
    it('should describe a schema', () => {
      const description = 'Test description';
      metadata.describe(testSchema, description);
      
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.DESCRIPTION)).toBe(description);
    });

    it('should add example to schema', () => {
      const example = 'test example';
      const result = metadata.example(testSchema, example);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.EXAMPLE)).toBe(example);
    });

    it('should deprecate a schema without reason', () => {
      const result = metadata.deprecate(testSchema);
      
      expect(result).toBe(testSchema);
      const deprecatedInfo = metadata.getMetadata(testSchema, metadata.MetadataKeys.DEPRECATED);
      expect(deprecatedInfo).toEqual({ deprecated: true, reason: undefined });
    });

    it('should deprecate a schema with reason', () => {
      const reason = 'Use newSchema instead';
      const result = metadata.deprecate(testSchema, reason);
      
      expect(result).toBe(testSchema);
      const deprecatedInfo = metadata.getMetadata(testSchema, metadata.MetadataKeys.DEPRECATED);
      expect(deprecatedInfo).toEqual({ deprecated: true, reason });
    });

    it('should add version to schema', () => {
      const versionStr = '1.0.0';
      const result = metadata.version(testSchema, versionStr);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.VERSION)).toBe(versionStr);
    });

    it('should add tags to schema', () => {
      const tags = ['tag1', 'tag2', 'tag3'];
      const result = metadata.tag(testSchema, ...tags);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.TAGS)).toEqual(tags);
    });

    it('should append tags to existing tags', () => {
      const initialTags = ['existing1', 'existing2'];
      const newTags = ['new1', 'new2'];
      
      metadata.tag(testSchema, ...initialTags);
      const result = metadata.tag(testSchema, ...newTags);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.TAGS)).toEqual([...initialTags, ...newTags]);
    });

    it('should add documentation to schema', () => {
      const url = 'https://example.com/docs';
      const result = metadata.document(testSchema, url);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.DOCUMENTATION)).toBe(url);
    });

    it('should add source to schema', () => {
      const source = 'src/schemas/user.ts';
      const result = metadata.source(testSchema, source);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.SOURCE)).toBe(source);
    });

    it('should add string author to schema', () => {
      const author = 'John Doe';
      const result = metadata.author(testSchema, author);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.AUTHOR)).toBe(author);
    });

    it('should add object author to schema', () => {
      const author = { name: 'John Doe', email: 'john@example.com' };
      const result = metadata.author(testSchema, author);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.AUTHOR)).toEqual(author);
    });

    it('should add created timestamp with default date', () => {
      const beforeTime = Date.now();
      const result = metadata.created(testSchema);
      const afterTime = Date.now();
      
      expect(result).toBe(testSchema);
      const createdDate = metadata.getMetadata<Date>(testSchema, metadata.MetadataKeys.CREATED);
      expect(createdDate).toBeInstanceOf(Date);
      expect(createdDate!.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(createdDate!.getTime()).toBeLessThanOrEqual(afterTime);
    });

    it('should add created timestamp with custom date', () => {
      const customDate = new Date('2023-01-01');
      const result = metadata.created(testSchema, customDate);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.CREATED)).toBe(customDate);
    });

    it('should add modified timestamp with default date', () => {
      const beforeTime = Date.now();
      const result = metadata.modified(testSchema);
      const afterTime = Date.now();
      
      expect(result).toBe(testSchema);
      const modifiedDate = metadata.getMetadata<Date>(testSchema, metadata.MetadataKeys.MODIFIED);
      expect(modifiedDate).toBeInstanceOf(Date);
      expect(modifiedDate!.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(modifiedDate!.getTime()).toBeLessThanOrEqual(afterTime);
    });

    it('should add modified timestamp with custom date', () => {
      const customDate = new Date('2023-12-31');
      const result = metadata.modified(testSchema, customDate);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.MODIFIED)).toBe(customDate);
    });

    it('should add custom data to schema', () => {
      const customData = { feature: 'enabled', config: { max: 100 } };
      const result = metadata.custom(testSchema, customData);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.CUSTOM)).toEqual(customData);
    });

    it('should merge custom data with existing custom data', () => {
      const initialCustom = { existing: 'value', override: 'old' };
      const newCustom = { new: 'data', override: 'new' };
      
      metadata.custom(testSchema, initialCustom);
      const result = metadata.custom(testSchema, newCustom);
      
      expect(result).toBe(testSchema);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.CUSTOM)).toEqual({
        existing: 'value',
        override: 'new',
        new: 'data'
      });
    });
  });

  describe('withMetadata function', () => {
    it('should apply all metadata types', () => {
      const metadataConfig = {
        example: 'test-value',
        version: '2.0.0',
        tags: ['important', 'legacy'],
        documentation: 'https://docs.example.com',
        source: 'src/test.ts',
        author: { name: 'Test Author', email: 'test@example.com' },
        custom: { feature: 'enabled' }
      };
      
      metadata.withMetadata(testSchema, metadataConfig);
      
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.EXAMPLE)).toBe(metadataConfig.example);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.VERSION)).toBe(metadataConfig.version);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.TAGS)).toEqual(metadataConfig.tags);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.DOCUMENTATION)).toBe(metadataConfig.documentation);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.SOURCE)).toBe(metadataConfig.source);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.AUTHOR)).toEqual(metadataConfig.author);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.CUSTOM)).toEqual(metadataConfig.custom);
    });

    it('should handle partial metadata', () => {
      const partialMetadata = {
        version: '1.0.0'
      };
      
      metadata.withMetadata(testSchema, partialMetadata);
      
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.VERSION)).toBe(partialMetadata.version);
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.EXAMPLE)).toBeUndefined();
    });

    it('should handle deprecated as boolean', () => {
      metadata.withMetadata(testSchema, { deprecated: true });
      
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.DEPRECATED)).toEqual({ deprecated: true, reason: undefined });
    });

    it('should handle example with undefined', () => {
      metadata.withMetadata(testSchema, { example: undefined });
      
      expect(metadata.getMetadata(testSchema, metadata.MetadataKeys.EXAMPLE)).toBeUndefined();
    });
  });

  describe('getMetadataSummary', () => {
    it('should return complete metadata summary', () => {
      const createdDate = new Date('2023-01-01');
      const modifiedDate = new Date('2023-06-01');
      
      metadata.setMetadata(testSchema, metadata.MetadataKeys.DESCRIPTION, 'Test description');
      metadata.setMetadata(testSchema, metadata.MetadataKeys.EXAMPLE, 'example-value');
      metadata.setMetadata(testSchema, metadata.MetadataKeys.DEPRECATED, { deprecated: true, reason: 'Old version' });
      metadata.setMetadata(testSchema, metadata.MetadataKeys.VERSION, '1.0.0');
      metadata.setMetadata(testSchema, metadata.MetadataKeys.TAGS, ['tag1', 'tag2']);
      metadata.setMetadata(testSchema, metadata.MetadataKeys.DOCUMENTATION, 'https://docs.example.com');
      metadata.setMetadata(testSchema, metadata.MetadataKeys.SOURCE, 'src/schema.ts');
      metadata.setMetadata(testSchema, metadata.MetadataKeys.AUTHOR, 'John Doe');
      metadata.setMetadata(testSchema, metadata.MetadataKeys.CREATED, createdDate);
      metadata.setMetadata(testSchema, metadata.MetadataKeys.MODIFIED, modifiedDate);
      metadata.setMetadata(testSchema, metadata.MetadataKeys.CUSTOM, { custom: 'data' });
      
      const summary = metadata.getMetadataSummary(testSchema);
      
      expect(summary).toEqual({
        description: 'Test description',
        example: 'example-value',
        deprecated: { deprecated: true, reason: 'Old version' },
        version: '1.0.0',
        tags: ['tag1', 'tag2'],
        documentation: 'https://docs.example.com',
        source: 'src/schema.ts',
        author: 'John Doe',
        created: createdDate,
        modified: modifiedDate,
        custom: { custom: 'data' }
      });
    });

    it('should return summary with undefined values for missing metadata', () => {
      const summary = metadata.getMetadataSummary(testSchema);
      
      expect(summary).toEqual({
        description: undefined,
        example: undefined,
        deprecated: undefined,
        version: undefined,
        tags: undefined,
        documentation: undefined,
        source: undefined,
        author: undefined,
        created: undefined,
        modified: undefined,
        custom: undefined
      });
    });
  });

  describe('Integration with v.metadata', () => {
    it('should work with v.metadata.set and v.metadata.get', () => {
      v.metadata.set(testSchema, 'key', 'value');
      expect(v.metadata.get(testSchema, 'key')).toBe('value');
    });

    it('should work with v.metadata.describe', () => {
      v.metadata.describe(testSchema, 'description');
      expect(v.metadata.get(testSchema, metadata.MetadataKeys.DESCRIPTION)).toBe('description');
    });

    it('should work with v.metadata.getSummary', () => {
      v.metadata.set(testSchema, metadata.MetadataKeys.VERSION, '1.0.0');
      const summary = v.metadata.getSummary(testSchema);
      expect(summary.version).toBe('1.0.0');
    });
  });
});