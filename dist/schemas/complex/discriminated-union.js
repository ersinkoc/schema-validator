"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscriminatedUnionSchema = void 0;
exports.discriminatedUnion = discriminatedUnion;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class DiscriminatedUnionSchema extends base_1.BaseSchema {
    _type = 'discriminatedUnion';
    _discriminator;
    _unionOptions;
    _optionsByDiscriminator;
    constructor(discriminator, options) {
        super();
        this._discriminator = discriminator;
        this._unionOptions = options;
        this._optionsByDiscriminator = new Map();
        // Build lookup map for fast discrimination
        for (const option of options) {
            const shape = option.shape;
            const discriminatorSchema = shape[discriminator];
            if (!discriminatorSchema) {
                throw new Error(`Discriminator "${discriminator}" not found in option schema`);
            }
            // Extract the literal value from the discriminator schema
            const literalValue = this.extractLiteralValue(discriminatorSchema);
            if (literalValue !== undefined) {
                this._optionsByDiscriminator.set(literalValue, option);
            }
        }
    }
    extractLiteralValue(schema) {
        // Check if it's a literal schema
        if ('value' in schema && typeof schema.value !== 'function') {
            return schema.value;
        }
        // For complex schemas, try to extract the expected value
        if (schema._type === 'literal' && 'value' in schema) {
            return schema.value;
        }
        return undefined;
    }
    _parse(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                message: `Expected object, received ${parsedType}`,
                expected: 'object',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const obj = input;
        const discriminatorValue = obj[this._discriminator];
        const option = this._optionsByDiscriminator.get(discriminatorValue);
        if (!option) {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_UNION_DISCRIMINATOR,
                message: `Invalid discriminator value`,
                options: {
                    expected: Array.from(this._optionsByDiscriminator.keys()),
                    received: discriminatorValue
                }
            });
            throw ctx.makeError();
        }
        return option._parse(input, ctx);
    }
    async _parseAsync(input, ctx) {
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'object') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                message: `Expected object, received ${parsedType}`,
                expected: 'object',
                received: parsedType
            });
            throw ctx.makeError();
        }
        const obj = input;
        const discriminatorValue = obj[this._discriminator];
        const option = this._optionsByDiscriminator.get(discriminatorValue);
        if (!option) {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_UNION_DISCRIMINATOR,
                message: `Invalid discriminator value`,
                options: {
                    expected: Array.from(this._optionsByDiscriminator.keys()),
                    received: discriminatorValue
                }
            });
            throw ctx.makeError();
        }
        return option._parseAsync(input, ctx);
    }
    get discriminator() {
        return this._discriminator;
    }
    get options() {
        return this._unionOptions;
    }
}
exports.DiscriminatedUnionSchema = DiscriminatedUnionSchema;
function discriminatedUnion(discriminator, options) {
    return new DiscriminatedUnionSchema(discriminator, options);
}
//# sourceMappingURL=discriminated-union.js.map