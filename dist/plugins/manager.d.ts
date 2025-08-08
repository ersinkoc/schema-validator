import { ValidatorFunction, TransformFunction, SchemaDefinition } from '../types/base';
export interface IValidatorPlugin {
    name: string;
    version: string;
    install(validator: any): void;
    validators?: Record<string, ValidatorFunction>;
    transforms?: Record<string, TransformFunction>;
    schemas?: Record<string, () => SchemaDefinition<any, any>>;
}
export declare class PluginManager {
    private static instance;
    private plugins;
    private validators;
    private transforms;
    private schemas;
    private constructor();
    static getInstance(): PluginManager;
    register(plugin: IValidatorPlugin): void;
    unregister(pluginName: string): void;
    getValidator(name: string): ValidatorFunction | undefined;
    getTransform(name: string): TransformFunction | undefined;
    getSchema(name: string): (() => SchemaDefinition<any, any>) | undefined;
    listPlugins(): string[];
    getPlugin(name: string): IValidatorPlugin | undefined;
}
export declare function createPlugin(config: IValidatorPlugin): IValidatorPlugin;
export declare const pluginManager: PluginManager;
//# sourceMappingURL=manager.d.ts.map