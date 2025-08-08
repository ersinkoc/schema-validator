"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntersectionSchema = void 0;
exports.intersection = intersection;
const base_1 = require("../../types/base");
class IntersectionSchema extends base_1.BaseSchema {
    _type = 'intersection';
    _left;
    _right;
    constructor(left, right) {
        super();
        this._left = left;
        this._right = right;
    }
    _parse(input, ctx) {
        const leftResult = this._left._parse(input, ctx);
        const rightResult = this._right._parse(input, ctx);
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        // Merge results
        if (typeof leftResult === 'object' && typeof rightResult === 'object' &&
            leftResult !== null && rightResult !== null &&
            !Array.isArray(leftResult) && !Array.isArray(rightResult)) {
            return { ...leftResult, ...rightResult };
        }
        return rightResult;
    }
    async _parseAsync(input, ctx) {
        const [leftResult, rightResult] = await Promise.all([
            this._left._parseAsync(input, ctx),
            this._right._parseAsync(input, ctx)
        ]);
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        // Merge results
        if (typeof leftResult === 'object' && typeof rightResult === 'object' &&
            leftResult !== null && rightResult !== null &&
            !Array.isArray(leftResult) && !Array.isArray(rightResult)) {
            return { ...leftResult, ...rightResult };
        }
        return rightResult;
    }
}
exports.IntersectionSchema = IntersectionSchema;
function intersection(left, right) {
    return new IntersectionSchema(left, right);
}
//# sourceMappingURL=intersection.js.map