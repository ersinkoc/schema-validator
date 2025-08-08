"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.introspect = introspect;
exports.getShape = getShape;
exports.getElement = getElement;
exports.getOptions = getOptions;
exports.hasModifier = hasModifier;
exports.getPropertyNames = getPropertyNames;
exports.getProperty = getProperty;
exports.isType = isType;
exports.walkSchema = walkSchema;
exports.toJsonSchema = toJsonSchema;
const object_1 = require("../schemas/complex/object");
const array_1 = require("../schemas/complex/array");
const union_1 = require("../schemas/complex/union");
/**
 * Get detailed information about a schema
 */
function introspect(schema) {
    const info = {
        type: schema._type,
        optional: schema.isOptional?.() || false,
        nullable: schema.isNullable?.() || false,
    };
    // Add description if available
    if (schema._description) {
        info.description = schema._description;
    }
    // Handle object schemas
    if (schema instanceof object_1.ObjectSchema) {
        info.properties = {};
        const shape = schema._shape;
        for (const [key, value] of Object.entries(shape)) {
            info.properties[key] = introspect(value);
        }
    }
    // Handle array schemas
    if (schema instanceof array_1.ArraySchema) {
        const element = schema._element;
        if (element) {
            info.items = introspect(element);
        }
    }
    // Handle union schemas
    if (schema instanceof union_1.UnionSchema) {
        const options = schema._unionOptions || schema._options;
        if (options && Array.isArray(options)) {
            info.options = options.map((opt) => introspect(opt));
        }
    }
    // Extract constraints for primitive types
    const constraints = {};
    // Check for _checks array (used by string, number, etc.)
    if (schema._checks && Array.isArray(schema._checks)) {
        const checks = schema._checks;
        for (const check of checks) {
            if (check.kind === 'min') {
                if (schema._type === 'string') {
                    constraints['minLength'] = check.value;
                }
                else if (schema._type === 'array') {
                    constraints['minItems'] = check.value;
                }
                else {
                    constraints['min'] = check.value;
                }
            }
            else if (check.kind === 'max') {
                if (schema._type === 'string') {
                    constraints['maxLength'] = check.value;
                }
                else if (schema._type === 'array') {
                    constraints['maxItems'] = check.value;
                }
                else {
                    constraints['max'] = check.value;
                }
            }
            else if (check.kind === 'length') {
                constraints['length'] = check.value;
            }
            else if (check.kind === 'int') {
                constraints['integer'] = true;
            }
            else if (check.kind === 'regex') {
                constraints['pattern'] = check.regex.toString();
            }
            else if (check.kind === 'email') {
                constraints['format'] = 'email';
            }
            else if (check.kind === 'url') {
                constraints['format'] = 'url';
            }
            else if (check.kind === 'uuid') {
                constraints['format'] = 'uuid';
            }
        }
    }
    // Legacy support for individual properties
    if (schema._minLength !== undefined) {
        constraints['minLength'] = schema._minLength;
    }
    if (schema._maxLength !== undefined) {
        constraints['maxLength'] = schema._maxLength;
    }
    if (schema._min !== undefined) {
        constraints['min'] = schema._min;
    }
    if (schema._max !== undefined) {
        constraints['max'] = schema._max;
    }
    if (schema._isInt) {
        constraints['integer'] = true;
    }
    if (schema._minItems !== undefined) {
        constraints['minItems'] = schema._minItems;
    }
    if (schema._maxItems !== undefined) {
        constraints['maxItems'] = schema._maxItems;
    }
    if (Object.keys(constraints).length > 0) {
        info.constraints = constraints;
    }
    return info;
}
/**
 * Get the shape of an object schema
 */
function getShape(schema) {
    return schema._shape;
}
/**
 * Get the element type of an array schema
 */
function getElement(schema) {
    return schema._element;
}
/**
 * Get the options of a union schema
 */
function getOptions(schema) {
    return schema._options;
}
/**
 * Check if a schema has a specific modifier
 */
function hasModifier(schema, modifier) {
    switch (modifier) {
        case 'optional':
            return schema.isOptional?.() || false;
        case 'nullable':
            return schema.isNullable?.() || false;
        case 'nullish':
            return schema.isNullish?.() || false;
        case 'default':
            return schema._default !== undefined;
        case 'catch':
            return schema._catch !== undefined;
        default:
            return false;
    }
}
/**
 * Get all property names from an object schema
 */
function getPropertyNames(schema) {
    const shape = schema._shape;
    return Object.keys(shape);
}
/**
 * Get a specific property schema from an object schema
 */
function getProperty(schema, key) {
    const shape = schema._shape;
    return shape[key];
}
/**
 * Check if a schema is of a specific type
 */
function isType(schema, type) {
    return schema._type === type;
}
/**
 * Walk through a schema tree and apply a visitor function
 */
function walkSchema(schema, visitor, path = []) {
    visitor(schema, path);
    // Recursively walk object properties
    if (schema instanceof object_1.ObjectSchema) {
        const shape = schema._shape;
        for (const [key, value] of Object.entries(shape)) {
            walkSchema(value, visitor, [...path, key]);
        }
    }
    // Recursively walk array elements
    if (schema instanceof array_1.ArraySchema) {
        const element = schema._element;
        if (element) {
            walkSchema(element, visitor, [...path, '[]']);
        }
    }
    // Recursively walk union options
    if (schema instanceof union_1.UnionSchema) {
        const options = schema._options;
        if (options) {
            options.forEach((opt, index) => {
                walkSchema(opt, visitor, [...path, `|${index}`]);
            });
        }
    }
}
/**
 * Generate a JSON Schema from a validator schema
 */
function toJsonSchema(schema) {
    const jsonSchema = {};
    // Handle object schemas directly
    if (schema instanceof object_1.ObjectSchema) {
        jsonSchema.type = 'object';
        const shape = schema._shape;
        if (shape) {
            jsonSchema.properties = {};
            for (const [key, propSchema] of Object.entries(shape)) {
                jsonSchema.properties[key] = toJsonSchema(propSchema);
            }
        }
        return jsonSchema;
    }
    // Handle array schemas directly
    if (schema instanceof array_1.ArraySchema) {
        jsonSchema.type = 'array';
        const element = schema._element;
        if (element) {
            jsonSchema.items = toJsonSchema(element);
        }
        return jsonSchema;
    }
    // Handle union schemas directly
    if (schema instanceof union_1.UnionSchema) {
        const options = schema._unionOptions || schema._options;
        if (options && Array.isArray(options)) {
            jsonSchema.oneOf = options.map((opt) => toJsonSchema(opt));
        }
        return jsonSchema;
    }
    // For other schemas, use introspection
    const info = introspect(schema);
    // Map types
    switch (info.type) {
        case 'string':
            jsonSchema.type = 'string';
            break;
        case 'number':
            jsonSchema.type = info.constraints?.['integer'] ? 'integer' : 'number';
            break;
        case 'boolean':
            jsonSchema.type = 'boolean';
            break;
        case 'null':
            jsonSchema.type = 'null';
            break;
        default:
            jsonSchema.type = info.type;
    }
    // Add constraints
    if (info.constraints) {
        Object.assign(jsonSchema, info.constraints);
    }
    // Add description
    if (info.description) {
        jsonSchema.description = info.description;
    }
    // Handle optional/nullable
    if (info.nullable) {
        jsonSchema.type = [jsonSchema.type, 'null'];
    }
    return jsonSchema;
}
//# sourceMappingURL=introspection.js.map