"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.or = or;
exports.and = and;
exports.conditional = conditional;
exports.recursive = recursive;
exports.mergeObjects = mergeObjects;
exports.pipeline = pipeline;
exports.coerce = coerce;
exports.withFallback = withFallback;
exports.preprocess = preprocess;
exports.postprocess = postprocess;
exports.nullable = nullable;
exports.optional = optional;
exports.nullish = nullish;
exports.withDefault = withDefault;
exports.brand = brand;
exports.readonly = readonly;
exports.defer = defer;
exports.firstOf = firstOf;
exports.allOf = allOf;
exports.extend = extend;
exports.pick = pick;
exports.omit = omit;
exports.partial = partial;
exports.required = required;
exports.deepPartial = deepPartial;
const union_1 = require("../schemas/complex/union");
const intersection_1 = require("../schemas/complex/intersection");
const lazy_1 = require("../schemas/complex/lazy");
/**
 * Schema composition utilities for building complex schemas
 */
/**
 * Compose multiple schemas into a union (OR)
 */
function or(...schemas) {
    if (schemas.length === 0) {
        throw new Error('At least one schema is required for union');
    }
    return (0, union_1.union)(schemas);
}
/**
 * Compose multiple schemas into an intersection (AND)
 */
function and(...schemas) {
    if (schemas.length === 0) {
        throw new Error('At least one schema is required for intersection');
    }
    if (schemas.length === 1) {
        return schemas[0];
    }
    return schemas.reduce((acc, schema) => (0, intersection_1.intersection)(acc, schema));
}
/**
 * Create a conditional schema based on a discriminator
 */
function conditional(_discriminator, cases) {
    const schemas = Object.values(cases);
    if (schemas.length === 0) {
        throw new Error('At least one case is required');
    }
    return (0, union_1.union)(schemas);
}
/**
 * Create a recursive schema
 */
function recursive(definition) {
    return (0, lazy_1.lazy)(() => definition(recursiveSchema));
    const recursiveSchema = (0, lazy_1.lazy)(() => definition(recursiveSchema));
    return recursiveSchema;
}
/**
 * Merge multiple object schemas
 */
function mergeObjects(...schemas) {
    if (schemas.length === 0) {
        throw new Error('At least one schema is required for merging');
    }
    return schemas.reduce((acc, schema) => acc.merge(schema));
}
/**
 * Create a pipeline of transformations
 */
function pipeline(...schemas) {
    if (schemas.length === 0) {
        throw new Error('At least one schema is required for pipeline');
    }
    return schemas.reduce((acc, schema, index) => {
        if (index === 0)
            return schema;
        // Apply the next schema as a transformation
        return acc.transform((value) => schema.parse(value));
    });
}
/**
 * Create a schema that coerces input to the expected type
 */
function coerce(targetSchema, coercer) {
    return {
        ...targetSchema,
        parse: (data) => {
            const coerced = coercer(data);
            return targetSchema.parse(coerced);
        },
        parseAsync: async (data) => {
            const coerced = coercer(data);
            return targetSchema.parseAsync(coerced);
        },
        safeParse: (data) => {
            try {
                const coerced = coercer(data);
                return targetSchema.safeParse(coerced);
            }
            catch (error) {
                return {
                    success: false,
                    error: error
                };
            }
        },
        safeParseAsync: async (data) => {
            try {
                const coerced = coercer(data);
                return targetSchema.safeParseAsync(coerced);
            }
            catch (error) {
                return {
                    success: false,
                    error: error
                };
            }
        }
    };
}
/**
 * Create a schema with a fallback value on parse error
 */
function withFallback(schema, fallback) {
    return schema.catch(fallback);
}
/**
 * Create a schema that preprocesses input before validation
 */
function preprocess(preprocessor, schema) {
    return coerce(schema, preprocessor);
}
/**
 * Create a schema that postprocesses output after validation
 */
function postprocess(schema, postprocessor) {
    return schema.transform(postprocessor);
}
/**
 * Create a nullable version of a schema
 */
function nullable(schema) {
    return schema.nullable();
}
/**
 * Create an optional version of a schema
 */
function optional(schema) {
    return schema.optional();
}
/**
 * Create a nullish version of a schema
 */
function nullish(schema) {
    return schema.nullish();
}
/**
 * Create a schema with a default value
 */
function withDefault(schema, defaultValue) {
    return schema.default(defaultValue);
}
/**
 * Create a branded type schema
 */
function brand(schema, _brand) {
    return schema.brand();
}
/**
 * Create a readonly version of a schema
 */
function readonly(schema) {
    return schema.readonly();
}
/**
 * Create a lazy-evaluated schema
 */
function defer(schemaFn) {
    return (0, lazy_1.lazy)(schemaFn);
}
/**
 * Create a schema that validates against multiple schemas
 * and returns the first successful result
 */
function firstOf(...schemas) {
    if (schemas.length === 0) {
        throw new Error('At least one schema is required');
    }
    return (0, union_1.union)(schemas);
}
/**
 * Create a schema that validates all items in a tuple
 */
function allOf(...schemas) {
    return and(...schemas);
}
/**
 * Extend an object schema with additional properties
 */
function extend(baseSchema, extension) {
    return baseSchema.extend(extension);
}
/**
 * Pick specific properties from an object schema
 */
function pick(schema, keys) {
    return schema.pick(keys);
}
/**
 * Omit specific properties from an object schema
 */
function omit(schema, keys) {
    return schema.omit(keys);
}
/**
 * Make all properties of an object schema optional
 */
function partial(schema) {
    return schema.partial();
}
/**
 * Make all properties of an object schema required
 */
function required(schema) {
    return schema.required();
}
/**
 * Create a deep partial version of an object schema
 */
function deepPartial(schema) {
    return schema.deepPartial();
}
//# sourceMappingURL=composition.js.map