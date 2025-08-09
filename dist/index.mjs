var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_TYPE"] = "invalid_type";
    ErrorCode["INVALID_LITERAL"] = "invalid_literal";
    ErrorCode["CUSTOM"] = "custom";
    ErrorCode["INVALID_UNION"] = "invalid_union";
    ErrorCode["INVALID_UNION_DISCRIMINATOR"] = "invalid_union_discriminator";
    ErrorCode["INVALID_ENUM_VALUE"] = "invalid_enum_value";
    ErrorCode["UNRECOGNIZED_KEYS"] = "unrecognized_keys";
    ErrorCode["INVALID_ARGUMENTS"] = "invalid_arguments";
    ErrorCode["INVALID_RETURN_TYPE"] = "invalid_return_type";
    ErrorCode["INVALID_DATE"] = "invalid_date";
    ErrorCode["INVALID_STRING"] = "invalid_string";
    ErrorCode["TOO_SMALL"] = "too_small";
    ErrorCode["TOO_BIG"] = "too_big";
    ErrorCode["INVALID_INTERSECTION_TYPES"] = "invalid_intersection_types";
    ErrorCode["NOT_MULTIPLE_OF"] = "not_multiple_of";
    ErrorCode["NOT_FINITE"] = "not_finite";
    ErrorCode["INVALID_REGEX"] = "invalid_regex";
    ErrorCode["INVALID_EMAIL"] = "invalid_email";
    ErrorCode["INVALID_URL"] = "invalid_url";
    ErrorCode["INVALID_UUID"] = "invalid_uuid";
    ErrorCode["INVALID_CUID"] = "invalid_cuid";
    ErrorCode["INVALID_DATETIME"] = "invalid_datetime";
    ErrorCode["INVALID_IP"] = "invalid_ip";
    ErrorCode["INVALID_JSON"] = "invalid_json";
    ErrorCode["INVALID_BASE64"] = "invalid_base64";
    ErrorCode["REQUIRED"] = "required";
})(ErrorCode || (ErrorCode = {}));
const defaultErrorMap = (ctx) => {
    switch (ctx.code) {
        case ErrorCode.INVALID_TYPE:
            return `Expected ${ctx.expected}, received ${ctx.received}`;
        case ErrorCode.INVALID_LITERAL:
            return `Invalid literal value, expected ${JSON.stringify(ctx.expected)}`;
        case ErrorCode.UNRECOGNIZED_KEYS:
            return `Unrecognized key(s) in object: ${ctx.options?.['keys']?.join(', ')}`;
        case ErrorCode.INVALID_UNION:
            return 'Invalid input';
        case ErrorCode.INVALID_UNION_DISCRIMINATOR:
            return `Invalid discriminator value. Expected ${ctx.options?.['expected']?.join(' | ')}`;
        case ErrorCode.INVALID_ENUM_VALUE:
            return `Invalid enum value. Expected ${ctx.options?.['expected']?.join(' | ')}, received '${ctx.received}'`;
        case ErrorCode.INVALID_ARGUMENTS:
            return 'Invalid function arguments';
        case ErrorCode.INVALID_RETURN_TYPE:
            return 'Invalid function return type';
        case ErrorCode.INVALID_DATE:
            return 'Invalid date';
        case ErrorCode.INVALID_STRING:
            return ctx.message || 'Invalid string';
        case ErrorCode.TOO_SMALL:
            if (ctx.options?.['type'] === 'array') {
                return `Array must contain ${ctx.options['inclusive'] ? 'at least' : 'more than'} ${ctx.options['minimum']} element(s)`;
            }
            else if (ctx.options?.['type'] === 'string') {
                return `String must contain ${ctx.options['inclusive'] ? 'at least' : 'more than'} ${ctx.options['minimum']} character(s)`;
            }
            else if (ctx.options?.['type'] === 'number') {
                return `Number must be ${ctx.options['inclusive'] ? 'greater than or equal to' : 'greater than'} ${ctx.options['minimum']}`;
            }
            else if (ctx.options?.['type'] === 'date') {
                return `Date must be ${ctx.options['inclusive'] ? 'greater than or equal to' : 'greater than'} ${new Date(ctx.options['minimum']).toISOString()}`;
            }
            else {
                return 'Too small';
            }
        case ErrorCode.TOO_BIG:
            if (ctx.options?.['type'] === 'array') {
                return `Array must contain ${ctx.options['inclusive'] ? 'at most' : 'less than'} ${ctx.options['maximum']} element(s)`;
            }
            else if (ctx.options?.['type'] === 'string') {
                return `String must contain ${ctx.options['inclusive'] ? 'at most' : 'less than'} ${ctx.options['maximum']} character(s)`;
            }
            else if (ctx.options?.['type'] === 'number') {
                return `Number must be ${ctx.options['inclusive'] ? 'less than or equal to' : 'less than'} ${ctx.options['maximum']}`;
            }
            else if (ctx.options?.['type'] === 'date') {
                return `Date must be ${ctx.options['inclusive'] ? 'less than or equal to' : 'less than'} ${new Date(ctx.options['maximum']).toISOString()}`;
            }
            else {
                return 'Too big';
            }
        case ErrorCode.NOT_MULTIPLE_OF:
            return `Number must be a multiple of ${ctx.options?.['multipleOf']}`;
        case ErrorCode.NOT_FINITE:
            return 'Number must be finite';
        case ErrorCode.INVALID_REGEX:
            return 'Invalid regular expression';
        case ErrorCode.INVALID_EMAIL:
            return 'Invalid email';
        case ErrorCode.INVALID_URL:
            return 'Invalid URL';
        case ErrorCode.INVALID_UUID:
            return 'Invalid UUID';
        case ErrorCode.INVALID_CUID:
            return 'Invalid CUID';
        case ErrorCode.INVALID_DATETIME:
            return 'Invalid datetime string';
        case ErrorCode.INVALID_IP:
            return `Invalid IP address (version ${ctx.options?.['version'] || 'unknown'})`;
        case ErrorCode.INVALID_JSON:
            return 'Invalid JSON';
        case ErrorCode.INVALID_BASE64:
            return 'Invalid base64 string';
        case ErrorCode.REQUIRED:
            return 'Required';
        case ErrorCode.CUSTOM:
        default:
            return ctx.message || 'Invalid input';
    }
};
function getParsedType(data) {
    const type = typeof data;
    switch (type) {
        case 'undefined':
            return 'undefined';
        case 'string':
            return 'string';
        case 'number':
            return isNaN(data) ? 'unknown' : 'number';
        case 'boolean':
            return 'boolean';
        case 'function':
            return 'function';
        case 'bigint':
            return 'bigint';
        case 'symbol':
            return 'symbol';
        case 'object':
            if (data === null) {
                return 'null';
            }
            if (Array.isArray(data)) {
                return 'array';
            }
            if (data instanceof Date) {
                return 'date';
            }
            if (data instanceof Map) {
                return 'map';
            }
            if (data instanceof Set) {
                return 'set';
            }
            if (data instanceof Promise) {
                return 'promise';
            }
            return 'object';
        default:
            return 'unknown';
    }
}

class ValidationError extends Error {
    issues;
    path;
    code;
    expected;
    received;
    constructor(issues) {
        const issuesArray = Array.isArray(issues) ? issues : [issues];
        const firstIssue = issuesArray[0];
        super(firstIssue?.message || 'Validation error');
        this.name = 'ValidationError';
        this.issues = issuesArray;
        this.path = firstIssue?.path || [];
        this.code = firstIssue?.code || 'validation_error';
        this.expected = firstIssue?.expected;
        this.received = firstIssue?.received;
    }
    format() {
        return this.issues
            .map(issue => {
            const pathStr = issue.path.length > 0 ? `[${issue.path.join('.')}] ` : '';
            return `${pathStr}${issue.message}`;
        })
            .join('\n');
    }
}
const brand$1 = Symbol('brand');
class BaseSchema {
    _input;
    _output;
    _options;
    _checks = [];
    _transforms = [];
    _isOptional = false;
    _isNullable = false;
    _default;
    _catch;
    _description;
    constructor(options = {}) {
        this._options = options;
    }
    _processModifiers(data, _ctx) {
        // Handle optional
        if (this._isOptional && data === undefined) {
            if (this._default !== undefined) {
                return typeof this._default === 'function' ? this._default() : this._default;
            }
            return undefined;
        }
        // Handle nullable
        if (this._isNullable && data === null) {
            return null;
        }
        // Handle default for undefined values
        if (data === undefined && this._default !== undefined) {
            return typeof this._default === 'function' ? this._default() : this._default;
        }
        return data;
    }
    parse(data) {
        const result = this.safeParse(data);
        if (!result.success) {
            throw result.error;
        }
        return result.data;
    }
    async parseAsync(data) {
        const result = await this.safeParseAsync(data);
        if (!result.success) {
            throw result.error;
        }
        return result.data;
    }
    safeParse(data) {
        try {
            // Create a minimal context inline to avoid circular dependency
            const issues = [];
            const ctx = {
                addIssue: (issue) => {
                    issues.push({ ...issue, path: ctx.path });
                },
                path: [],
                data,
                parsedType: getParsedType(data),
                common: { issues, async: false },
                hasIssues: false,
                makeError: () => new ValidationError(issues),
                child: (key, childData) => {
                    const childCtx = Object.create(ctx);
                    childCtx.path = [...ctx.path, key];
                    childCtx.data = childData;
                    childCtx.parsedType = getParsedType(childData);
                    // Override addIssue to use the child's path
                    childCtx.addIssue = (issue) => {
                        issues.push({ ...issue, path: childCtx.path });
                    };
                    return childCtx;
                },
                clone: (cloneData, clonePath) => {
                    const clonedCtx = Object.create(ctx);
                    clonedCtx.data = cloneData !== undefined ? cloneData : ctx.data;
                    clonedCtx.path = clonePath !== undefined ? clonePath : ctx.path;
                    clonedCtx.parsedType = getParsedType(clonedCtx.data);
                    return clonedCtx;
                }
            };
            Object.defineProperty(ctx, 'hasIssues', {
                get: () => issues.length > 0
            });
            Object.defineProperty(ctx, 'issues', {
                get: () => issues
            });
            // Process modifiers first
            const processedData = this._processModifiers(data, ctx);
            // If data became undefined/null after processing and that's allowed, return it
            if ((this._isOptional && processedData === undefined) ||
                (this._isNullable && processedData === null)) {
                return { success: true, data: processedData };
            }
            const result = this._parse(processedData, ctx);
            if (ctx.hasIssues) {
                return { success: false, error: ctx.makeError() };
            }
            return { success: true, data: result };
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return { success: false, error };
            }
            return {
                success: false,
                error: new ValidationError({
                    code: 'custom',
                    message: error instanceof Error ? error.message : String(error),
                    path: []
                })
            };
        }
    }
    async safeParseAsync(data) {
        try {
            // Create a minimal context inline to avoid circular dependency
            const issues = [];
            const ctx = {
                addIssue: (issue) => {
                    issues.push({ ...issue, path: ctx.path });
                },
                path: [],
                data,
                parsedType: getParsedType(data),
                common: { issues, async: true },
                hasIssues: false,
                makeError: () => new ValidationError(issues),
                child: (key, childData) => {
                    const childCtx = Object.create(ctx);
                    childCtx.path = [...ctx.path, key];
                    childCtx.data = childData;
                    childCtx.parsedType = getParsedType(childData);
                    // Override addIssue to use the child's path
                    childCtx.addIssue = (issue) => {
                        issues.push({ ...issue, path: childCtx.path });
                    };
                    return childCtx;
                },
                clone: (cloneData, clonePath) => {
                    const clonedCtx = Object.create(ctx);
                    clonedCtx.data = cloneData !== undefined ? cloneData : ctx.data;
                    clonedCtx.path = clonePath !== undefined ? clonePath : ctx.path;
                    clonedCtx.parsedType = getParsedType(clonedCtx.data);
                    return clonedCtx;
                }
            };
            Object.defineProperty(ctx, 'hasIssues', {
                get: () => issues.length > 0
            });
            Object.defineProperty(ctx, 'issues', {
                get: () => issues
            });
            // Process modifiers first
            const processedData = this._processModifiers(data, ctx);
            // If data became undefined/null after processing and that's allowed, return it
            if ((this._isOptional && processedData === undefined) ||
                (this._isNullable && processedData === null)) {
                return { success: true, data: processedData };
            }
            const result = await this._parseAsync(processedData, ctx);
            if (ctx.hasIssues) {
                return { success: false, error: ctx.makeError() };
            }
            return { success: true, data: result };
        }
        catch (error) {
            if (error instanceof ValidationError) {
                return { success: false, error };
            }
            return {
                success: false,
                error: new ValidationError({
                    code: 'custom',
                    message: error instanceof Error ? error.message : String(error),
                    path: []
                })
            };
        }
    }
    optional() {
        const OptionalSchema = Object.create(this);
        OptionalSchema._isOptional = true;
        return OptionalSchema;
    }
    nullable() {
        const NullableSchema = Object.create(this);
        NullableSchema._isNullable = true;
        return NullableSchema;
    }
    nullish() {
        const NullishSchema = Object.create(this);
        NullishSchema._isOptional = true;
        NullishSchema._isNullable = true;
        return NullishSchema;
    }
    array() {
        const ArraySchema = require('../schemas/complex/array').array(this);
        return ArraySchema;
    }
    promise() {
        const PromiseSchema = require('../schemas/complex/promise').promise(this);
        return PromiseSchema;
    }
    or(schema) {
        const UnionSchema = require('../schemas/complex/union').union([this, schema]);
        return UnionSchema;
    }
    and(schema) {
        const IntersectionSchema = require('../schemas/complex/intersection').intersection(this, schema);
        return IntersectionSchema;
    }
    transform(fn) {
        const TransformSchema = Object.create(this);
        TransformSchema._transforms = [...this._transforms, fn];
        return TransformSchema;
    }
    default(value) {
        const DefaultSchema = Object.create(this);
        DefaultSchema._default = value;
        DefaultSchema._isOptional = true;
        return DefaultSchema;
    }
    catch(value) {
        const CatchSchema = Object.create(this);
        CatchSchema._catch = value;
        return CatchSchema;
    }
    refine(check, message) {
        const RefinedSchema = Object.create(this);
        RefinedSchema._checks = [
            ...this._checks,
            (value, ctx) => {
                const result = check(value);
                // If result is a promise, return it for async parsing
                if (result && typeof result.then === 'function') {
                    return result.then((res) => {
                        if (!res) {
                            const issue = typeof message === 'string'
                                ? { code: 'custom', message }
                                : message || { code: 'custom', message: 'Refinement check failed' };
                            ctx.addIssue(issue);
                        }
                    });
                }
                // Sync result
                if (!result) {
                    const issue = typeof message === 'string'
                        ? { code: 'custom', message }
                        : message || { code: 'custom', message: 'Refinement check failed' };
                    ctx.addIssue(issue);
                }
                return;
            }
        ];
        return RefinedSchema;
    }
    superRefine(check) {
        const RefinedSchema = Object.create(this);
        RefinedSchema._checks = [
            ...this._checks,
            (value, ctx) => check(value, ctx)
        ];
        return RefinedSchema;
    }
    describe(description) {
        const DescribedSchema = Object.create(this);
        DescribedSchema._description = description;
        return DescribedSchema;
    }
    brand() {
        return this;
    }
    readonly() {
        return this;
    }
    isOptional() {
        return this._isOptional;
    }
    isNullable() {
        return this._isNullable;
    }
    isNullish() {
        return this._isOptional && this._isNullable;
    }
}

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

var guards = /*#__PURE__*/Object.freeze({
    __proto__: null,
    assert: assert,
    createAssert: createAssert,
    createDiscriminatedUnionGuard: createDiscriminatedUnionGuard,
    createGuard: createGuard,
    createIntersectionGuard: createIntersectionGuard,
    createUnionGuard: createUnionGuard,
    is: is,
    isSchema: isSchema,
    narrow: narrow
});

class ObjectSchema extends BaseSchema {
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
        const parsedType = getParsedType(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
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
                    code: ErrorCode.UNRECOGNIZED_KEYS,
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
        const parsedType = getParsedType(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
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
                    code: ErrorCode.UNRECOGNIZED_KEYS,
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
/**
 * Create an object schema
 */
function object(shape) {
    return new ObjectSchema(shape);
}

class ArraySchema extends BaseSchema {
    _type = 'array';
    _element;
    _checks = [];
    constructor(element) {
        super();
        this._element = element;
    }
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'array') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected array, received ${parsedType}`,
                expected: 'array',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const arr = input;
        for (const check of this._checks) {
            switch (check.kind) {
                case 'min':
                    if (arr.length < check.value) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_SMALL,
                            message: check.message || 'Array validation failed',
                            options: {
                                type: 'array',
                                minimum: check.value,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'max':
                    if (arr.length > check.value) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_BIG,
                            message: check.message || 'Array validation failed',
                            options: {
                                type: 'array',
                                maximum: check.value,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'length':
                    if (arr.length !== check.value) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_TYPE,
                            message: check.message || `Array must have exactly ${check.value} elements`,
                            expected: `array of length ${check.value}`,
                            received: `array of length ${arr.length}`
                        });
                    }
                    break;
                case 'nonempty':
                    if (arr.length === 0) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_SMALL,
                            message: check.message || 'Array must not be empty',
                            options: {
                                type: 'array',
                                minimum: 1,
                                inclusive: true
                            }
                        });
                    }
                    break;
            }
        }
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            try {
                const childCtx = ctx.child(i, arr[i]);
                const parsed = this._element._parse(arr[i], childCtx);
                result.push(parsed);
            }
            catch (error) {
                if (!ctx.common.async) {
                    throw ctx.makeError();
                }
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'array') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected array, received ${parsedType}`,
                expected: 'array',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const arr = input;
        for (const check of this._checks) {
            switch (check.kind) {
                case 'min':
                    if (arr.length < check.value) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_SMALL,
                            message: check.message || 'Array validation failed',
                            options: {
                                type: 'array',
                                minimum: check.value,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'max':
                    if (arr.length > check.value) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_BIG,
                            message: check.message || 'Array validation failed',
                            options: {
                                type: 'array',
                                maximum: check.value,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'length':
                    if (arr.length !== check.value) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_TYPE,
                            message: check.message || `Array must have exactly ${check.value} elements`,
                            expected: `array of length ${check.value}`,
                            received: `array of length ${arr.length}`
                        });
                    }
                    break;
                case 'nonempty':
                    if (arr.length === 0) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_SMALL,
                            message: check.message || 'Array must not be empty',
                            options: {
                                type: 'array',
                                minimum: 1,
                                inclusive: true
                            }
                        });
                    }
                    break;
            }
        }
        const result = [];
        const promises = [];
        for (let i = 0; i < arr.length; i++) {
            const childCtx = ctx.child(i, arr[i]);
            promises.push(this._element._parseAsync(arr[i], childCtx));
        }
        const results = await Promise.allSettled(promises);
        for (const res of results) {
            if (res.status === 'fulfilled') {
                result.push(res.value);
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    min(length, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'min', value: length, message }];
        return schema;
    }
    max(length, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'max', value: length, message }];
        return schema;
    }
    length(length, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'length', value: length, message }];
        return schema;
    }
    nonempty(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'nonempty', message }];
        return schema;
    }
    get element() {
        return this._element;
    }
}
function array(element) {
    return new ArraySchema(element);
}

class UnionSchema extends BaseSchema {
    _type = 'union';
    _unionOptions;
    constructor(options) {
        super();
        this._unionOptions = options;
    }
    _parse(input, ctx) {
        const issues = [];
        for (const option of this._unionOptions) {
            const result = option.safeParse(input);
            if (result.success) {
                return result.data;
            }
            else {
                issues.push({
                    schema: option,
                    issues: result.error.issues
                });
            }
        }
        ctx.addIssue({
            code: ErrorCode.INVALID_UNION,
            message: `Invalid union: no matching option`,
            options: {
                unionErrors: issues
            }
        });
        throw ctx.makeError();
    }
    async _parseAsync(input, ctx) {
        const issues = [];
        for (const option of this._unionOptions) {
            const result = await option.safeParseAsync(input);
            if (result.success) {
                return result.data;
            }
            else {
                issues.push({
                    schema: option,
                    issues: result.error.issues
                });
            }
        }
        ctx.addIssue({
            code: ErrorCode.INVALID_UNION,
            message: `Invalid union: no matching option`,
            options: {
                unionErrors: issues
            }
        });
        throw ctx.makeError();
    }
    get options() {
        return this._unionOptions;
    }
}
function union(options) {
    return new UnionSchema(options);
}

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
    if (schema instanceof ObjectSchema) {
        info.properties = {};
        const shape = schema._shape;
        for (const [key, value] of Object.entries(shape)) {
            info.properties[key] = introspect(value);
        }
    }
    // Handle array schemas
    if (schema instanceof ArraySchema) {
        const element = schema._element;
        if (element) {
            info.items = introspect(element);
        }
    }
    // Handle union schemas
    if (schema instanceof UnionSchema) {
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
                const regexValue = check.regex || check.value;
                constraints['pattern'] = regexValue ? regexValue.toString() : '';
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
    return schema._unionOptions || schema._options || [];
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
    if (schema instanceof ObjectSchema) {
        const shape = schema._shape;
        for (const [key, value] of Object.entries(shape)) {
            walkSchema(value, visitor, [...path, key]);
        }
    }
    // Recursively walk array elements
    if (schema instanceof ArraySchema) {
        const element = schema._element;
        if (element) {
            walkSchema(element, visitor, [...path, '[]']);
        }
    }
    // Recursively walk union options
    if (schema instanceof UnionSchema) {
        const options = schema._unionOptions || schema._options;
        if (options && Array.isArray(options)) {
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
    if (schema instanceof ObjectSchema) {
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
    if (schema instanceof ArraySchema) {
        jsonSchema.type = 'array';
        const element = schema._element;
        if (element) {
            jsonSchema.items = toJsonSchema(element);
        }
        return jsonSchema;
    }
    // Handle union schemas directly
    if (schema instanceof UnionSchema) {
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

var introspection = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getElement: getElement,
    getOptions: getOptions,
    getProperty: getProperty,
    getPropertyNames: getPropertyNames,
    getShape: getShape,
    hasModifier: hasModifier,
    introspect: introspect,
    isType: isType,
    toJsonSchema: toJsonSchema,
    walkSchema: walkSchema
});

/**
 * Format a validation error as a human-readable string
 */
function formatError(error, options = {}) {
    const { includePath = true, includeCode = false, includeTypes = true, indent = '  ', maxDepth = 10, messageFormatter, colors = false } = options;
    const lines = [];
    // Group issues by path for better organization
    const issuesByPath = new Map();
    for (const issue of error.issues) {
        const pathKey = issue.path.join('.');
        if (!issuesByPath.has(pathKey)) {
            issuesByPath.set(pathKey, []);
        }
        issuesByPath.get(pathKey).push(issue);
    }
    // Format each group
    for (const [pathKey, issues] of issuesByPath) {
        const depth = pathKey ? pathKey.split('.').length - 1 : 0;
        if (depth > maxDepth)
            continue;
        const currentIndent = indent.repeat(depth);
        for (const issue of issues) {
            let message = messageFormatter ? messageFormatter(issue) : issue.message || 'Validation error';
            if (includePath && issue.path.length > 0) {
                const pathStr = colors ? colorize(pathKey, 'cyan') : pathKey;
                message = `[${pathStr}] ${message}`;
            }
            if (includeCode) {
                const codeStr = colors ? colorize(issue.code, 'gray') : issue.code;
                message = `(${codeStr}) ${message}`;
            }
            if (includeTypes && (issue.expected || issue.received)) {
                const typeInfo = [];
                if (issue.expected) {
                    const expected = colors ? colorize(issue.expected, 'green') : issue.expected;
                    typeInfo.push(`Expected: ${expected}`);
                }
                if (issue.received) {
                    const received = colors ? colorize(issue.received, 'red') : issue.received;
                    typeInfo.push(`Received: ${received}`);
                }
                message += ` (${typeInfo.join(', ')})`;
            }
            lines.push(currentIndent + message);
        }
    }
    return lines.join('\n');
}
/**
 * Format error as JSON
 */
function formatErrorAsJson(error, pretty = false) {
    const data = {
        name: error.name,
        message: error.message,
        issues: error.issues.map(issue => ({
            code: issue.code,
            message: issue.message,
            path: issue.path,
            expected: issue.expected,
            received: issue.received,
            options: issue.options
        }))
    };
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}
/**
 * Format error as a table (for terminal output)
 */
function formatErrorAsTable(error) {
    const rows = [
        ['Path', 'Code', 'Message', 'Expected', 'Received']
    ];
    for (const issue of error.issues) {
        rows.push([
            issue.path.join('.') || 'root',
            issue.code,
            issue.message || '',
            issue.expected || '',
            issue.received || ''
        ]);
    }
    // Calculate column widths
    const firstRow = rows[0];
    if (!firstRow) {
        return '';
    }
    const widths = firstRow.map((_, colIndex) => Math.max(...rows.map(row => row[colIndex]?.length || 0)));
    // Format rows
    const formattedRows = rows.map((row) => {
        const cells = row.map((cell, colIndex) => cell.padEnd(widths[colIndex] || 0));
        return '│ ' + cells.join(' │ ') + ' │';
    });
    // Add borders
    const border = '─';
    const topBorder = '┌' + widths.map(w => border.repeat(w + 2)).join('┬') + '┐';
    const middleBorder = '├' + widths.map(w => border.repeat(w + 2)).join('┼') + '┤';
    const bottomBorder = '└' + widths.map(w => border.repeat(w + 2)).join('┴') + '┘';
    return [
        topBorder,
        formattedRows[0],
        middleBorder,
        ...formattedRows.slice(1),
        bottomBorder
    ].join('\n');
}
/**
 * Format error as Markdown
 */
function formatErrorAsMarkdown(error) {
    const lines = [
        '## Validation Error',
        '',
        error.message,
        '',
        '### Issues',
        ''
    ];
    for (const issue of error.issues) {
        const path = issue.path.length > 0 ? `\`${issue.path.join('.')}\`` : '_root_';
        lines.push(`- **${path}**: ${issue.message || 'Validation error'}`);
        if (issue.expected || issue.received) {
            const details = [];
            if (issue.expected)
                details.push(`Expected: \`${issue.expected}\``);
            if (issue.received)
                details.push(`Received: \`${issue.received}\``);
            lines.push(`  - ${details.join(', ')}`);
        }
        if (issue.code !== 'custom') {
            lines.push(`  - Code: \`${issue.code}\``);
        }
    }
    return lines.join('\n');
}
/**
 * Create a custom error formatter
 */
function createFormatter(template, variables) {
    return (issue) => {
        let result = template;
        // Replace built-in variables
        result = result.replace('{path}', issue.path.join('.'));
        result = result.replace('{code}', issue.code);
        result = result.replace('{message}', issue.message || '');
        result = result.replace('{expected}', issue.expected || '');
        result = result.replace('{received}', issue.received || '');
        // Replace custom variables
        if (variables) {
            for (const [key, fn] of Object.entries(variables)) {
                result = result.replace(`{${key}}`, fn(issue));
            }
        }
        return result;
    };
}
/**
 * Colorize text for terminal output
 */
function colorize(text, color) {
    const colors = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        gray: '\x1b[90m'
    };
    const colorCode = colors[color] || colors['reset'];
    return `${colorCode}${text}${colors['reset']}`;
}
/**
 * Get a summary of validation errors
 */
function getErrorSummary(error) {
    const issuesByCode = {};
    const affectedPaths = new Set();
    for (const issue of error.issues) {
        issuesByCode[issue.code] = (issuesByCode[issue.code] || 0) + 1;
        if (issue.path.length > 0) {
            affectedPaths.add(issue.path.join('.'));
        }
    }
    return {
        totalIssues: error.issues.length,
        issuesByCode,
        affectedPaths: Array.from(affectedPaths)
    };
}
/**
 * Filter validation issues by criteria
 */
function filterIssues(error, filter) {
    return error.issues.filter(issue => {
        if (filter.code && issue.code !== filter.code) {
            return false;
        }
        if (filter.path) {
            const issuePath = issue.path.slice(0, filter.path.length);
            if (issuePath.join('.') !== filter.path.join('.')) {
                return false;
            }
        }
        const depth = issue.path.length;
        if (filter.minDepth !== undefined && depth < filter.minDepth) {
            return false;
        }
        if (filter.maxDepth !== undefined && depth > filter.maxDepth) {
            return false;
        }
        return true;
    });
}

var errorFormatter = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createFormatter: createFormatter,
    filterIssues: filterIssues,
    formatError: formatError,
    formatErrorAsJson: formatErrorAsJson,
    formatErrorAsMarkdown: formatErrorAsMarkdown,
    formatErrorAsTable: formatErrorAsTable,
    getErrorSummary: getErrorSummary
});

class IntersectionSchema extends BaseSchema {
    _type = 'intersection';
    _left;
    _right;
    constructor(left, right) {
        super();
        this._left = left;
        this._right = right;
    }
    _parse(input, ctx) {
        const leftResult = this._left._parse(input, ctx);
        const rightResult = this._right._parse(input, ctx);
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        // Merge results
        if (typeof leftResult === 'object' && typeof rightResult === 'object' &&
            leftResult !== null && rightResult !== null &&
            !Array.isArray(leftResult) && !Array.isArray(rightResult)) {
            return { ...leftResult, ...rightResult };
        }
        return rightResult;
    }
    async _parseAsync(input, ctx) {
        const [leftResult, rightResult] = await Promise.all([
            this._left._parseAsync(input, ctx),
            this._right._parseAsync(input, ctx)
        ]);
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        // Merge results
        if (typeof leftResult === 'object' && typeof rightResult === 'object' &&
            leftResult !== null && rightResult !== null &&
            !Array.isArray(leftResult) && !Array.isArray(rightResult)) {
            return { ...leftResult, ...rightResult };
        }
        return rightResult;
    }
}
function intersection(left, right) {
    return new IntersectionSchema(left, right);
}

class LazySchema extends BaseSchema {
    _type = 'lazy';
    _getter;
    _cached;
    constructor(getter) {
        super();
        this._getter = getter;
    }
    get schema() {
        if (!this._cached) {
            this._cached = this._getter();
        }
        return this._cached;
    }
    _parse(input, ctx) {
        return this.schema._parse(input, ctx);
    }
    async _parseAsync(input, ctx) {
        return this.schema._parseAsync(input, ctx);
    }
}
function lazy(getter) {
    return new LazySchema(getter);
}

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
    return union(schemas);
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
    return schemas.reduce((acc, schema) => intersection(acc, schema));
}
/**
 * Create a conditional schema based on a discriminator
 */
function conditional(_discriminator, cases) {
    const schemas = Object.values(cases);
    if (schemas.length === 0) {
        throw new Error('At least one case is required');
    }
    return union(schemas);
}
/**
 * Create a recursive schema
 */
function recursive(definition) {
    return lazy(() => definition(recursiveSchema));
    const recursiveSchema = lazy(() => definition(recursiveSchema));
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
function pipeline$1(...schemas) {
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
function preprocess$1(preprocessor, schema) {
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
    return lazy(schemaFn);
}
/**
 * Create a schema that validates against multiple schemas
 * and returns the first successful result
 */
function firstOf(...schemas) {
    if (schemas.length === 0) {
        throw new Error('At least one schema is required');
    }
    return union(schemas);
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

var composition = /*#__PURE__*/Object.freeze({
    __proto__: null,
    allOf: allOf,
    and: and,
    brand: brand,
    coerce: coerce,
    conditional: conditional,
    deepPartial: deepPartial,
    defer: defer,
    extend: extend,
    firstOf: firstOf,
    mergeObjects: mergeObjects,
    nullable: nullable,
    nullish: nullish,
    omit: omit,
    optional: optional,
    or: or,
    partial: partial,
    pick: pick,
    pipeline: pipeline$1,
    postprocess: postprocess,
    preprocess: preprocess$1,
    readonly: readonly,
    recursive: recursive,
    required: required,
    withDefault: withDefault,
    withFallback: withFallback
});

/**
 * Schema metadata system for storing additional information
 */
const metadataStore = new WeakMap();
/**
 * Metadata keys
 */
const MetadataKeys = {
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
    setMetadata(schema, MetadataKeys.DESCRIPTION, description);
    return schema.describe(description);
}
/**
 * Add an example to a schema
 */
function example(schema, example) {
    setMetadata(schema, MetadataKeys.EXAMPLE, example);
    return schema;
}
/**
 * Mark a schema as deprecated
 */
function deprecate(schema, reason) {
    setMetadata(schema, MetadataKeys.DEPRECATED, { deprecated: true, reason });
    return schema;
}
/**
 * Add version information to a schema
 */
function version(schema, version) {
    setMetadata(schema, MetadataKeys.VERSION, version);
    return schema;
}
/**
 * Add tags to a schema
 */
function tag(schema, ...tags) {
    const existingTags = getMetadata(schema, MetadataKeys.TAGS) || [];
    setMetadata(schema, MetadataKeys.TAGS, [...existingTags, ...tags]);
    return schema;
}
/**
 * Add documentation link to a schema
 */
function document(schema, url) {
    setMetadata(schema, MetadataKeys.DOCUMENTATION, url);
    return schema;
}
/**
 * Add source information to a schema
 */
function source(schema, source) {
    setMetadata(schema, MetadataKeys.SOURCE, source);
    return schema;
}
/**
 * Add author information to a schema
 */
function author(schema, author) {
    setMetadata(schema, MetadataKeys.AUTHOR, author);
    return schema;
}
/**
 * Add creation timestamp to a schema
 */
function created(schema, date = new Date()) {
    setMetadata(schema, MetadataKeys.CREATED, date);
    return schema;
}
/**
 * Add modification timestamp to a schema
 */
function modified(schema, date = new Date()) {
    setMetadata(schema, MetadataKeys.MODIFIED, date);
    return schema;
}
/**
 * Add custom metadata to a schema
 */
function custom(schema, data) {
    const existingCustom = getMetadata(schema, MetadataKeys.CUSTOM) || {};
    setMetadata(schema, MetadataKeys.CUSTOM, { ...existingCustom, ...data });
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

var metadata = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MetadataKeys: MetadataKeys,
    author: author,
    clearMetadata: clearMetadata,
    copyMetadata: copyMetadata,
    created: created,
    custom: custom,
    deleteMetadata: deleteMetadata,
    deprecate: deprecate,
    describe: describe,
    document: document,
    example: example,
    getAllMetadata: getAllMetadata,
    getMetadata: getMetadata,
    getMetadataSummary: getMetadataSummary,
    hasMetadata: hasMetadata,
    mergeMetadata: mergeMetadata,
    modified: modified,
    setMetadata: setMetadata,
    source: source,
    tag: tag,
    version: version,
    withMetadata: withMetadata
});

class StringSchema extends BaseSchema {
    _type = 'string';
    _checks = [];
    _coerce;
    constructor(options = {}) {
        super();
        this._coerce = options.coerce || false;
    }
    _parse(input, ctx) {
        if (this._coerce) {
            input = String(input);
        }
        const parsedType = getParsedType(input);
        if (parsedType !== 'string') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected string, received ${parsedType}`,
                expected: 'string',
                received: parsedType
            });
            throw ctx.makeError();
        }
        let value = input;
        for (const check of this._checks) {
            switch (check.kind) {
                case 'trim':
                    value = value.trim();
                    break;
                case 'toLowerCase':
                    value = value.toLowerCase();
                    break;
                case 'toUpperCase':
                    value = value.toUpperCase();
                    break;
                case 'min':
                    if (value.length < check.value) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_SMALL,
                            message: check.message,
                            options: {
                                type: 'string',
                                minimum: check.value,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'max':
                    if (value.length > check.value) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_BIG,
                            message: check.message,
                            options: {
                                type: 'string',
                                maximum: check.value,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'length':
                    if (value.length !== check.value) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_STRING,
                            message: check.message || `String must be exactly ${check.value} characters`
                        });
                    }
                    break;
                case 'email':
                    if (!isValidEmail(value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_EMAIL,
                            message: check.message
                        });
                    }
                    break;
                case 'url':
                    if (!isValidUrl(value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_URL,
                            message: check.message
                        });
                    }
                    break;
                case 'uuid':
                    if (!isValidUuid(value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_UUID,
                            message: check.message
                        });
                    }
                    break;
                case 'cuid':
                    if (!isValidCuid(value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_CUID,
                            message: check.message
                        });
                    }
                    break;
                case 'regex':
                    if (!check.value.test(value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_STRING,
                            message: check.message || `String does not match pattern: ${check.value}`
                        });
                    }
                    break;
                case 'includes':
                    if (!value.includes(check.value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_STRING,
                            message: check.message || `String must include "${check.value}"`
                        });
                    }
                    break;
                case 'startsWith':
                    if (!value.startsWith(check.value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_STRING,
                            message: check.message || `String must start with "${check.value}"`
                        });
                    }
                    break;
                case 'endsWith':
                    if (!value.endsWith(check.value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_STRING,
                            message: check.message || `String must end with "${check.value}"`
                        });
                    }
                    break;
                case 'datetime':
                    if (!isValidDatetime(value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_DATETIME,
                            message: check.message
                        });
                    }
                    break;
                case 'ip':
                    const version = check.value || 'v4';
                    if (!isValidIp(value, version)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_IP,
                            message: check.message,
                            options: { version }
                        });
                    }
                    break;
                case 'base64':
                    if (!isValidBase64(value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_BASE64,
                            message: check.message
                        });
                    }
                    break;
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return value;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    min(length, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'min', value: length, message }];
        return schema;
    }
    max(length, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'max', value: length, message }];
        return schema;
    }
    length(length, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'length', value: length, message }];
        return schema;
    }
    email(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'email', message }];
        return schema;
    }
    url(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'url', message }];
        return schema;
    }
    uuid(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'uuid', message }];
        return schema;
    }
    cuid(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'cuid', message }];
        return schema;
    }
    regex(pattern, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'regex', value: pattern, message }];
        return schema;
    }
    includes(value, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'includes', value, message }];
        return schema;
    }
    startsWith(value, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'startsWith', value, message }];
        return schema;
    }
    endsWith(value, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'endsWith', value, message }];
        return schema;
    }
    datetime(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'datetime', message }];
        return schema;
    }
    ip(version, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'ip', value: version, message }];
        return schema;
    }
    base64(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'base64', message }];
        return schema;
    }
    trim() {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'trim' }];
        return schema;
    }
    toLowerCase() {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'toLowerCase' }];
        return schema;
    }
    toUpperCase() {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'toUpperCase' }];
        return schema;
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function isValidUuid(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
function isValidCuid(cuid) {
    const cuidRegex = /^c[a-z0-9]{24}$/;
    return cuidRegex.test(cuid);
}
function isValidDatetime(datetime) {
    const date = new Date(datetime);
    return !isNaN(date.getTime());
}
function isValidIp(ip, version) {
    if (version === 'v4') {
        const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(ip);
    }
    else {
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
        return ipv6Regex.test(ip);
    }
}
function isValidBase64(base64) {
    const base64Regex = /^[A-Za-z0-9+\/]*={0,2}$/;
    return base64Regex.test(base64) && base64.length % 4 === 0;
}
function string(options) {
    return new StringSchema(options);
}

class NumberSchema extends BaseSchema {
    _type = 'number';
    _checks = [];
    _coerce;
    constructor(options = {}) {
        super();
        this._coerce = options.coerce || false;
    }
    _parse(input, ctx) {
        if (this._coerce) {
            input = Number(input);
        }
        const parsedType = getParsedType(input);
        if (parsedType !== 'number') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected number, received ${parsedType}`,
                expected: 'number',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const value = input;
        if (isNaN(value)) {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: 'Expected number, received NaN',
                expected: 'number',
                received: 'nan'
            });
            throw ctx.makeError();
        }
        for (const check of this._checks) {
            switch (check.kind) {
                case 'min':
                    if (check.inclusive !== false) {
                        if (value < check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_SMALL,
                                message: check.message,
                                options: {
                                    type: 'number',
                                    minimum: check.value,
                                    inclusive: true
                                }
                            });
                        }
                    }
                    else {
                        if (value <= check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_SMALL,
                                message: check.message,
                                options: {
                                    type: 'number',
                                    minimum: check.value,
                                    inclusive: false
                                }
                            });
                        }
                    }
                    break;
                case 'max':
                    if (check.inclusive !== false) {
                        if (value > check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_BIG,
                                message: check.message,
                                options: {
                                    type: 'number',
                                    maximum: check.value,
                                    inclusive: true
                                }
                            });
                        }
                    }
                    else {
                        if (value >= check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_BIG,
                                message: check.message,
                                options: {
                                    type: 'number',
                                    maximum: check.value,
                                    inclusive: false
                                }
                            });
                        }
                    }
                    break;
                case 'int':
                    if (!Number.isInteger(value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_TYPE,
                            message: check.message || 'Expected integer, received float',
                            expected: 'integer',
                            received: 'float'
                        });
                    }
                    break;
                case 'positive':
                    if (value <= 0) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_SMALL,
                            message: check.message || 'Number must be positive',
                            options: {
                                type: 'number',
                                minimum: 0,
                                inclusive: false
                            }
                        });
                    }
                    break;
                case 'negative':
                    if (value >= 0) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_BIG,
                            message: check.message || 'Number must be negative',
                            options: {
                                type: 'number',
                                maximum: 0,
                                inclusive: false
                            }
                        });
                    }
                    break;
                case 'nonpositive':
                    if (value > 0) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_BIG,
                            message: check.message || 'Number must be non-positive',
                            options: {
                                type: 'number',
                                maximum: 0,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'nonnegative':
                    if (value < 0) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_SMALL,
                            message: check.message || 'Number must be non-negative',
                            options: {
                                type: 'number',
                                minimum: 0,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'multipleOf':
                    if (value % check.value !== 0) {
                        ctx.addIssue({
                            code: ErrorCode.NOT_MULTIPLE_OF,
                            message: check.message,
                            options: {
                                multipleOf: check.value
                            }
                        });
                    }
                    break;
                case 'finite':
                    if (!Number.isFinite(value)) {
                        ctx.addIssue({
                            code: ErrorCode.NOT_FINITE,
                            message: check.message
                        });
                    }
                    break;
                case 'safe':
                    if (!Number.isSafeInteger(value)) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_TYPE,
                            message: check.message || 'Number must be a safe integer',
                            expected: 'safe integer',
                            received: 'number'
                        });
                    }
                    break;
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return value;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    min(value, options) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, {
                kind: 'min',
                value,
                inclusive: options?.inclusive,
                message: options?.message
            }];
        return schema;
    }
    max(value, options) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, {
                kind: 'max',
                value,
                inclusive: options?.inclusive,
                message: options?.message
            }];
        return schema;
    }
    int(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'int', message }];
        return schema;
    }
    positive(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'positive', message }];
        return schema;
    }
    negative(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'negative', message }];
        return schema;
    }
    nonpositive(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'nonpositive', message }];
        return schema;
    }
    nonnegative(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'nonnegative', message }];
        return schema;
    }
    multipleOf(value, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'multipleOf', value, message }];
        return schema;
    }
    finite(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'finite', message }];
        return schema;
    }
    safe(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'safe', message }];
        return schema;
    }
    gt(value, message) {
        return this.min(value, { inclusive: false, message });
    }
    gte(value, message) {
        return this.min(value, { inclusive: true, message });
    }
    lt(value, message) {
        return this.max(value, { inclusive: false, message });
    }
    lte(value, message) {
        return this.max(value, { inclusive: true, message });
    }
    step(value, message) {
        return this.multipleOf(value, message);
    }
}
function number(options) {
    return new NumberSchema(options);
}

class BooleanSchema extends BaseSchema {
    _type = 'boolean';
    _coerce;
    constructor(options = {}) {
        super();
        this._coerce = options.coerce || false;
    }
    _parse(input, ctx) {
        if (this._coerce) {
            input = Boolean(input);
        }
        const parsedType = getParsedType(input);
        if (parsedType !== 'boolean') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected boolean, received ${parsedType}`,
                expected: 'boolean',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
function boolean(options) {
    return new BooleanSchema(options);
}

class DateSchema extends BaseSchema {
    _type = 'date';
    _checks = [];
    _coerce;
    constructor(options = {}) {
        super();
        this._coerce = options.coerce || false;
    }
    _parse(input, ctx) {
        if (this._coerce) {
            if (typeof input === 'string' || typeof input === 'number') {
                input = new Date(input);
            }
        }
        const parsedType = getParsedType(input);
        if (parsedType !== 'date') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'date',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const value = input;
        if (isNaN(value.getTime())) {
            ctx.addIssue({
                code: ErrorCode.INVALID_DATE,
                message: 'Invalid date'
            });
            throw ctx.makeError();
        }
        for (const check of this._checks) {
            switch (check.kind) {
                case 'min':
                    if (check.inclusive !== false) {
                        if (value < check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_SMALL,
                                message: check.message,
                                options: {
                                    type: 'date',
                                    minimum: check.value.getTime(),
                                    inclusive: true
                                }
                            });
                        }
                    }
                    else {
                        if (value <= check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_SMALL,
                                message: check.message,
                                options: {
                                    type: 'date',
                                    minimum: check.value.getTime(),
                                    inclusive: false
                                }
                            });
                        }
                    }
                    break;
                case 'max':
                    if (check.inclusive !== false) {
                        if (value > check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_BIG,
                                message: check.message,
                                options: {
                                    type: 'date',
                                    maximum: check.value.getTime(),
                                    inclusive: true
                                }
                            });
                        }
                    }
                    else {
                        if (value >= check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_BIG,
                                message: check.message,
                                options: {
                                    type: 'date',
                                    maximum: check.value.getTime(),
                                    inclusive: false
                                }
                            });
                        }
                    }
                    break;
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return value;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    min(value, options) {
        const date = value instanceof Date ? value : new Date(value);
        const schema = Object.create(this);
        schema._checks = [...this._checks, {
                kind: 'min',
                value: date,
                inclusive: options?.inclusive,
                message: options?.message
            }];
        return schema;
    }
    max(value, options) {
        const date = value instanceof Date ? value : new Date(value);
        const schema = Object.create(this);
        schema._checks = [...this._checks, {
                kind: 'max',
                value: date,
                inclusive: options?.inclusive,
                message: options?.message
            }];
        return schema;
    }
}
function date(options) {
    return new DateSchema(options);
}

class BigIntSchema extends BaseSchema {
    _type = 'bigint';
    _checks = [];
    _coerce;
    constructor(options = {}) {
        super();
        this._coerce = options.coerce || false;
    }
    _parse(input, ctx) {
        if (this._coerce) {
            if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
                try {
                    input = BigInt(input);
                }
                catch {
                    ctx.addIssue({
                        code: ErrorCode.INVALID_TYPE,
                        expected: 'bigint',
                        received: getParsedType(input)
                    });
                    throw ctx.makeError();
                }
            }
        }
        const parsedType = getParsedType(input);
        if (parsedType !== 'bigint') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'bigint',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const value = input;
        for (const check of this._checks) {
            switch (check.kind) {
                case 'min':
                    if (check.inclusive !== false) {
                        if (value < check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_SMALL,
                                message: check.message,
                                options: {
                                    type: 'bigint',
                                    minimum: check.value.toString(),
                                    inclusive: true
                                }
                            });
                        }
                    }
                    else {
                        if (value <= check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_SMALL,
                                message: check.message,
                                options: {
                                    type: 'bigint',
                                    minimum: check.value.toString(),
                                    inclusive: false
                                }
                            });
                        }
                    }
                    break;
                case 'max':
                    if (check.inclusive !== false) {
                        if (value > check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_BIG,
                                message: check.message,
                                options: {
                                    type: 'bigint',
                                    maximum: check.value.toString(),
                                    inclusive: true
                                }
                            });
                        }
                    }
                    else {
                        if (value >= check.value) {
                            ctx.addIssue({
                                code: ErrorCode.TOO_BIG,
                                message: check.message,
                                options: {
                                    type: 'bigint',
                                    maximum: check.value.toString(),
                                    inclusive: false
                                }
                            });
                        }
                    }
                    break;
                case 'positive':
                    if (value <= 0n) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_SMALL,
                            message: check.message || 'BigInt must be positive',
                            options: {
                                type: 'bigint',
                                minimum: '0',
                                inclusive: false
                            }
                        });
                    }
                    break;
                case 'negative':
                    if (value >= 0n) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_BIG,
                            message: check.message || 'BigInt must be negative',
                            options: {
                                type: 'bigint',
                                maximum: '0',
                                inclusive: false
                            }
                        });
                    }
                    break;
                case 'nonpositive':
                    if (value > 0n) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_BIG,
                            message: check.message || 'BigInt must be non-positive',
                            options: {
                                type: 'bigint',
                                maximum: '0',
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'nonnegative':
                    if (value < 0n) {
                        ctx.addIssue({
                            code: ErrorCode.TOO_SMALL,
                            message: check.message || 'BigInt must be non-negative',
                            options: {
                                type: 'bigint',
                                minimum: '0',
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'multipleOf':
                    if (value % check.value !== 0n) {
                        ctx.addIssue({
                            code: ErrorCode.NOT_MULTIPLE_OF,
                            message: check.message,
                            options: {
                                multipleOf: check.value.toString()
                            }
                        });
                    }
                    break;
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return value;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    min(value, options) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, {
                kind: 'min',
                value,
                inclusive: options?.inclusive,
                message: options?.message
            }];
        return schema;
    }
    max(value, options) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, {
                kind: 'max',
                value,
                inclusive: options?.inclusive,
                message: options?.message
            }];
        return schema;
    }
    positive(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'positive', message }];
        return schema;
    }
    negative(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'negative', message }];
        return schema;
    }
    nonpositive(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'nonpositive', message }];
        return schema;
    }
    nonnegative(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'nonnegative', message }];
        return schema;
    }
    multipleOf(value, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'multipleOf', value, message }];
        return schema;
    }
}
function bigint(options) {
    return new BigIntSchema(options);
}

class SymbolSchema extends BaseSchema {
    _type = 'symbol';
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'symbol') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected symbol, received ${parsedType}`,
                expected: 'symbol',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
function symbol() {
    return new SymbolSchema();
}

class LiteralSchema extends BaseSchema {
    _type = 'literal';
    _value;
    constructor(value) {
        super();
        this._value = value;
    }
    _parse(input, ctx) {
        if (input !== this._value) {
            ctx.addIssue({
                code: ErrorCode.INVALID_LITERAL,
                expected: JSON.stringify(this._value),
                received: JSON.stringify(input)
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    get value() {
        return this._value;
    }
}
function literal(value) {
    return new LiteralSchema(value);
}

class UndefinedSchema extends BaseSchema {
    _type = 'undefined';
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'undefined') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected undefined, received ${parsedType}`,
                expected: 'undefined',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return undefined;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
function undefinedSchema() {
    return new UndefinedSchema();
}

class NullSchema extends BaseSchema {
    _type = 'null';
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'null') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected null, received ${parsedType}`,
                expected: 'null',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return null;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
function nullSchema() {
    return new NullSchema();
}

class AnySchema extends BaseSchema {
    _type = 'any';
    _parse(input, _ctx) {
        return input;
    }
    async _parseAsync(input, _ctx) {
        return input;
    }
}
function any() {
    return new AnySchema();
}

class UnknownSchema extends BaseSchema {
    _type = 'unknown';
    _parse(input, _ctx) {
        return input;
    }
    async _parseAsync(input, _ctx) {
        return input;
    }
}
function unknown() {
    return new UnknownSchema();
}

class NeverSchema extends BaseSchema {
    _type = 'never';
    _parse(_input, ctx) {
        ctx.addIssue({
            code: ErrorCode.INVALID_TYPE,
            expected: 'never',
            received: ctx.parsedType
        });
        throw ctx.makeError();
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
function never() {
    return new NeverSchema();
}

class VoidSchema extends BaseSchema {
    _type = 'void';
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'undefined') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected void, received ${parsedType}`,
                expected: 'void',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return undefined;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
function voidSchema() {
    return new VoidSchema();
}

class NanSchema extends BaseSchema {
    _type = 'nan';
    _parse(input, ctx) {
        if (typeof input !== 'number' || !isNaN(input)) {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'nan',
                received: typeof input === 'number' ? 'number' : ctx.parsedType
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
function nan() {
    return new NanSchema();
}

class RecordSchema extends BaseSchema {
    _type = 'record';
    _keySchema;
    _valueSchema;
    constructor(keySchema, valueSchema) {
        super();
        this._keySchema = keySchema;
        this._valueSchema = valueSchema;
    }
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'object',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const obj = input;
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Validate key
                const keyResult = this._keySchema.safeParse(key);
                if (!keyResult.success) {
                    ctx.addIssue({
                        code: ErrorCode.INVALID_TYPE,
                        message: `Invalid key: ${key}`
                    });
                    continue;
                }
                // Validate value
                const valueResult = this._valueSchema.safeParse(obj[key]);
                if (!valueResult.success) {
                    for (const issue of valueResult.error.issues) {
                        const { path, ...issueWithoutPath } = issue;
                        ctx.addIssue(issueWithoutPath);
                    }
                }
                else {
                    result[key] = valueResult.data;
                }
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'object',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const obj = input;
        const result = {};
        const promises = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                promises.push((async () => {
                    // Validate key
                    const keyResult = await this._keySchema.safeParseAsync(key);
                    if (!keyResult.success) {
                        ctx.addIssue({
                            code: ErrorCode.INVALID_TYPE,
                            message: `Invalid key: ${key}`
                        });
                        return;
                    }
                    // Validate value
                    const valueResult = await this._valueSchema.safeParseAsync(obj[key]);
                    if (!valueResult.success) {
                        for (const issue of valueResult.error.issues) {
                            const { path, ...issueWithoutPath } = issue;
                            ctx.addIssue(issueWithoutPath);
                        }
                    }
                    else {
                        result[key] = valueResult.data;
                    }
                })());
            }
        }
        await Promise.all(promises);
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
}
function record(keySchema, valueSchema) {
    return new RecordSchema(keySchema, valueSchema);
}

class TupleSchema extends BaseSchema {
    _type = 'tuple';
    _items;
    _rest;
    constructor(items, rest = null) {
        super();
        this._items = items;
        this._rest = rest;
    }
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'array') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'array',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const arr = input;
        const result = [];
        if (this._rest === null) {
            if (arr.length !== this._items.length) {
                ctx.addIssue({
                    code: arr.length > this._items.length ? ErrorCode.TOO_BIG : ErrorCode.TOO_SMALL,
                    message: `Expected array of length ${this._items.length}, received ${arr.length}`,
                    options: {
                        type: 'array',
                        [arr.length > this._items.length ? 'maximum' : 'minimum']: this._items.length,
                        inclusive: true
                    }
                });
            }
        }
        else {
            if (arr.length < this._items.length) {
                ctx.addIssue({
                    code: ErrorCode.TOO_SMALL,
                    message: `Expected array of at least ${this._items.length} elements, received ${arr.length}`,
                    options: {
                        type: 'array',
                        minimum: this._items.length,
                        inclusive: true
                    }
                });
            }
        }
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            const value = arr[i];
            const childCtx = ctx.child(i, value);
            try {
                const parsed = item._parse(value, childCtx);
                result.push(parsed);
            }
            catch (error) {
                if (!ctx.common.async) {
                    throw ctx.makeError();
                }
            }
        }
        if (this._rest !== null) {
            for (let i = this._items.length; i < arr.length; i++) {
                const value = arr[i];
                const childCtx = ctx.child(i, value);
                try {
                    const parsed = this._rest._parse(value, childCtx);
                    result.push(parsed);
                }
                catch (error) {
                    if (!ctx.common.async) {
                        throw ctx.makeError();
                    }
                }
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'array') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'array',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const arr = input;
        const result = [];
        if (this._rest === null) {
            if (arr.length !== this._items.length) {
                ctx.addIssue({
                    code: arr.length > this._items.length ? ErrorCode.TOO_BIG : ErrorCode.TOO_SMALL,
                    message: `Expected array of length ${this._items.length}, received ${arr.length}`,
                    options: {
                        type: 'array',
                        [arr.length > this._items.length ? 'maximum' : 'minimum']: this._items.length,
                        inclusive: true
                    }
                });
            }
        }
        else {
            if (arr.length < this._items.length) {
                ctx.addIssue({
                    code: ErrorCode.TOO_SMALL,
                    message: `Expected array of at least ${this._items.length} elements, received ${arr.length}`,
                    options: {
                        type: 'array',
                        minimum: this._items.length,
                        inclusive: true
                    }
                });
            }
        }
        const promises = [];
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            const value = arr[i];
            const childCtx = ctx.child(i, value);
            promises.push(item._parseAsync(value, childCtx));
        }
        if (this._rest !== null) {
            for (let i = this._items.length; i < arr.length; i++) {
                const value = arr[i];
                const childCtx = ctx.child(i, value);
                promises.push(this._rest._parseAsync(value, childCtx));
            }
        }
        const results = await Promise.allSettled(promises);
        for (const res of results) {
            if (res.status === 'fulfilled') {
                result.push(res.value);
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    rest(schema) {
        return new TupleSchema(this._items, schema);
    }
    get items() {
        return this._items;
    }
}
function tuple(items) {
    return new TupleSchema(items);
}

class DiscriminatedUnionSchema extends BaseSchema {
    _type = 'discriminatedUnion';
    _discriminator;
    _unionOptions;
    _optionsByDiscriminator;
    constructor(discriminator, options) {
        super();
        this._discriminator = discriminator;
        this._unionOptions = options;
        this._optionsByDiscriminator = new Map();
        // Build lookup map for fast discrimination
        for (const option of options) {
            const shape = option.shape;
            const discriminatorSchema = shape[discriminator];
            if (!discriminatorSchema) {
                throw new Error(`Discriminator "${discriminator}" not found in option schema`);
            }
            // Extract the literal value from the discriminator schema
            const literalValue = this.extractLiteralValue(discriminatorSchema);
            if (literalValue !== undefined) {
                this._optionsByDiscriminator.set(literalValue, option);
            }
        }
    }
    extractLiteralValue(schema) {
        // Check if it's a literal schema
        if ('value' in schema && typeof schema.value !== 'function') {
            return schema.value;
        }
        // For complex schemas, try to extract the expected value
        if (schema._type === 'literal' && 'value' in schema) {
            return schema.value;
        }
        return undefined;
    }
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected object, received ${parsedType}`,
                expected: 'object',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const obj = input;
        const discriminatorValue = obj[this._discriminator];
        const option = this._optionsByDiscriminator.get(discriminatorValue);
        if (!option) {
            ctx.addIssue({
                code: ErrorCode.INVALID_UNION_DISCRIMINATOR,
                message: `Invalid discriminator value`,
                options: {
                    expected: Array.from(this._optionsByDiscriminator.keys()),
                    received: discriminatorValue
                }
            });
            throw ctx.makeError();
        }
        return option._parse(input, ctx);
    }
    async _parseAsync(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Expected object, received ${parsedType}`,
                expected: 'object',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const obj = input;
        const discriminatorValue = obj[this._discriminator];
        const option = this._optionsByDiscriminator.get(discriminatorValue);
        if (!option) {
            ctx.addIssue({
                code: ErrorCode.INVALID_UNION_DISCRIMINATOR,
                message: `Invalid discriminator value`,
                options: {
                    expected: Array.from(this._optionsByDiscriminator.keys()),
                    received: discriminatorValue
                }
            });
            throw ctx.makeError();
        }
        return option._parseAsync(input, ctx);
    }
    get discriminator() {
        return this._discriminator;
    }
    get options() {
        return this._unionOptions;
    }
}
function discriminatedUnion(discriminator, options) {
    return new DiscriminatedUnionSchema(discriminator, options);
}

class MapSchema extends BaseSchema {
    _type = 'map';
    _keySchema;
    _valueSchema;
    constructor(keySchema, valueSchema) {
        super();
        this._keySchema = keySchema;
        this._valueSchema = valueSchema;
    }
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'map') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'Map',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const inputMap = input;
        const result = new Map();
        let index = 0;
        for (const [key, value] of inputMap) {
            const keyCtx = ctx.child(`[${index}].key`, key);
            const valueCtx = ctx.child(`[${index}].value`, value);
            try {
                const parsedKey = this._keySchema._parse(key, keyCtx);
                const parsedValue = this._valueSchema._parse(value, valueCtx);
                result.set(parsedKey, parsedValue);
            }
            catch (error) {
                if (!ctx.common.async) {
                    throw ctx.makeError();
                }
            }
            index++;
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'map') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'Map',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const inputMap = input;
        const result = new Map();
        const promises = [];
        let index = 0;
        for (const [key, value] of inputMap) {
            const keyCtx = ctx.child(`[${index}].key`, key);
            const valueCtx = ctx.child(`[${index}].value`, value);
            promises.push(Promise.all([
                this._keySchema._parseAsync(key, keyCtx),
                this._valueSchema._parseAsync(value, valueCtx)
            ]));
            index++;
        }
        const results = await Promise.allSettled(promises);
        for (const res of results) {
            if (res.status === 'fulfilled') {
                const [key, value] = res.value;
                result.set(key, value);
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    get keySchema() {
        return this._keySchema;
    }
    get valueSchema() {
        return this._valueSchema;
    }
}
function map(keySchema, valueSchema) {
    return new MapSchema(keySchema, valueSchema);
}

class SetSchema extends BaseSchema {
    _type = 'set';
    _element;
    constructor(element) {
        super();
        this._element = element;
    }
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'set') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'Set',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const inputSet = input;
        const result = new Set();
        let index = 0;
        for (const value of inputSet) {
            const childCtx = ctx.child(index, value);
            try {
                const parsed = this._element._parse(value, childCtx);
                result.add(parsed);
            }
            catch (error) {
                if (!ctx.common.async) {
                    throw ctx.makeError();
                }
            }
            index++;
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'set') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'Set',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const inputSet = input;
        const result = new Set();
        const promises = [];
        let index = 0;
        for (const value of inputSet) {
            const childCtx = ctx.child(index, value);
            promises.push(this._element._parseAsync(value, childCtx));
            index++;
        }
        const results = await Promise.allSettled(promises);
        for (const res of results) {
            if (res.status === 'fulfilled') {
                result.add(res.value);
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    get element() {
        return this._element;
    }
}
function set(element) {
    return new SetSchema(element);
}

class PromiseSchema extends BaseSchema {
    _type = 'promise';
    _schema;
    constructor(schema) {
        super();
        this._schema = schema;
    }
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'promise') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'Promise',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return input.then(value => {
            return this._schema._parse(value, ctx);
        });
    }
    async _parseAsync(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'promise') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'Promise',
                received: parsedType
            });
            throw ctx.makeError();
        }
        // Return a promise that validates the resolved value
        return input.then(async (value) => {
            return this._schema._parseAsync(value, ctx);
        });
    }
    get schema() {
        return this._schema;
    }
}
function promise(schema) {
    return new PromiseSchema(schema);
}

class EnumSchema extends BaseSchema {
    _type = 'enum';
    _values;
    _enumValues;
    constructor(values) {
        super();
        this._values = values;
        this._enumValues = new Set(values);
    }
    _parse(input, ctx) {
        if (!this._enumValues.has(input)) {
            ctx.addIssue({
                code: ErrorCode.INVALID_ENUM_VALUE,
                message: `Invalid enum value`,
                options: {
                    expected: Array.from(this._enumValues),
                    received: String(input)
                }
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    get values() {
        return this._values;
    }
    get options() {
        return Array.from(this._enumValues);
    }
}
function enumSchema(values) {
    return new EnumSchema(values);
}
// Native enum support
class NativeEnumSchema extends BaseSchema {
    _type = 'nativeEnum';
    _enum;
    _enumValues;
    constructor(enumObject) {
        super();
        this._enum = enumObject;
        // Extract enum values (handle both string and numeric enums)
        const values = new Set();
        for (const key in enumObject) {
            const value = enumObject[key];
            // For numeric enums, TypeScript creates reverse mappings
            // We need to filter those out
            if (typeof value === 'number' || typeof enumObject[value] !== 'number') {
                values.add(value);
            }
        }
        this._enumValues = values;
    }
    _parse(input, ctx) {
        if (!this._enumValues.has(input)) {
            ctx.addIssue({
                code: ErrorCode.INVALID_ENUM_VALUE,
                message: `Invalid enum value`,
                options: {
                    expected: Array.from(this._enumValues),
                    received: String(input)
                }
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    get enum() {
        return this._enum;
    }
    get options() {
        return Array.from(this._enumValues);
    }
}
function nativeEnum(enumObject) {
    return new NativeEnumSchema(enumObject);
}

class FunctionSchema extends BaseSchema {
    _type = 'function';
    _args;
    _returns;
    _implement;
    constructor(args, returns) {
        super();
        this._args = args;
        this._returns = returns;
    }
    _parse(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'function') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'function',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const fn = input;
        // If we have an implementation function, validate it
        if (this._implement) {
            // Create a wrapper function that validates args and return value
            return (...args) => {
                // Validate arguments
                if (this._args) {
                    for (let i = 0; i < this._args.length; i++) {
                        const argSchema = this._args[i];
                        const argValue = args[i];
                        const argCtx = ctx.child(`arg[${i}]`, argValue);
                        argSchema._parse(argValue, argCtx);
                    }
                }
                // Call the function
                const result = fn(...args);
                // Validate return value
                if (this._returns) {
                    const returnCtx = ctx.child('return', result);
                    return this._returns._parse(result, returnCtx);
                }
                return result;
            };
        }
        return fn;
    }
    async _parseAsync(input, ctx) {
        const parsedType = getParsedType(input);
        if (parsedType !== 'function') {
            ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                expected: 'function',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const fn = input;
        // If we have an implementation function, validate it
        if (this._implement) {
            // Create a wrapper function that validates args and return value
            return async (...args) => {
                // Validate arguments
                if (this._args) {
                    for (let i = 0; i < this._args.length; i++) {
                        const argSchema = this._args[i];
                        const argValue = args[i];
                        const argCtx = ctx.child(`arg[${i}]`, argValue);
                        await argSchema._parseAsync(argValue, argCtx);
                    }
                }
                // Call the function
                const result = await fn(...args);
                // Validate return value
                if (this._returns) {
                    const returnCtx = ctx.child('return', result);
                    return await this._returns._parseAsync(result, returnCtx);
                }
                return result;
            };
        }
        return fn;
    }
    args(...schemas) {
        return new FunctionSchema(schemas, this._returns);
    }
    returns(schema) {
        return new FunctionSchema(this._args, schema);
    }
    implement(fn) {
        const schema = Object.create(this);
        schema._implement = fn;
        return schema;
    }
}
function functionSchema() {
    return new FunctionSchema();
}

class PreprocessSchema extends BaseSchema {
    _type = 'preprocess';
    _preprocessor;
    _schema;
    constructor(preprocessor, schema) {
        super();
        this._preprocessor = preprocessor;
        this._schema = schema;
    }
    _parse(input, ctx) {
        let preprocessed;
        try {
            preprocessed = this._preprocessor(input);
        }
        catch (error) {
            ctx.addIssue({
                code: 'custom',
                message: `Preprocessing failed: ${error instanceof Error ? error.message : String(error)}`
            });
            throw ctx.makeError();
        }
        return this._schema._parse(preprocessed, ctx);
    }
    async _parseAsync(input, ctx) {
        let preprocessed;
        try {
            preprocessed = await Promise.resolve(this._preprocessor(input));
        }
        catch (error) {
            ctx.addIssue({
                code: 'custom',
                message: `Preprocessing failed: ${error instanceof Error ? error.message : String(error)}`
            });
            throw ctx.makeError();
        }
        return this._schema._parseAsync(preprocessed, ctx);
    }
}
function preprocess(preprocessor, schema) {
    return new PreprocessSchema(preprocessor, schema);
}

class PipelineSchema extends BaseSchema {
    _type = 'pipeline';
    _schemas;
    constructor(schemas) {
        super();
        this._schemas = schemas;
    }
    _parse(input, ctx) {
        let result = input;
        for (const schema of this._schemas) {
            result = schema._parse(result, ctx);
            if (ctx.hasIssues) {
                throw ctx.makeError();
            }
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        let result = input;
        for (const schema of this._schemas) {
            result = await schema._parseAsync(result, ctx);
            if (ctx.hasIssues) {
                throw ctx.makeError();
            }
        }
        return result;
    }
    get schemas() {
        return this._schemas;
    }
}
function pipeline(...schemas) {
    return new PipelineSchema(schemas);
}

class EffectsSchema extends BaseSchema {
    _type = 'effects';
    _schema;
    _effect;
    constructor(schema, effect) {
        super();
        this._schema = schema;
        this._effect = effect;
    }
    _parse(input, ctx) {
        const result = this._schema._parse(input, ctx);
        if (!ctx.hasIssues) {
            this._effect(result, ctx);
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        const result = await this._schema._parseAsync(input, ctx);
        if (!ctx.hasIssues) {
            await this._effect(result, ctx);
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
}
function effects(schema, effect) {
    return new EffectsSchema(schema, effect);
}

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
// Export singleton instance
const pluginManager = PluginManager.getInstance();

const v = {
    string: string,
    number: number,
    boolean: boolean,
    date: date,
    bigint: bigint,
    symbol: symbol,
    literal: literal,
    undefined: undefinedSchema,
    null: nullSchema,
    any: any,
    unknown: unknown,
    never: never,
    void: voidSchema,
    nan: nan,
    array: array,
    object: object,
    record: record,
    union: union,
    tuple: tuple,
    intersection: intersection,
    discriminatedUnion: discriminatedUnion,
    map: map,
    set: set,
    lazy: lazy,
    promise: promise,
    enum: enumSchema,
    nativeEnum: nativeEnum,
    function: functionSchema,
    preprocess: preprocess,
    pipeline: pipeline,
    effects: effects,
    coerce: {
        string: (options) => string({ ...options, coerce: true }),
        number: (options) => number({ ...options, coerce: true }),
        boolean: (options) => boolean({ ...options, coerce: true }),
        date: (options) => date({ ...options, coerce: true }),
        bigint: (options) => bigint({ ...options, coerce: true })
    },
    use: (plugin) => pluginManager.register(plugin),
    // Utility functions
    is: is,
    assert: assert,
    createGuard: createGuard,
    createAssert: createAssert,
    introspect: introspect,
    toJsonSchema: toJsonSchema,
    formatError: formatError,
    compose: {
        or: or,
        and: and,
        conditional: conditional,
        recursive: recursive,
        pipeline: pipeline$1,
        coerce: coerce,
        withFallback: withFallback,
        preprocess: preprocess$1,
        postprocess: postprocess,
        nullable: nullable,
        optional: optional,
        nullish: nullish,
        withDefault: withDefault,
        brand: brand,
        readonly: readonly,
        defer: defer,
        firstOf: firstOf,
        allOf: allOf,
        extend: extend,
        pick: pick,
        omit: omit,
        partial: partial,
        required: required,
        deepPartial: deepPartial,
        mergeObjects: mergeObjects
    },
    metadata: {
        set: setMetadata,
        get: getMetadata,
        has: hasMetadata,
        delete: deleteMetadata,
        clear: clearMetadata,
        describe: describe,
        example: example,
        deprecate: deprecate,
        version: version,
        tag: tag,
        document: document,
        withMetadata: withMetadata,
        getSummary: getMetadataSummary
    }
};

export { AnySchema, ArraySchema, BaseSchema, BigIntSchema, BooleanSchema, DateSchema, DiscriminatedUnionSchema, EffectsSchema, EnumSchema, ErrorCode, FunctionSchema, IntersectionSchema, LazySchema, LiteralSchema, MapSchema, NanSchema, NativeEnumSchema, NeverSchema, NullSchema, NumberSchema, ObjectSchema, PipelineSchema, PreprocessSchema, PromiseSchema, RecordSchema, SetSchema, StringSchema, SymbolSchema, TupleSchema, UndefinedSchema, UnionSchema, UnknownSchema, ValidationError, VoidSchema, any, array, bigint, boolean, brand$1 as brand, composition, date, v as default, defaultErrorMap, discriminatedUnion, effects, enumSchema, errorFormatter, functionSchema, getParsedType, guards, intersection, introspection, lazy, literal, map, metadata, nan, nativeEnum, never, nullSchema, number, object, pipeline, preprocess, promise, record, set, string, symbol, tuple, undefinedSchema, union, unknown, v, voidSchema };
//# sourceMappingURL=index.mjs.map
