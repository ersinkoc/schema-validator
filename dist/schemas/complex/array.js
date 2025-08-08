"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArraySchema = void 0;
exports.array = array;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class ArraySchema extends base_1.BaseSchema {
    _type = 'array';
    _element;
    _checks = [];
    constructor(element) {
        super();
        this._element = element;
    }
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'array') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
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
                            code: errors_1.ErrorCode.TOO_SMALL,
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
                            code: errors_1.ErrorCode.TOO_BIG,
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
                            code: errors_1.ErrorCode.INVALID_TYPE,
                            message: check.message || `Array must have exactly ${check.value} elements`,
                            expected: `array of length ${check.value}`,
                            received: `array of length ${arr.length}`
                        });
                    }
                    break;
                case 'nonempty':
                    if (arr.length === 0) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.TOO_SMALL,
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
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'array') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
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
                            code: errors_1.ErrorCode.TOO_SMALL,
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
                            code: errors_1.ErrorCode.TOO_BIG,
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
                            code: errors_1.ErrorCode.INVALID_TYPE,
                            message: check.message || `Array must have exactly ${check.value} elements`,
                            expected: `array of length ${check.value}`,
                            received: `array of length ${arr.length}`
                        });
                    }
                    break;
                case 'nonempty':
                    if (arr.length === 0) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.TOO_SMALL,
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
exports.ArraySchema = ArraySchema;
function array(element) {
    return new ArraySchema(element);
}
//# sourceMappingURL=array.js.map