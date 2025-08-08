"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.void = exports.VoidSchema = void 0;
exports.voidSchema = voidSchema;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class VoidSchema extends base_1.BaseSchema {
    _type = 'void';
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'undefined') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                message: `Expected void, received ${parsedType}`,
                expected: 'void',
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
exports.VoidSchema = VoidSchema;
exports.void = VoidSchema;
function voidSchema() {
    return new VoidSchema();
}
//# sourceMappingURL=void.js.map