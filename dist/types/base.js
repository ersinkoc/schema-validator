"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSchema = exports.brand = exports.ValidationError = void 0;
const errors_1 = require("./errors");
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
exports.ValidationError = ValidationError;
exports.brand = Symbol('brand');
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
                parsedType: (0, errors_1.getParsedType)(data),
                common: { issues, async: false },
                hasIssues: false,
                makeError: () => new ValidationError(issues),
                child: (key, childData) => {
                    const childCtx = Object.create(ctx);
                    childCtx.path = [...ctx.path, key];
                    childCtx.data = childData;
                    childCtx.parsedType = (0, errors_1.getParsedType)(childData);
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
                    clonedCtx.parsedType = (0, errors_1.getParsedType)(clonedCtx.data);
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
                parsedType: (0, errors_1.getParsedType)(data),
                common: { issues, async: true },
                hasIssues: false,
                makeError: () => new ValidationError(issues),
                child: (key, childData) => {
                    const childCtx = Object.create(ctx);
                    childCtx.path = [...ctx.path, key];
                    childCtx.data = childData;
                    childCtx.parsedType = (0, errors_1.getParsedType)(childData);
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
                    clonedCtx.parsedType = (0, errors_1.getParsedType)(clonedCtx.data);
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
exports.BaseSchema = BaseSchema;
//# sourceMappingURL=base.js.map