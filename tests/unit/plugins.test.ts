import { PluginManager, IValidatorPlugin, createPlugin } from '../../src/plugins/manager';
import { ValidatorFunction, TransformFunction, SchemaDefinition } from '../../src/types/base';

describe('Plugin Manager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    // Reset the singleton instance for each test
    (PluginManager as any).instance = null;
    manager = PluginManager.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = PluginManager.getInstance();
      const instance2 = PluginManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('register', () => {
    it('should register a plugin', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn()
      };
      
      manager.register(plugin);
      expect(manager.getPlugin('test-plugin')).toBe(plugin);
    });

    it('should call install hook when registering', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn()
      };
      
      manager.register(plugin);
      expect(plugin.install).toHaveBeenCalledWith(manager);
    });

    it('should throw error if plugin already registered', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn()
      };
      
      manager.register(plugin);
      expect(() => manager.register(plugin)).toThrow('Plugin "test-plugin" is already registered');
    });

    it('should register validators from plugin', () => {
      const validator: ValidatorFunction = (value) => {
        if (typeof value !== 'string') throw new Error('Not a string');
        return value;
      };
      
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        validators: {
          'customString': validator
        }
      };
      
      manager.register(plugin);
      expect(manager.getValidator('test-plugin:customString')).toBe(validator);
    });

    it('should register transforms from plugin', () => {
      const transform: TransformFunction = (value) => String(value).toUpperCase();
      
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        transforms: {
          'toUpper': transform
        }
      };
      
      manager.register(plugin);
      expect(manager.getTransform('test-plugin:toUpper')).toBe(transform);
    });

    it('should register schemas from plugin', () => {
      const schemaFactory = () => ({ parse: (v: any) => v } as SchemaDefinition<any, any>);
      
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        schemas: {
          'custom': schemaFactory
        }
      };
      
      manager.register(plugin);
      expect(manager.getSchema('test-plugin:custom')).toBe(schemaFactory);
    });

    it('should register multiple validators, transforms, and schemas', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        validators: {
          'val1': (v) => v,
          'val2': (v) => v
        },
        transforms: {
          'trans1': (v) => v,
          'trans2': (v) => v
        },
        schemas: {
          'schema1': () => ({ parse: (v: any) => v } as SchemaDefinition<any, any>),
          'schema2': () => ({ parse: (v: any) => v } as SchemaDefinition<any, any>)
        }
      };
      
      manager.register(plugin);
      
      expect(manager.getValidator('test-plugin:val1')).toBeDefined();
      expect(manager.getValidator('test-plugin:val2')).toBeDefined();
      expect(manager.getTransform('test-plugin:trans1')).toBeDefined();
      expect(manager.getTransform('test-plugin:trans2')).toBeDefined();
      expect(manager.getSchema('test-plugin:schema1')).toBeDefined();
      expect(manager.getSchema('test-plugin:schema2')).toBeDefined();
    });
  });

  describe('unregister', () => {
    it('should unregister a plugin', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn()
      };
      
      manager.register(plugin);
      expect(manager.getPlugin('test-plugin')).toBe(plugin);
      
      manager.unregister('test-plugin');
      expect(manager.getPlugin('test-plugin')).toBeUndefined();
    });

    it('should throw error if plugin not registered', () => {
      expect(() => manager.unregister('non-existent')).toThrow('Plugin "non-existent" is not registered');
    });

    it('should remove validators when unregistering', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        validators: {
          'customString': (v) => v
        }
      };
      
      manager.register(plugin);
      expect(manager.getValidator('test-plugin:customString')).toBeDefined();
      
      manager.unregister('test-plugin');
      expect(manager.getValidator('test-plugin:customString')).toBeUndefined();
    });

    it('should remove transforms when unregistering', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        transforms: {
          'toUpper': (v) => String(v).toUpperCase()
        }
      };
      
      manager.register(plugin);
      expect(manager.getTransform('test-plugin:toUpper')).toBeDefined();
      
      manager.unregister('test-plugin');
      expect(manager.getTransform('test-plugin:toUpper')).toBeUndefined();
    });

    it('should remove schemas when unregistering', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        schemas: {
          'custom': () => ({ parse: (v: any) => v } as SchemaDefinition<any, any>)
        }
      };
      
      manager.register(plugin);
      expect(manager.getSchema('test-plugin:custom')).toBeDefined();
      
      manager.unregister('test-plugin');
      expect(manager.getSchema('test-plugin:custom')).toBeUndefined();
    });

    it('should remove all validators, transforms, and schemas', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        validators: {
          'val1': (v) => v,
          'val2': (v) => v
        },
        transforms: {
          'trans1': (v) => v,
          'trans2': (v) => v
        },
        schemas: {
          'schema1': () => ({ parse: (v: any) => v } as SchemaDefinition<any, any>),
          'schema2': () => ({ parse: (v: any) => v } as SchemaDefinition<any, any>)
        }
      };
      
      manager.register(plugin);
      manager.unregister('test-plugin');
      
      expect(manager.getValidator('test-plugin:val1')).toBeUndefined();
      expect(manager.getValidator('test-plugin:val2')).toBeUndefined();
      expect(manager.getTransform('test-plugin:trans1')).toBeUndefined();
      expect(manager.getTransform('test-plugin:trans2')).toBeUndefined();
      expect(manager.getSchema('test-plugin:schema1')).toBeUndefined();
      expect(manager.getSchema('test-plugin:schema2')).toBeUndefined();
    });
  });

  describe('getValidator', () => {
    it('should return validator by namespaced key', () => {
      const validator: ValidatorFunction = (v) => v;
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        validators: {
          'custom': validator
        }
      };
      
      manager.register(plugin);
      expect(manager.getValidator('test-plugin:custom')).toBe(validator);
    });

    it('should return undefined for non-existent validator', () => {
      expect(manager.getValidator('non-existent:validator')).toBeUndefined();
    });
  });

  describe('getTransform', () => {
    it('should return transform by namespaced key', () => {
      const transform: TransformFunction = (v) => v;
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        transforms: {
          'custom': transform
        }
      };
      
      manager.register(plugin);
      expect(manager.getTransform('test-plugin:custom')).toBe(transform);
    });

    it('should return undefined for non-existent transform', () => {
      expect(manager.getTransform('non-existent:transform')).toBeUndefined();
    });
  });

  describe('getSchema', () => {
    it('should return schema factory by namespaced key', () => {
      const schemaFactory = () => ({ parse: (v: any) => v } as SchemaDefinition<any, any>);
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn(),
        schemas: {
          'custom': schemaFactory
        }
      };
      
      manager.register(plugin);
      expect(manager.getSchema('test-plugin:custom')).toBe(schemaFactory);
    });

    it('should return undefined for non-existent schema', () => {
      expect(manager.getSchema('non-existent:schema')).toBeUndefined();
    });
  });

  describe('listPlugins', () => {
    it('should list all registered plugins', () => {
      const plugin1: IValidatorPlugin = {
        name: 'plugin1',
        version: '1.0.0',
        install: jest.fn()
      };
      const plugin2: IValidatorPlugin = {
        name: 'plugin2',
        version: '1.0.0',
        install: jest.fn()
      };
      
      manager.register(plugin1);
      manager.register(plugin2);
      
      const plugins = manager.listPlugins();
      expect(plugins).toContain('plugin1');
      expect(plugins).toContain('plugin2');
      expect(plugins).toHaveLength(2);
    });

    it('should return empty array when no plugins registered', () => {
      expect(manager.listPlugins()).toEqual([]);
    });
  });

  describe('getPlugin', () => {
    it('should return plugin by name', () => {
      const plugin: IValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: jest.fn()
      };
      
      manager.register(plugin);
      expect(manager.getPlugin('test-plugin')).toBe(plugin);
    });

    it('should return undefined for non-existent plugin', () => {
      expect(manager.getPlugin('non-existent')).toBeUndefined();
    });
  });

  describe('createPlugin', () => {
    it('should create a plugin from config', () => {
      const config: IValidatorPlugin = {
        name: 'custom-plugin',
        version: '2.0.0',
        install: jest.fn(),
        validators: {
          'test': (v) => v
        }
      };
      
      const plugin = createPlugin(config);
      expect(plugin).toBe(config);
      expect(plugin.name).toBe('custom-plugin');
      expect(plugin.version).toBe('2.0.0');
      expect(plugin.validators).toBeDefined();
    });
  });

  describe('Plugin with no optional properties', () => {
    it('should register plugin with only required properties', () => {
      const plugin: IValidatorPlugin = {
        name: 'minimal-plugin',
        version: '1.0.0',
        install: jest.fn()
      };
      
      manager.register(plugin);
      expect(manager.getPlugin('minimal-plugin')).toBe(plugin);
    });

    it('should handle unregister for plugin with no optional properties', () => {
      const plugin: IValidatorPlugin = {
        name: 'minimal-plugin',
        version: '1.0.0',
        install: jest.fn()
      };
      
      manager.register(plugin);
      manager.unregister('minimal-plugin');
      expect(manager.getPlugin('minimal-plugin')).toBeUndefined();
    });
  });
});