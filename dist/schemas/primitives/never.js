"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeverSchema = void 0;
exports.never = never;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class NeverSchema extends base_1.BaseSchema {
    _type = 'never';
    _parse(_input, ctx) {
        ctx.addIssue({
            code: errors_1.ErrorCode.INVALID_TYPE,
            expected: 'never',
            received: ctx.parsedType
        });
        throw ctx.makeError();
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
exports.NeverSchema = NeverSchema;
function never() {
    return new NeverSchema();
}
//# sourceMappingURL=never.js.map