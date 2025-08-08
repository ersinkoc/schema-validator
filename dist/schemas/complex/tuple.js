"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TupleSchema = void 0;
exports.tuple = tuple;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class TupleSchema extends base_1.BaseSchema {
    _type = 'tuple';
    _items;
    _rest;
    constructor(items, rest = null) {
        super();
        this._items = items;
        this._rest = rest;
    }
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'array') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
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
                    code: arr.length > this._items.length ? errors_1.ErrorCode.TOO_BIG : errors_1.ErrorCode.TOO_SMALL,
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
                    code: errors_1.ErrorCode.TOO_SMALL,
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
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'array') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
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
                    code: arr.length > this._items.length ? errors_1.ErrorCode.TOO_BIG : errors_1.ErrorCode.TOO_SMALL,
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
                    code: errors_1.ErrorCode.TOO_SMALL,
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
exports.TupleSchema = TupleSchema;
function tuple(items) {
    return new TupleSchema(items);
}
//# sourceMappingURL=tuple.js.map