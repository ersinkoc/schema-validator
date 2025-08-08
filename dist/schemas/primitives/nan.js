"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NanSchema = void 0;
exports.nan = nan;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class NanSchema extends base_1.BaseSchema {
    _type = 'nan';
    _parse(input, ctx) {
        if (typeof input !== 'number' || !isNaN(input)) {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                expected: 'nan',
                received: typeof input === 'number' ? 'number' : ctx.parsedType
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
exports.NanSchema = NanSchema;
function nan() {
    return new NanSchema();
}
//# sourceMappingURL=nan.js.map