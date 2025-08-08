"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.null = exports.NullSchema = void 0;
exports.nullSchema = nullSchema;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class NullSchema extends base_1.BaseSchema {
    _type = 'null';
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'null') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                message: `Expected null, received ${parsedType}`,
                expected: 'null',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return null;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
exports.NullSchema = NullSchema;
exports.null = NullSchema;
function nullSchema() {
    return new NullSchema();
}
//# sourceMappingURL=null.js.map