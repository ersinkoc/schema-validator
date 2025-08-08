"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.undefined = exports.UndefinedSchema = void 0;
exports.undefinedSchema = undefinedSchema;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class UndefinedSchema extends base_1.BaseSchema {
    _type = 'undefined';
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'undefined') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                message: `Expected undefined, received ${parsedType}`,
                expected: 'undefined',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return undefined;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
exports.UndefinedSchema = UndefinedSchema;
exports.undefined = UndefinedSchema;
function undefinedSchema() {
    return new UndefinedSchema();
}
//# sourceMappingURL=undefined.js.map