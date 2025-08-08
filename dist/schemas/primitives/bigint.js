"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigIntSchema = void 0;
exports.bigint = bigint;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class BigIntSchema extends base_1.BaseSchema {
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
                        code: errors_1.ErrorCode.INVALID_TYPE,
                        expected: 'bigint',
                        received: (0, errors_1.getParsedType)(input)
                    });
                    throw ctx.makeError();
                }
            }
        }
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'bigint') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
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
                                code: errors_1.ErrorCode.TOO_SMALL,
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
                                code: errors_1.ErrorCode.TOO_SMALL,
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
                                code: errors_1.ErrorCode.TOO_BIG,
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
                                code: errors_1.ErrorCode.TOO_BIG,
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
                            code: errors_1.ErrorCode.TOO_SMALL,
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
                            code: errors_1.ErrorCode.TOO_BIG,
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
                            code: errors_1.ErrorCode.TOO_BIG,
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
                            code: errors_1.ErrorCode.TOO_SMALL,
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
                            code: errors_1.ErrorCode.NOT_MULTIPLE_OF,
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
exports.BigIntSchema = BigIntSchema;
function bigint(options) {
    return new BigIntSchema(options);
}
//# sourceMappingURL=bigint.js.map