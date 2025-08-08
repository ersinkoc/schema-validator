"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorMap = exports.ErrorCode = void 0;
exports.getParsedType = getParsedType;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_TYPE"] = "invalid_type";
    ErrorCode["INVALID_LITERAL"] = "invalid_literal";
    ErrorCode["CUSTOM"] = "custom";
    ErrorCode["INVALID_UNION"] = "invalid_union";
    ErrorCode["INVALID_UNION_DISCRIMINATOR"] = "invalid_union_discriminator";
    ErrorCode["INVALID_ENUM_VALUE"] = "invalid_enum_value";
    ErrorCode["UNRECOGNIZED_KEYS"] = "unrecognized_keys";
    ErrorCode["INVALID_ARGUMENTS"] = "invalid_arguments";
    ErrorCode["INVALID_RETURN_TYPE"] = "invalid_return_type";
    ErrorCode["INVALID_DATE"] = "invalid_date";
    ErrorCode["INVALID_STRING"] = "invalid_string";
    ErrorCode["TOO_SMALL"] = "too_small";
    ErrorCode["TOO_BIG"] = "too_big";
    ErrorCode["INVALID_INTERSECTION_TYPES"] = "invalid_intersection_types";
    ErrorCode["NOT_MULTIPLE_OF"] = "not_multiple_of";
    ErrorCode["NOT_FINITE"] = "not_finite";
    ErrorCode["INVALID_REGEX"] = "invalid_regex";
    ErrorCode["INVALID_EMAIL"] = "invalid_email";
    ErrorCode["INVALID_URL"] = "invalid_url";
    ErrorCode["INVALID_UUID"] = "invalid_uuid";
    ErrorCode["INVALID_CUID"] = "invalid_cuid";
    ErrorCode["INVALID_DATETIME"] = "invalid_datetime";
    ErrorCode["INVALID_IP"] = "invalid_ip";
    ErrorCode["INVALID_JSON"] = "invalid_json";
    ErrorCode["INVALID_BASE64"] = "invalid_base64";
    ErrorCode["REQUIRED"] = "required";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
const defaultErrorMap = (ctx) => {
    switch (ctx.code) {
        case ErrorCode.INVALID_TYPE:
            return `Expected ${ctx.expected}, received ${ctx.received}`;
        case ErrorCode.INVALID_LITERAL:
            return `Invalid literal value, expected ${JSON.stringify(ctx.expected)}`;
        case ErrorCode.UNRECOGNIZED_KEYS:
            return `Unrecognized key(s) in object: ${ctx.options?.['keys']?.join(', ')}`;
        case ErrorCode.INVALID_UNION:
            return 'Invalid input';
        case ErrorCode.INVALID_UNION_DISCRIMINATOR:
            return `Invalid discriminator value. Expected ${ctx.options?.['expected']?.join(' | ')}`;
        case ErrorCode.INVALID_ENUM_VALUE:
            return `Invalid enum value. Expected ${ctx.options?.['expected']?.join(' | ')}, received '${ctx.received}'`;
        case ErrorCode.INVALID_ARGUMENTS:
            return 'Invalid function arguments';
        case ErrorCode.INVALID_RETURN_TYPE:
            return 'Invalid function return type';
        case ErrorCode.INVALID_DATE:
            return 'Invalid date';
        case ErrorCode.INVALID_STRING:
            return ctx.message || 'Invalid string';
        case ErrorCode.TOO_SMALL:
            if (ctx.options?.['type'] === 'array') {
                return `Array must contain ${ctx.options['inclusive'] ? 'at least' : 'more than'} ${ctx.options['minimum']} element(s)`;
            }
            else if (ctx.options?.['type'] === 'string') {
                return `String must contain ${ctx.options['inclusive'] ? 'at least' : 'more than'} ${ctx.options['minimum']} character(s)`;
            }
            else if (ctx.options?.['type'] === 'number') {
                return `Number must be ${ctx.options['inclusive'] ? 'greater than or equal to' : 'greater than'} ${ctx.options['minimum']}`;
            }
            else if (ctx.options?.['type'] === 'date') {
                return `Date must be ${ctx.options['inclusive'] ? 'greater than or equal to' : 'greater than'} ${new Date(ctx.options['minimum']).toISOString()}`;
            }
            else {
                return 'Too small';
            }
        case ErrorCode.TOO_BIG:
            if (ctx.options?.['type'] === 'array') {
                return `Array must contain ${ctx.options['inclusive'] ? 'at most' : 'less than'} ${ctx.options['maximum']} element(s)`;
            }
            else if (ctx.options?.['type'] === 'string') {
                return `String must contain ${ctx.options['inclusive'] ? 'at most' : 'less than'} ${ctx.options['maximum']} character(s)`;
            }
            else if (ctx.options?.['type'] === 'number') {
                return `Number must be ${ctx.options['inclusive'] ? 'less than or equal to' : 'less than'} ${ctx.options['maximum']}`;
            }
            else if (ctx.options?.['type'] === 'date') {
                return `Date must be ${ctx.options['inclusive'] ? 'less than or equal to' : 'less than'} ${new Date(ctx.options['maximum']).toISOString()}`;
            }
            else {
                return 'Too big';
            }
        case ErrorCode.NOT_MULTIPLE_OF:
            return `Number must be a multiple of ${ctx.options?.['multipleOf']}`;
        case ErrorCode.NOT_FINITE:
            return 'Number must be finite';
        case ErrorCode.INVALID_REGEX:
            return 'Invalid regular expression';
        case ErrorCode.INVALID_EMAIL:
            return 'Invalid email';
        case ErrorCode.INVALID_URL:
            return 'Invalid URL';
        case ErrorCode.INVALID_UUID:
            return 'Invalid UUID';
        case ErrorCode.INVALID_CUID:
            return 'Invalid CUID';
        case ErrorCode.INVALID_DATETIME:
            return 'Invalid datetime string';
        case ErrorCode.INVALID_IP:
            return `Invalid IP address (version ${ctx.options?.['version'] || 'unknown'})`;
        case ErrorCode.INVALID_JSON:
            return 'Invalid JSON';
        case ErrorCode.INVALID_BASE64:
            return 'Invalid base64 string';
        case ErrorCode.REQUIRED:
            return 'Required';
        case ErrorCode.CUSTOM:
        default:
            return ctx.message || 'Invalid input';
    }
};
exports.defaultErrorMap = defaultErrorMap;
function getParsedType(data) {
    const type = typeof data;
    switch (type) {
        case 'undefined':
            return 'undefined';
        case 'string':
            return 'string';
        case 'number':
            return isNaN(data) ? 'unknown' : 'number';
        case 'boolean':
            return 'boolean';
        case 'function':
            return 'function';
        case 'bigint':
            return 'bigint';
        case 'symbol':
            return 'symbol';
        case 'object':
            if (data === null) {
                return 'null';
            }
            if (Array.isArray(data)) {
                return 'array';
            }
            if (data instanceof Date) {
                return 'date';
            }
            if (data instanceof Map) {
                return 'map';
            }
            if (data instanceof Set) {
                return 'set';
            }
            if (data instanceof Promise) {
                return 'promise';
            }
            return 'object';
        default:
            return 'unknown';
    }
}
//# sourceMappingURL=errors.js.map