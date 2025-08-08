import { SchemaDefinition } from '../types/base';
/**
 * Metadata keys
 */
export declare const MetadataKeys: {
    readonly DESCRIPTION: symbol;
    readonly EXAMPLE: symbol;
    readonly DEPRECATED: symbol;
    readonly VERSION: symbol;
    readonly TAGS: symbol;
    readonly DOCUMENTATION: symbol;
    readonly SOURCE: symbol;
    readonly AUTHOR: symbol;
    readonly CREATED: symbol;
    readonly MODIFIED: symbol;
    readonly CUSTOM: symbol;
};
/**
 * Set metadata on a schema
 */
export declare function setMetadata<T extends SchemaDefinition>(schema: T, key: string | symbol, value: any): T;
/**
 * Get metadata from a schema
 */
export declare function getMetadata<T = any>(schema: SchemaDefinition, key: string | symbol): T | undefined;
/**
 * Check if a schema has metadata
 */
export declare function hasMetadata(schema: SchemaDefinition, key: string | symbol): boolean;
/**
 * Delete metadata from a schema
 */
export declare function deleteMetadata(schema: SchemaDefinition, key: string | symbol): boolean;
/**
 * Get all metadata for a schema
 */
export declare function getAllMetadata(schema: SchemaDefinition): Map<string | symbol, any> | undefined;
/**
 * Copy metadata from one schema to another
 */
export declare function copyMetadata(source: SchemaDefinition, target: SchemaDefinition): void;
/**
 * Clear all metadata for a schema
 */
export declare function clearMetadata(schema: SchemaDefinition): void;
/**
 * Merge metadata from multiple schemas
 */
export declare function mergeMetadata(target: SchemaDefinition, ...sources: SchemaDefinition[]): void;
/**
 * Schema metadata decorator functions
 */
/**
 * Add a description to a schema
 */
export declare function describe<T extends SchemaDefinition>(schema: T, description: string): T;
/**
 * Add an example to a schema
 */
export declare function example<T extends SchemaDefinition>(schema: T, example: any): T;
/**
 * Mark a schema as deprecated
 */
export declare function deprecate<T extends SchemaDefinition>(schema: T, reason?: string): T;
/**
 * Add version information to a schema
 */
export declare function version<T extends SchemaDefinition>(schema: T, version: string): T;
/**
 * Add tags to a schema
 */
export declare function tag<T extends SchemaDefinition>(schema: T, ...tags: string[]): T;
/**
 * Add documentation link to a schema
 */
export declare function document<T extends SchemaDefinition>(schema: T, url: string): T;
/**
 * Add source information to a schema
 */
export declare function source<T extends SchemaDefinition>(schema: T, source: string): T;
/**
 * Add author information to a schema
 */
export declare function author<T extends SchemaDefinition>(schema: T, author: string | {
    name: string;
    email?: string;
}): T;
/**
 * Add creation timestamp to a schema
 */
export declare function created<T extends SchemaDefinition>(schema: T, date?: Date): T;
/**
 * Add modification timestamp to a schema
 */
export declare function modified<T extends SchemaDefinition>(schema: T, date?: Date): T;
/**
 * Add custom metadata to a schema
 */
export declare function custom<T extends SchemaDefinition>(schema: T, data: Record<string, any>): T;
/**
 * Create a metadata-enhanced schema builder
 */
export declare function withMetadata<T extends SchemaDefinition>(schema: T, metadata: {
    description?: string;
    example?: any;
    deprecated?: boolean | string;
    version?: string;
    tags?: string[];
    documentation?: string;
    source?: string;
    author?: string | {
        name: string;
        email?: string;
    };
    custom?: Record<string, any>;
}): T;
/**
 * Extract metadata summary from a schema
 */
export declare function getMetadataSummary(schema: SchemaDefinition): {
    description?: string;
    example?: any;
    deprecated?: {
        deprecated: boolean;
        reason?: string;
    };
    version?: string;
    tags?: string[];
    documentation?: string;
    source?: string;
    author?: string | {
        name: string;
        email?: string;
    };
    created?: Date;
    modified?: Date;
    custom?: Record<string, any>;
};
//# sourceMappingURL=metadata.d.ts.map