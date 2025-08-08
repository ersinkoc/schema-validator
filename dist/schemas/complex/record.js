"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordSchema = void 0;
exports.record = record;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class RecordSchema extends base_1.BaseSchema {
    _type = 'record';
    _keySchema;
    _valueSchema;
    constructor(keySchema, valueSchema) {
        super();
        this._keySchema = keySchema;
        this._valueSchema = valueSchema;
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
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Validate key
                const keyResult = this._keySchema.safeParse(key);
                if (!keyResult.success) {
                    ctx.addIssue({
                        code: errors_1.ErrorCode.INVALID_TYPE,
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
        const promises = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                promises.push((async () => {
                    // Validate key
                    const keyResult = await this._keySchema.safeParseAsync(key);
                    if (!keyResult.success) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_TYPE,
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
exports.RecordSchema = RecordSchema;
function record(keySchema, valueSchema) {
    return new RecordSchema(keySchema, valueSchema);
}
//# sourceMappingURL=record.js.map