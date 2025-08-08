"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownSchema = void 0;
exports.unknown = unknown;
const base_1 = require("../../types/base");
class UnknownSchema extends base_1.BaseSchema {
    _type = 'unknown';
    _parse(input, _ctx) {
        return input;
    }
    async _parseAsync(input, _ctx) {
        return input;
    }
}
exports.UnknownSchema = UnknownSchema;
function unknown() {
    return new UnknownSchema();
}
//# sourceMappingURL=unknown.js.map