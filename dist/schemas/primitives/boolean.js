"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanSchema = void 0;
exports.boolean = boolean;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class BooleanSchema extends base_1.BaseSchema {
    _type = 'boolean';
    _coerce;
    constructor(options = {}) {
        super();
        this._coerce = options.coerce || false;
    }
    _parse(input, ctx) {
        if (this._coerce) {
            input = Boolean(input);
        }
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'boolean') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                message: `Expected boolean, received ${parsedType}`,
                expected: 'boolean',
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
exports.BooleanSchema = BooleanSchema;
function boolean(options) {
    return new BooleanSchema(options);
}
//# sourceMappingURL=boolean.js.map