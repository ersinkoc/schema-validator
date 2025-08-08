"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazySchema = void 0;
exports.lazy = lazy;
const base_1 = require("../../types/base");
class LazySchema extends base_1.BaseSchema {
    _type = 'lazy';
    _getter;
    _cached;
    constructor(getter) {
        super();
        this._getter = getter;
    }
    get schema() {
        if (!this._cached) {
            this._cached = this._getter();
        }
        return this._cached;
    }
    _parse(input, ctx) {
        return this.schema._parse(input, ctx);
    }
    async _parseAsync(input, ctx) {
        return this.schema._parseAsync(input, ctx);
    }
}
exports.LazySchema = LazySchema;
function lazy(getter) {
    return new LazySchema(getter);
}
//# sourceMappingURL=lazy.js.map