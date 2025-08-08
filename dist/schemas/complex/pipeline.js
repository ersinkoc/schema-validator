"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineSchema = void 0;
exports.pipeline = pipeline;
const base_1 = require("../../types/base");
class PipelineSchema extends base_1.BaseSchema {
    _type = 'pipeline';
    _schemas;
    constructor(schemas) {
        super();
        this._schemas = schemas;
    }
    _parse(input, ctx) {
        let result = input;
        for (const schema of this._schemas) {
            result = schema._parse(result, ctx);
            if (ctx.hasIssues) {
                throw ctx.makeError();
            }
        }
        return result;
    }
    async _parseAsync(input, ctx) {
        let result = input;
        for (const schema of this._schemas) {
            result = await schema._parseAsync(result, ctx);
            if (ctx.hasIssues) {
                throw ctx.makeError();
            }
        }
        return result;
    }
    get schemas() {
        return this._schemas;
    }
}
exports.PipelineSchema = PipelineSchema;
function pipeline(...schemas) {
    return new PipelineSchema(schemas);
}
//# sourceMappingURL=pipeline.js.map