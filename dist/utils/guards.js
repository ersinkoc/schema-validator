"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuard = createGuard;
exports.createAssert = createAssert;
exports.is = is;
exports.assert = assert;
exports.isSchema = isSchema;
exports.createDiscriminatedUnionGuard = createDiscriminatedUnionGuard;
exports.createUnionGuard = createUnionGuard;
exports.createIntersectionGuard = createIntersectionGuard;
exports.narrow = narrow;
/**
 * Type guard utilities for runtime type checking
 */
/**
 * Create a type guard function from a schema
 */
function createGuard(schema) {
    return (value) => {
        const result = schema.safeParse(value);
        return result.success;
    };
}
/**
 * Create an assertion function from a schema
 */
function createAssert(schema) {
    return (value) => {
        const result = schema.safeParse(value);
        if (!result.success) {
            throw result.error;
        }
    };
}
/**
 * Check if a value matches a schema
 */
function is(schema, value) {
    return schema.safeParse(value).success;
}
/**
 * Assert that a value matches a schema
 */
function assert(schema, value) {
    const result = schema.safeParse(value);
    if (!result.success) {
        throw result.error;
    }
}
/**
 * Type guard for checking if a value is a schema
 */
function isSchema(value) {
    return (value !== null &&
        typeof value === 'object' &&
        'parse' in value &&
        'safeParse' in value &&
        '_type' in value);
}
/**
 * Create a discriminated union guard
 */
function createDiscriminatedUnionGuard(discriminator, schemas) {
    return (value) => {
        if (typeof value !== 'object' || value === null) {
            return false;
        }
        const discriminatorValue = value[discriminator];
        if (typeof discriminatorValue !== 'string') {
            return false;
        }
        const schema = schemas[discriminatorValue];
        if (!schema) {
            return false;
        }
        return schema.safeParse(value).success;
    };
}
/**
 * Create a union type guard
 */
function createUnionGuard(schemas) {
    return (value) => {
        for (const schema of schemas) {
            if (schema.safeParse(value).success) {
                return true;
            }
        }
        return false;
    };
}
/**
 * Create an intersection type guard
 */
function createIntersectionGuard(schemas) {
    return (value) => {
        for (const schema of schemas) {
            if (!schema.safeParse(value).success) {
                return false;
            }
        }
        return true;
    };
}
/**
 * Narrow a union type based on a discriminator
 */
function narrow(value, discriminator, discriminatorValue) {
    return value[discriminator] === discriminatorValue;
}
//# sourceMappingURL=guards.js.map