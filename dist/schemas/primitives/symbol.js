"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolSchema = void 0;
exports.symbol = symbol;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class SymbolSchema extends base_1.BaseSchema {
    _type = 'symbol';
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'symbol') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                message: `Expected symbol, received ${parsedType}`,
                expected: 'symbol',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
}
exports.SymbolSchema = SymbolSchema;
function symbol() {
    return new SymbolSchema();
}
//# sourceMappingURL=symbol.js.map