"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreprocessSchema = void 0;
exports.preprocess = preprocess;
const base_1 = require("../../types/base");
class PreprocessSchema extends base_1.BaseSchema {
    _type = 'preprocess';
    _preprocessor;
    _schema;
    constructor(preprocessor, schema) {
        super();
        this._preprocessor = preprocessor;
        this._schema = schema;
    }
    _parse(input, ctx) {
        let preprocessed;
        try {
            preprocessed = this._preprocessor(input);
        }
        catch (error) {
            ctx.addIssue({
                code: 'custom',
                message: `Preprocessing failed: ${error instanceof Error ? error.message : String(error)}`
            });
            throw ctx.makeError();
        }
        return this._schema._parse(preprocessed, ctx);
    }
    async _parseAsync(input, ctx) {
        let preprocessed;
        try {
            preprocessed = await Promise.resolve(this._preprocessor(input));
        }
        catch (error) {
            ctx.addIssue({
                code: 'custom',
                message: `Preprocessing failed: ${error instanceof Error ? error.message : String(error)}`
            });
            throw ctx.makeError();
        }
        return this._schema._parseAsync(preprocessed, ctx);
    }
}
exports.PreprocessSchema = PreprocessSchema;
function preprocess(preprocessor, schema) {
    return new PreprocessSchema(preprocessor, schema);
}
//# sourceMappingURL=preprocess.js.map