"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSchema = void 0;
exports.set = set;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class SetSchema extends base_1.BaseSchema {
    _type = 'set';
    _element;
    constructor(element) {
        super();
        this._element = element;
    }
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'set') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
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
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'set') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
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
exports.SetSchema = SetSchema;
function set(element) {
    return new SetSchema(element);
}
//# sourceMappingURL=set.js.map