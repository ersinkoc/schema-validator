"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectsSchema = void 0;
exports.effects = effects;
const base_1 = require("../../types/base");
class EffectsSchema extends base_1.BaseSchema {
    _type = 'effects';
    _schema;
    _effect;
    constructor(schema, effect) {
        super();
        this._schema = schema;
        this._effect = effect;
    }
    _parse(input, ctx) {
        const result = this._schema._parse(input, ctx);
        if (!ctx.hasIssues) {
            this._effect(result, ctx);
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        const result = await this._schema._parseAsync(input, ctx);
        if (!ctx.hasIssues) {
            await this._effect(result, ctx);
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return result;
    }
}
exports.EffectsSchema = EffectsSchema;
function effects(schema, effect) {
    return new EffectsSchema(schema, effect);
}
//# sourceMappingURL=effects.js.map