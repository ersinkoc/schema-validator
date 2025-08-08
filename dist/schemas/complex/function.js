"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionSchema = void 0;
exports.functionSchema = functionSchema;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class FunctionSchema extends base_1.BaseSchema {
    _type = 'function';
    _args;
    _returns;
    _implement;
    constructor(args, returns) {
        super();
        this._args = args;
        this._returns = returns;
    }
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'function') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                expected: 'function',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const fn = input;
        // If we have an implementation function, validate it
        if (this._implement) {
            // Create a wrapper function that validates args and return value
            return (...args) => {
                // Validate arguments
                if (this._args) {
                    for (let i = 0; i < this._args.length; i++) {
                        const argSchema = this._args[i];
                        const argValue = args[i];
                        const argCtx = ctx.child(`arg[${i}]`, argValue);
                        argSchema._parse(argValue, argCtx);
                    }
                }
                // Call the function
                const result = fn(...args);
                // Validate return value
                if (this._returns) {
                    const returnCtx = ctx.child('return', result);
                    return this._returns._parse(result, returnCtx);
                }
                return result;
            };
        }
        return fn;
    }
    async _parseAsync(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'function') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                expected: 'function',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const fn = input;
        // If we have an implementation function, validate it
        if (this._implement) {
            // Create a wrapper function that validates args and return value
            return async (...args) => {
                // Validate arguments
                if (this._args) {
                    for (let i = 0; i < this._args.length; i++) {
                        const argSchema = this._args[i];
                        const argValue = args[i];
                        const argCtx = ctx.child(`arg[${i}]`, argValue);
                        await argSchema._parseAsync(argValue, argCtx);
                    }
                }
                // Call the function
                const result = await fn(...args);
                // Validate return value
                if (this._returns) {
                    const returnCtx = ctx.child('return', result);
                    return await this._returns._parseAsync(result, returnCtx);
                }
                return result;
            };
        }
        return fn;
    }
    args(...schemas) {
        return new FunctionSchema(schemas, this._returns);
    }
    returns(schema) {
        return new FunctionSchema(this._args, schema);
    }
    implement(fn) {
        const schema = Object.create(this);
        schema._implement = fn;
        return schema;
    }
}
exports.FunctionSchema = FunctionSchema;
function functionSchema() {
    return new FunctionSchema();
}
//# sourceMappingURL=function.js.map