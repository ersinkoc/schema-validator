"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnySchema = void 0;
exports.any = any;
const base_1 = require("../../types/base");
class AnySchema extends base_1.BaseSchema {
    _type = 'any';
    _parse(input, _ctx) {
        return input;
    }
    async _parseAsync(input, _ctx) {
        return input;
    }
}
exports.AnySchema = AnySchema;
function any() {
    return new AnySchema();
}
//# sourceMappingURL=any.js.map