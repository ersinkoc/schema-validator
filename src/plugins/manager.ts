import { ValidatorFunction, TransformFunction, SchemaDefinition } from '../types/base';

export interface IValidatorPlugin {
  name: string;
  version: string;
  install(validator: any): void;
  validators?: Record<string, ValidatorFunction>;
  transforms?: Record<string, TransformFunction>;
  schemas?: Record<string, () => SchemaDefinition<any, any>>;
}

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, IValidatorPlugin> = new Map();
  private validators: Map<string, ValidatorFunction> = new Map();
  private transforms: Map<string, TransformFunction> = new Map();
  private schemas: Map<string, () => SchemaDefinition<any, any>> = new Map();

  private constructor() {}

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  register(plugin: IValidatorPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    this.plugins.set(plugin.name, plugin);

    // Register validators
    if (plugin.validators) {
      for (const [name, validator] of Object.entries(plugin.validators)) {
        this.validators.set(`${plugin.name}:${name}`, validator);
      }
    }

    // Register transforms
    if (plugin.transforms) {
      for (const [name, transform] of Object.entries(plugin.transforms)) {
        this.transforms.set(`${plugin.name}:${name}`, transform);
      }
    }

    // Register schemas
    if (plugin.schemas) {
      for (const [name, schema] of Object.entries(plugin.schemas)) {
        this.schemas.set(`${plugin.name}:${name}`, schema);
      }
    }

    // Call install hook
    plugin.install(this);
  }

  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }

    // Remove validators
    if (plugin.validators) {
      for (const name of Object.keys(plugin.validators)) {
        this.validators.delete(`${pluginName}:${name}`);
      }
    }

    // Remove transforms
    if (plugin.transforms) {
      for (const name of Object.keys(plugin.transforms)) {
        this.transforms.delete(`${pluginName}:${name}`);
      }
    }

    // Remove schemas
    if (plugin.schemas) {
      for (const name of Object.keys(plugin.schemas)) {
        this.schemas.delete(`${pluginName}:${name}`);
      }
    }

    this.plugins.delete(pluginName);
  }

  getValidator(name: string): ValidatorFunction | undefined {
    return this.validators.get(name);
  }

  getTransform(name: string): TransformFunction | undefined {
    return this.transforms.get(name);
  }

  getSchema(name: string): (() => SchemaDefinition<any, any>) | undefined {
    return this.schemas.get(name);
  }

  listPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  getPlugin(name: string): IValidatorPlugin | undefined {
    return this.plugins.get(name);
  }
}

export function createPlugin(config: IValidatorPlugin): IValidatorPlugin {
  return config;
}

// Export singleton instance
export const pluginManager = PluginManager.getInstance();