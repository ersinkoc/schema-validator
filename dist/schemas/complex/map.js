"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapSchema = void 0;
exports.map = map;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class MapSchema extends base_1.BaseSchema {
    _type = 'map';
    _keySchema;
    _valueSchema;
    constructor(keySchema, valueSchema) {
        super();
        this._keySchema = keySchema;
        this._valueSchema = valueSchema;
    }
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'map') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
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
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'map') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
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
exports.MapSchema = MapSchema;
function map(keySchema, valueSchema) {
    return new MapSchema(keySchema, valueSchema);
}
//# sourceMappingURL=map.js.map