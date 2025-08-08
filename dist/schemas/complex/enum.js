"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeEnumSchema = exports.EnumSchema = void 0;
exports.enumSchema = enumSchema;
exports.nativeEnum = nativeEnum;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class EnumSchema extends base_1.BaseSchema {
    _type = 'enum';
    _values;
    _enumValues;
    constructor(values) {
        super();
        this._values = values;
        this._enumValues = new Set(values);
    }
    _parse(input, ctx) {
        if (!this._enumValues.has(input)) {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_ENUM_VALUE,
                message: `Invalid enum value`,
                options: {
                    expected: Array.from(this._enumValues),
                    received: String(input)
                }
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    get values() {
        return this._values;
    }
    get options() {
        return Array.from(this._enumValues);
    }
}
exports.EnumSchema = EnumSchema;
function enumSchema(values) {
    return new EnumSchema(values);
}
// Native enum support
class NativeEnumSchema extends base_1.BaseSchema {
    _type = 'nativeEnum';
    _enum;
    _enumValues;
    constructor(enumObject) {
        super();
        this._enum = enumObject;
        // Extract enum values (handle both string and numeric enums)
        const values = new Set();
        for (const key in enumObject) {
            const value = enumObject[key];
            // For numeric enums, TypeScript creates reverse mappings
            // We need to filter those out
            if (typeof value === 'number' || typeof enumObject[value] !== 'number') {
                values.add(value);
            }
        }
        this._enumValues = values;
    }
    _parse(input, ctx) {
        if (!this._enumValues.has(input)) {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_ENUM_VALUE,
                message: `Invalid enum value`,
                options: {
                    expected: Array.from(this._enumValues),
                    received: String(input)
                }
            });
            throw ctx.makeError();
        }
        return input;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    get enum() {
        return this._enum;
    }
    get options() {
        return Array.from(this._enumValues);
    }
}
exports.NativeEnumSchema = NativeEnumSchema;
function nativeEnum(enumObject) {
    return new NativeEnumSchema(enumObject);
}
//# sourceMappingURL=enum.js.map