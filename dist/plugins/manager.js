"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginManager = exports.PluginManager = void 0;
exports.createPlugin = createPlugin;
class PluginManager {
    static instance;
    plugins = new Map();
    validators = new Map();
    transforms = new Map();
    schemas = new Map();
    constructor() { }
    static getInstance() {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }
    register(plugin) {
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
    unregister(pluginName) {
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
    getValidator(name) {
        return this.validators.get(name);
    }
    getTransform(name) {
        return this.transforms.get(name);
    }
    getSchema(name) {
        return this.schemas.get(name);
    }
    listPlugins() {
        return Array.from(this.plugins.keys());
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
}
exports.PluginManager = PluginManager;
function createPlugin(config) {
    return config;
}
// Export singleton instance
exports.pluginManager = PluginManager.getInstance();
//# sourceMappingURL=manager.js.map