"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateSchema = void 0;
exports.date = date;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class DateSchema extends base_1.BaseSchema {
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
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'date') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                expected: 'date',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const value = input;
        if (isNaN(value.getTime())) {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_DATE,
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
                                code: errors_1.ErrorCode.TOO_SMALL,
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
                                code: errors_1.ErrorCode.TOO_SMALL,
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
                                code: errors_1.ErrorCode.TOO_BIG,
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
                                code: errors_1.ErrorCode.TOO_BIG,
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
exports.DateSchema = DateSchema;
function date(options) {
    return new DateSchema(options);
}
//# sourceMappingURL=date.js.map