import { SchemaDefinition } from '../types/base';

/**
 * Schema metadata system for storing additional information
 */

const metadataStore = new WeakMap<SchemaDefinition, Map<string | symbol, any>>();

/**
 * Metadata keys
 */
export const MetadataKeys = {
  DESCRIPTION: Symbol('description'),
  EXAMPLE: Symbol('example'),
  DEPRECATED: Symbol('deprecated'),
  VERSION: Symbol('version'),
  TAGS: Symbol('tags'),
  DOCUMENTATION: Symbol('documentation'),
  SOURCE: Symbol('source'),
  AUTHOR: Symbol('author'),
  CREATED: Symbol('created'),
  MODIFIED: Symbol('modified'),
  CUSTOM: Symbol('custom')
} as const;

/**
 * Set metadata on a schema
 */
export function setMetadata<T extends SchemaDefinition>(
  schema: T,
  key: string | symbol,
  value: any
): T {
  if (!metadataStore.has(schema)) {
    metadataStore.set(schema, new Map());
  }
  metadataStore.get(schema)!.set(key, value);
  return schema;
}

/**
 * Get metadata from a schema
 */
export function getMetadata<T = any>(
  schema: SchemaDefinition,
  key: string | symbol
): T | undefined {
  const metadata = metadataStore.get(schema);
  return metadata?.get(key) as T;
}

/**
 * Check if a schema has metadata
 */
export function hasMetadata(
  schema: SchemaDefinition,
  key: string | symbol
): boolean {
  const metadata = metadataStore.get(schema);
  return metadata?.has(key) ?? false;
}

/**
 * Delete metadata from a schema
 */
export function deleteMetadata(
  schema: SchemaDefinition,
  key: string | symbol
): boolean {
  const metadata = metadataStore.get(schema);
  return metadata?.delete(key) ?? false;
}

/**
 * Get all metadata for a schema
 */
export function getAllMetadata(
  schema: SchemaDefinition
): Map<string | symbol, any> | undefined {
  return metadataStore.get(schema);
}

/**
 * Copy metadata from one schema to another
 */
export function copyMetadata(
  source: SchemaDefinition,
  target: SchemaDefinition
): void {
  const sourceMetadata = metadataStore.get(source);
  if (sourceMetadata) {
    const targetMetadata = new Map(sourceMetadata);
    metadataStore.set(target, targetMetadata);
  }
}

/**
 * Clear all metadata for a schema
 */
export function clearMetadata(schema: SchemaDefinition): void {
  metadataStore.delete(schema);
}

/**
 * Merge metadata from multiple schemas
 */
export function mergeMetadata(
  target: SchemaDefinition,
  ...sources: SchemaDefinition[]
): void {
  if (!metadataStore.has(target)) {
    metadataStore.set(target, new Map());
  }
  
  const targetMetadata = metadataStore.get(target)!;
  
  for (const source of sources) {
    const sourceMetadata = metadataStore.get(source);
    if (sourceMetadata) {
      for (const [key, value] of sourceMetadata) {
        targetMetadata.set(key, value);
      }
    }
  }
}

/**
 * Schema metadata decorator functions
 */

/**
 * Add a description to a schema
 */
export function describe<T extends SchemaDefinition>(
  schema: T,
  description: string
): T {
  setMetadata(schema, MetadataKeys.DESCRIPTION, description);
  return schema.describe(description) as T;
}

/**
 * Add an example to a schema
 */
export function example<T extends SchemaDefinition>(
  schema: T,
  example: any
): T {
  setMetadata(schema, MetadataKeys.EXAMPLE, example);
  return schema;
}

/**
 * Mark a schema as deprecated
 */
export function deprecate<T extends SchemaDefinition>(
  schema: T,
  reason?: string
): T {
  setMetadata(schema, MetadataKeys.DEPRECATED, { deprecated: true, reason });
  return schema;
}

/**
 * Add version information to a schema
 */
export function version<T extends SchemaDefinition>(
  schema: T,
  version: string
): T {
  setMetadata(schema, MetadataKeys.VERSION, version);
  return schema;
}

/**
 * Add tags to a schema
 */
export function tag<T extends SchemaDefinition>(
  schema: T,
  ...tags: string[]
): T {
  const existingTags = getMetadata<string[]>(schema, MetadataKeys.TAGS) || [];
  setMetadata(schema, MetadataKeys.TAGS, [...existingTags, ...tags]);
  return schema;
}

/**
 * Add documentation link to a schema
 */
export function document<T extends SchemaDefinition>(
  schema: T,
  url: string
): T {
  setMetadata(schema, MetadataKeys.DOCUMENTATION, url);
  return schema;
}

/**
 * Add source information to a schema
 */
export function source<T extends SchemaDefinition>(
  schema: T,
  source: string
): T {
  setMetadata(schema, MetadataKeys.SOURCE, source);
  return schema;
}

/**
 * Add author information to a schema
 */
export function author<T extends SchemaDefinition>(
  schema: T,
  author: string | { name: string; email?: string }
): T {
  setMetadata(schema, MetadataKeys.AUTHOR, author);
  return schema;
}

/**
 * Add creation timestamp to a schema
 */
export function created<T extends SchemaDefinition>(
  schema: T,
  date: Date = new Date()
): T {
  setMetadata(schema, MetadataKeys.CREATED, date);
  return schema;
}

/**
 * Add modification timestamp to a schema
 */
export function modified<T extends SchemaDefinition>(
  schema: T,
  date: Date = new Date()
): T {
  setMetadata(schema, MetadataKeys.MODIFIED, date);
  return schema;
}

/**
 * Add custom metadata to a schema
 */
export function custom<T extends SchemaDefinition>(
  schema: T,
  data: Record<string, any>
): T {
  const existingCustom = getMetadata<Record<string, any>>(schema, MetadataKeys.CUSTOM) || {};
  setMetadata(schema, MetadataKeys.CUSTOM, { ...existingCustom, ...data });
  return schema;
}

/**
 * Create a metadata-enhanced schema builder
 */
export function withMetadata<T extends SchemaDefinition>(
  schema: T,
  metadata: {
    description?: string;
    example?: any;
    deprecated?: boolean | string;
    version?: string;
    tags?: string[];
    documentation?: string;
    source?: string;
    author?: string | { name: string; email?: string };
    custom?: Record<string, any>;
  }
): T {
  let result = schema;
  
  if (metadata.description) {
    result = describe(result, metadata.description);
  }
  if (metadata.example !== undefined) {
    result = example(result, metadata.example);
  }
  if (metadata.deprecated) {
    result = deprecate(result, typeof metadata.deprecated === 'string' ? metadata.deprecated : undefined);
  }
  if (metadata.version) {
    result = version(result, metadata.version);
  }
  if (metadata.tags) {
    result = tag(result, ...metadata.tags);
  }
  if (metadata.documentation) {
    result = document(result, metadata.documentation);
  }
  if (metadata.source) {
    result = source(result, metadata.source);
  }
  if (metadata.author) {
    result = author(result, metadata.author);
  }
  if (metadata.custom) {
    result = custom(result, metadata.custom);
  }
  
  return result;
}

/**
 * Extract metadata summary from a schema
 */
export function getMetadataSummary(schema: SchemaDefinition): {
  description?: string;
  example?: any;
  deprecated?: { deprecated: boolean; reason?: string };
  version?: string;
  tags?: string[];
  documentation?: string;
  source?: string;
  author?: string | { name: string; email?: string };
  created?: Date;
  modified?: Date;
  custom?: Record<string, any>;
} {
  return {
    description: getMetadata(schema, MetadataKeys.DESCRIPTION),
    example: getMetadata(schema, MetadataKeys.EXAMPLE),
    deprecated: getMetadata(schema, MetadataKeys.DEPRECATED),
    version: getMetadata(schema, MetadataKeys.VERSION),
    tags: getMetadata(schema, MetadataKeys.TAGS),
    documentation: getMetadata(schema, MetadataKeys.DOCUMENTATION),
    source: getMetadata(schema, MetadataKeys.SOURCE),
    author: getMetadata(schema, MetadataKeys.AUTHOR),
    created: getMetadata(schema, MetadataKeys.CREATED),
    modified: getMetadata(schema, MetadataKeys.MODIFIED),
    custom: getMetadata(schema, MetadataKeys.CUSTOM)
  };
}