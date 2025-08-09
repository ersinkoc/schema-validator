"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectSchema = void 0;
exports.object = object;
exports.record = record;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class ObjectSchema extends base_1.BaseSchema {
    _type = 'object';
    _shape;
    _unknownKeys = 'strip';
    _catchall;
    constructor(shape, config = {}) {
        super();
        this._shape = shape;
        if (config.strict) {
            this._unknownKeys = 'strict';
        }
        else if (config.passthrough) {
            this._unknownKeys = 'passthrough';
        }
        else if (config.strip !== false) {
            this._unknownKeys = 'strip';
        }
    }
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                expected: 'object',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const obj = input;
        const result = {};
        const processedKeys = new Set();
        // Parse defined shape properties
        for (const [key, schema] of Object.entries(this._shape)) {
            processedKeys.add(key);
            const value = obj[key];
            try {
                // Create child context for proper path tracking
                const childCtx = ctx.child(key, value);
                // Process modifiers first (like default values)
                const processedValue = schema._processModifiers ?
                    schema._processModifiers(value, childCtx) : value;
                // Skip parsing if value is undefined/null and schema allows it
                if ((processedValue === undefined && schema._isOptional) ||
                    (processedValue === null && schema._isNullable)) {
                    if (processedValue !== undefined) {
                        result[key] = processedValue;
                    }
                    continue;
                }
                // Parse with the child context
                const parsed = schema._parse(processedValue, childCtx);
                // Only add to result if not undefined or if schema allows undefined
                if (parsed !== undefined || schema._isOptional) {
                    result[key] = parsed;
                }
            }
            catch (error) {
                // Continue parsing other fields to collect all errors
                // The error has already been added to the context
            }
        }
        // Handle unknown keys
        const unknownKeys = [];
        for (const key in obj) {
            if (!processedKeys.has(key)) {
                unknownKeys.push(key);
            }
        }
        if (unknownKeys.length > 0) {
            if (this._unknownKeys === 'strict') {
                ctx.addIssue({
                    code: errors_1.ErrorCode.UNRECOGNIZED_KEYS,
                    options: { keys: unknownKeys },
                    message: `Unrecognized key(s) in object: ${unknownKeys.join(', ')}`
                });
            }
            else if (this._unknownKeys === 'passthrough') {
                for (const key of unknownKeys) {
                    result[key] = obj[key];
                }
            }
            else if (this._catchall) {
                for (const key of unknownKeys) {
                    try {
                        const childCtx = ctx.child(key, obj[key]);
                        const parsed = this._catchall._parse(obj[key], childCtx);
                        result[key] = parsed;
                    }
                    catch (error) {
                        // Continue parsing other fields to collect all errors
                    }
                }
            }
            // For 'strip' mode, we simply ignore unknown keys (default behavior)
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        // Run any refine checks from BaseSchema
        if (this._checks && this._checks.length > 0) {
            for (const check of this._checks) {
                const checkResult = check(result, ctx);
                // Handle both sync and async checks
                if (checkResult && typeof checkResult.then === 'function') {
                    // If it's a promise in sync context, we can't await it
                    // This shouldn't happen in properly designed code
                    throw new Error('Async refinement in sync parse');
                }
                if (ctx.hasIssues) {
                    throw ctx.makeError();
                }
            }
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                expected: 'object',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const obj = input;
        const result = {};
        const processedKeys = new Set();
        const promises = [];
        // Parse defined shape properties
        for (const [key, schema] of Object.entries(this._shape)) {
            processedKeys.add(key);
            const value = obj[key];
            promises.push((async () => {
                try {
                    // Create child context for proper path tracking
                    const childCtx = ctx.child(key, value);
                    // Process modifiers first (like default values)
                    const processedValue = schema._processModifiers ?
                        schema._processModifiers(value, childCtx) : value;
                    // Parse with the child context
                    const parsed = await schema._parseAsync(processedValue, childCtx);
                    // Only add to result if not undefined or if schema allows undefined
                    if (parsed !== undefined || schema.isOptional()) {
                        return [key, parsed];
                    }
                    return null;
                }
                catch (error) {
                    // Errors are already added to context with proper paths
                    return null;
                }
            })());
        }
        const results = await Promise.allSettled(promises);
        for (let i = 0; i < results.length; i++) {
            const res = results[i];
            if (res && res.status === 'fulfilled' && res.value !== null) {
                const [key, value] = res.value;
                result[key] = value;
            }
        }
        // Handle unknown keys
        const unknownKeys = [];
        for (const key in obj) {
            if (!processedKeys.has(key)) {
                unknownKeys.push(key);
            }
        }
        if (unknownKeys.length > 0) {
            if (this._unknownKeys === 'strict') {
                ctx.addIssue({
                    code: errors_1.ErrorCode.UNRECOGNIZED_KEYS,
                    options: { keys: unknownKeys },
                    message: `Unrecognized key(s) in object: ${unknownKeys.join(', ')}`
                });
            }
            else if (this._unknownKeys === 'passthrough') {
                for (const key of unknownKeys) {
                    result[key] = obj[key];
                }
            }
            else if (this._catchall) {
                const catchallPromises = unknownKeys.map(async (key) => {
                    const childCtx = ctx.child(key, obj[key]);
                    try {
                        const parsed = await this._catchall._parseAsync(obj[key], childCtx);
                        return [key, parsed];
                    }
                    catch (error) {
                        return [key, undefined];
                    }
                });
                const catchallResults = await Promise.allSettled(catchallPromises);
                for (const res of catchallResults) {
                    if (res.status === 'fulfilled' && res.value[1] !== undefined) {
                        const [key, value] = res.value;
                        result[key] = value;
                    }
                }
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        // Run any refine checks from BaseSchema
        if (this._checks && this._checks.length > 0) {
            for (const check of this._checks) {
                await check(result, ctx);
                if (ctx.hasIssues) {
                    throw ctx.makeError();
                }
            }
        }
        return result;
    }
    // Fluent API methods
    /**
     * Enable strict mode - unknown keys will cause validation to fail
     */
    strict() {
        const schema = Object.create(this);
        schema._unknownKeys = 'strict';
        return schema;
    }
    /**
     * Enable passthrough mode - unknown keys will be passed through to output
     */
    passthrough() {
        const schema = Object.create(this);
        schema._unknownKeys = 'passthrough';
        return schema;
    }
    /**
     * Enable strip mode - unknown keys will be silently removed (default)
     */
    strip() {
        const schema = Object.create(this);
        schema._unknownKeys = 'strip';
        return schema;
    }
    /**
     * Set a catchall schema for unknown keys
     */
    catchall(schema) {
        const newSchema = Object.create(this);
        newSchema._catchall = schema;
        return newSchema;
    }
    /**
     * Pick specific keys from the shape
     */
    pick(keys) {
        const newShape = {};
        for (const key of keys) {
            if (key in this._shape) {
                newShape[key] = this._shape[key];
            }
        }
        return new ObjectSchema(newShape);
    }
    /**
     * Omit specific keys from the shape
     */
    omit(keys) {
        const keySet = new Set(keys);
        const newShape = {};
        for (const [key, schema] of Object.entries(this._shape)) {
            if (!keySet.has(key)) {
                newShape[key] = schema;
            }
        }
        return new ObjectSchema(newShape);
    }
    /**
     * Make properties optional - all or specific keys
     */
    partial(keys) {
        if (!keys) {
            // Make all properties optional
            const newShape = {};
            for (const [key, schema] of Object.entries(this._shape)) {
                newShape[key] = schema.optional();
            }
            return new ObjectSchema(newShape);
        }
        else {
            // Make specific properties optional
            const keySet = new Set(keys);
            const newShape = {};
            for (const [key, schema] of Object.entries(this._shape)) {
                if (keySet.has(key)) {
                    newShape[key] = schema.optional();
                }
                else {
                    newShape[key] = schema;
                }
            }
            return new ObjectSchema(newShape);
        }
    }
    /**
     * Make properties required - all or specific keys
     */
    required(keys) {
        if (!keys) {
            // Make all properties required
            const newShape = {};
            for (const [key, schema] of Object.entries(this._shape)) {
                // Create a schema that doesn't accept undefined
                newShape[key] = schema; // This is simplified - would need more complex implementation
            }
            return new ObjectSchema(newShape);
        }
        else {
            // Make specific properties required
            const keySet = new Set(keys);
            const newShape = {};
            for (const [key, schema] of Object.entries(this._shape)) {
                if (keySet.has(key)) {
                    // Create a schema that doesn't accept undefined - simplified
                    newShape[key] = schema;
                }
                else {
                    newShape[key] = schema;
                }
            }
            return new ObjectSchema(newShape);
        }
    }
    /**
     * Merge with another object schema
     */
    merge(other) {
        const mergedShape = { ...this._shape, ...other._shape };
        return new ObjectSchema(mergedShape);
    }
    /**
     * Extend with additional properties
     */
    extend(extension) {
        const extendedShape = { ...this._shape, ...extension };
        return new ObjectSchema(extendedShape);
    }
    /**
     * Get union type of all keys
     */
    keyof() {
        // This would need a proper literal union schema implementation
        // For now, return a simplified version
        return {
            _input: {},
            _output: {},
            _type: 'literal',
            parse: (data) => {
                if (typeof data === 'string' && data in this._shape) {
                    return data;
                }
                throw new Error(`Invalid key: ${data}`);
            },
            parseAsync: async (data) => {
                return this.keyof().parse(data);
            }
        };
    }
    /**
     * Make object deeply partial
     */
    deepPartial() {
        const newShape = {};
        for (const [key, schema] of Object.entries(this._shape)) {
            // This is a simplified implementation
            // A full implementation would need to recursively apply deepPartial
            newShape[key] = schema.optional();
        }
        return new ObjectSchema(newShape);
    }
    /**
     * Get the shape of the object
     */
    get shape() {
        return this._shape;
    }
    /**
     * Get a specific property schema
     */
    get(key) {
        return this._shape[key];
    }
}
exports.ObjectSchema = ObjectSchema;
/**
 * Create an object schema
 */
function object(shape) {
    return new ObjectSchema(shape);
}
/**
 * Create a record schema (object with dynamic keys)
 */
function record(keySchema, valueSchema) {
    return {
        _input: {},
        _output: {},
        _type: 'record',
        parse: (data) => {
            if (typeof data !== 'object' || data === null) {
                throw new Error('Expected object');
            }
            const result = {};
            const obj = data;
            for (const [key, value] of Object.entries(obj)) {
                const parsedKey = keySchema.parse(key);
                const parsedValue = valueSchema.parse(value);
                result[parsedKey] = parsedValue;
            }
            return result;
        },
        parseAsync: async (data) => {
            if (typeof data !== 'object' || data === null) {
                throw new Error('Expected object');
            }
            const result = {};
            const obj = data;
            for (const [key, value] of Object.entries(obj)) {
                const parsedKey = await keySchema.parseAsync(key);
                const parsedValue = await valueSchema.parseAsync(value);
                result[parsedKey] = parsedValue;
            }
            return result;
        }
    };
}
//# sourceMappingURL=object.js.map