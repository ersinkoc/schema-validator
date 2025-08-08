"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataKeys = void 0;
exports.setMetadata = setMetadata;
exports.getMetadata = getMetadata;
exports.hasMetadata = hasMetadata;
exports.deleteMetadata = deleteMetadata;
exports.getAllMetadata = getAllMetadata;
exports.copyMetadata = copyMetadata;
exports.clearMetadata = clearMetadata;
exports.mergeMetadata = mergeMetadata;
exports.describe = describe;
exports.example = example;
exports.deprecate = deprecate;
exports.version = version;
exports.tag = tag;
exports.document = document;
exports.source = source;
exports.author = author;
exports.created = created;
exports.modified = modified;
exports.custom = custom;
exports.withMetadata = withMetadata;
exports.getMetadataSummary = getMetadataSummary;
/**
 * Schema metadata system for storing additional information
 */
const metadataStore = new WeakMap();
/**
 * Metadata keys
 */
exports.MetadataKeys = {
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
};
/**
 * Set metadata on a schema
 */
function setMetadata(schema, key, value) {
    if (!metadataStore.has(schema)) {
        metadataStore.set(schema, new Map());
    }
    metadataStore.get(schema).set(key, value);
    return schema;
}
/**
 * Get metadata from a schema
 */
function getMetadata(schema, key) {
    const metadata = metadataStore.get(schema);
    return metadata?.get(key);
}
/**
 * Check if a schema has metadata
 */
function hasMetadata(schema, key) {
    const metadata = metadataStore.get(schema);
    return metadata?.has(key) ?? false;
}
/**
 * Delete metadata from a schema
 */
function deleteMetadata(schema, key) {
    const metadata = metadataStore.get(schema);
    return metadata?.delete(key) ?? false;
}
/**
 * Get all metadata for a schema
 */
function getAllMetadata(schema) {
    return metadataStore.get(schema);
}
/**
 * Copy metadata from one schema to another
 */
function copyMetadata(source, target) {
    const sourceMetadata = metadataStore.get(source);
    if (sourceMetadata) {
        const targetMetadata = new Map(sourceMetadata);
        metadataStore.set(target, targetMetadata);
    }
}
/**
 * Clear all metadata for a schema
 */
function clearMetadata(schema) {
    metadataStore.delete(schema);
}
/**
 * Merge metadata from multiple schemas
 */
function mergeMetadata(target, ...sources) {
    if (!metadataStore.has(target)) {
        metadataStore.set(target, new Map());
    }
    const targetMetadata = metadataStore.get(target);
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
function describe(schema, description) {
    setMetadata(schema, exports.MetadataKeys.DESCRIPTION, description);
    return schema.describe(description);
}
/**
 * Add an example to a schema
 */
function example(schema, example) {
    setMetadata(schema, exports.MetadataKeys.EXAMPLE, example);
    return schema;
}
/**
 * Mark a schema as deprecated
 */
function deprecate(schema, reason) {
    setMetadata(schema, exports.MetadataKeys.DEPRECATED, { deprecated: true, reason });
    return schema;
}
/**
 * Add version information to a schema
 */
function version(schema, version) {
    setMetadata(schema, exports.MetadataKeys.VERSION, version);
    return schema;
}
/**
 * Add tags to a schema
 */
function tag(schema, ...tags) {
    const existingTags = getMetadata(schema, exports.MetadataKeys.TAGS) || [];
    setMetadata(schema, exports.MetadataKeys.TAGS, [...existingTags, ...tags]);
    return schema;
}
/**
 * Add documentation link to a schema
 */
function document(schema, url) {
    setMetadata(schema, exports.MetadataKeys.DOCUMENTATION, url);
    return schema;
}
/**
 * Add source information to a schema
 */
function source(schema, source) {
    setMetadata(schema, exports.MetadataKeys.SOURCE, source);
    return schema;
}
/**
 * Add author information to a schema
 */
function author(schema, author) {
    setMetadata(schema, exports.MetadataKeys.AUTHOR, author);
    return schema;
}
/**
 * Add creation timestamp to a schema
 */
function created(schema, date = new Date()) {
    setMetadata(schema, exports.MetadataKeys.CREATED, date);
    return schema;
}
/**
 * Add modification timestamp to a schema
 */
function modified(schema, date = new Date()) {
    setMetadata(schema, exports.MetadataKeys.MODIFIED, date);
    return schema;
}
/**
 * Add custom metadata to a schema
 */
function custom(schema, data) {
    const existingCustom = getMetadata(schema, exports.MetadataKeys.CUSTOM) || {};
    setMetadata(schema, exports.MetadataKeys.CUSTOM, { ...existingCustom, ...data });
    return schema;
}
/**
 * Create a metadata-enhanced schema builder
 */
function withMetadata(schema, metadata) {
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
function getMetadataSummary(schema) {
    return {
        description: getMetadata(schema, exports.MetadataKeys.DESCRIPTION),
        example: getMetadata(schema, exports.MetadataKeys.EXAMPLE),
        deprecated: getMetadata(schema, exports.MetadataKeys.DEPRECATED),
        version: getMetadata(schema, exports.MetadataKeys.VERSION),
        tags: getMetadata(schema, exports.MetadataKeys.TAGS),
        documentation: getMetadata(schema, exports.MetadataKeys.DOCUMENTATION),
        source: getMetadata(schema, exports.MetadataKeys.SOURCE),
        author: getMetadata(schema, exports.MetadataKeys.AUTHOR),
        created: getMetadata(schema, exports.MetadataKeys.CREATED),
        modified: getMetadata(schema, exports.MetadataKeys.MODIFIED),
        custom: getMetadata(schema, exports.MetadataKeys.CUSTOM)
    };
}
//# sourceMappingURL=metadata.js.map