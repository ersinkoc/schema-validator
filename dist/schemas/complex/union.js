"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionSchema = void 0;
exports.union = union;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class UnionSchema extends base_1.BaseSchema {
    _type = 'union';
    _unionOptions;
    constructor(options) {
        super();
        this._unionOptions = options;
    }
    _parse(input, ctx) {
        const issues = [];
        for (const option of this._unionOptions) {
            const result = option.safeParse(input);
            if (result.success) {
                return result.data;
            }
            else {
                issues.push({
                    schema: option,
                    issues: result.error.issues
                });
            }
        }
        ctx.addIssue({
            code: errors_1.ErrorCode.INVALID_UNION,
            message: `Invalid union: no matching option`,
            options: {
                unionErrors: issues
            }
        });
        throw ctx.makeError();
    }
    async _parseAsync(input, ctx) {
        const issues = [];
        for (const option of this._unionOptions) {
            const result = await option.safeParseAsync(input);
            if (result.success) {
                return result.data;
            }
            else {
                issues.push({
                    schema: option,
                    issues: result.error.issues
                });
            }
        }
        ctx.addIssue({
            code: errors_1.ErrorCode.INVALID_UNION,
            message: `Invalid union: no matching option`,
            options: {
                unionErrors: issues
            }
        });
        throw ctx.makeError();
    }
    get options() {
        return this._unionOptions;
    }
}
exports.UnionSchema = UnionSchema;
function union(options) {
    return new UnionSchema(options);
}
//# sourceMappingURL=union.js.map