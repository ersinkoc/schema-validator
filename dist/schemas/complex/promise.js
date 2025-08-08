"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseSchema = void 0;
exports.promise = promise;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class PromiseSchema extends base_1.BaseSchema {
    _type = 'promise';
    _schema;
    constructor(schema) {
        super();
        this._schema = schema;
    }
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'promise') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                expected: 'Promise',
                received: parsedType
            });
            throw ctx.makeError();
        }
        return input.then(value => {
            return this._schema._parse(value, ctx);
        });
    }
    async _parseAsync(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'promise') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                expected: 'Promise',
                received: parsedType
            });
            throw ctx.makeError();
        }
        // Return a promise that validates the resolved value
        return input.then(async (value) => {
            return this._schema._parseAsync(value, ctx);
        });
    }
    get schema() {
        return this._schema;
    }
}
exports.PromiseSchema = PromiseSchema;
function promise(schema) {
    return new PromiseSchema(schema);
}
//# sourceMappingURL=promise.js.map