"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteralSchema = void 0;
exports.literal = literal;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class LiteralSchema extends base_1.BaseSchema {
    _type = 'literal';
    _value;
    constructor(value) {
        super();
        this._value = value;
    }
    _parse(input, ctx) {
        if (input !== this._value) {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_LITERAL,
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
exports.LiteralSchema = LiteralSchema;
function literal(value) {
    return new LiteralSchema(value);
}
//# sourceMappingURL=literal.js.map