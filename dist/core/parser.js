"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseContextImpl = void 0;
exports.createParser = createParser;
exports.createAsyncParser = createAsyncParser;
exports.mergeResults = mergeResults;
const base_1 = require("../types/base");
const errors_1 = require("../types/errors");
class ParseContextImpl {
    common;
    path;
    parsedType;
    schemaErrorMap;
    parent;
    data;
    constructor(data, path = [], parent, errorMap = errors_1.defaultErrorMap, async = false) {
        this.data = data;
        this.path = path;
        this.parent = parent;
        this.parsedType = (0, errors_1.getParsedType)(data);
        this.common = {
            issues: [],
            async,
            errorMap,
            contextualErrorMap: undefined
        };
    }
    addIssue(issue) {
        const fullIssue = {
            ...issue,
            path: this.path
        };
        if (!fullIssue.message) {
            const errorMapCtx = {
                code: issue.code,
                path: this.path,
                input: this.data,
                expected: issue.expected,
                received: issue.received,
                options: issue.options,
                message: issue.message
            };
            const customError = this.common.contextualErrorMap?.(errorMapCtx) ||
                this.schemaErrorMap?.(errorMapCtx) ||
                this.common.errorMap(errorMapCtx);
            fullIssue.message = customError;
        }
        this.common.issues.push(fullIssue);
    }
    clone(data, path) {
        const cloned = new ParseContextImpl(data !== undefined ? data : this.data, path !== undefined ? path : this.path, this.parent, this.common.errorMap, this.common.async);
        cloned.common = this.common;
        cloned.schemaErrorMap = this.schemaErrorMap;
        return cloned;
    }
    child(key, data) {
        return this.clone(data, [...this.path, key]);
    }
    setAsync() {
        this.common.async = true;
    }
    get hasIssues() {
        return this.common.issues.length > 0;
    }
    get issues() {
        return this.common.issues;
    }
    makeError() {
        return new base_1.ValidationError(this.common.issues);
    }
}
exports.ParseContextImpl = ParseContextImpl;
function createParser(parseFunction) {
    return (input) => {
        const ctx = new ParseContextImpl(input.data, input.path, input.parent, input.errorMap, input.async);
        try {
            const result = parseFunction(input.data, ctx);
            if (ctx.hasIssues) {
                return { status: 'error', error: ctx.makeError() };
            }
            return { status: 'ok', value: result };
        }
        catch (error) {
            if (error instanceof base_1.ValidationError) {
                return { status: 'error', error };
            }
            ctx.addIssue({
                code: errors_1.ErrorCode.CUSTOM,
                message: error instanceof Error ? error.message : String(error)
            });
            return { status: 'error', error: ctx.makeError() };
        }
    };
}
async function createAsyncParser(parseFunction) {
    return async (input) => {
        const ctx = new ParseContextImpl(input.data, input.path, input.parent, input.errorMap, true);
        try {
            const result = await parseFunction(input.data, ctx);
            if (ctx.hasIssues) {
                return { status: 'error', error: ctx.makeError() };
            }
            return { status: 'ok', value: result };
        }
        catch (error) {
            if (error instanceof base_1.ValidationError) {
                return { status: 'error', error };
            }
            ctx.addIssue({
                code: errors_1.ErrorCode.CUSTOM,
                message: error instanceof Error ? error.message : String(error)
            });
            return { status: 'error', error: ctx.makeError() };
        }
    };
}
function mergeResults(results) {
    const values = [];
    const issues = [];
    for (const result of results) {
        if (result.status === 'error') {
            issues.push(...result.error.issues);
        }
        else {
            values.push(result.value);
        }
    }
    if (issues.length > 0) {
        return { status: 'error', error: new base_1.ValidationError(issues) };
    }
    return { status: 'ok', value: values };
}
//# sourceMappingURL=parser.js.map