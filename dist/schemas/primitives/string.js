"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringSchema = void 0;
exports.string = string;
const base_1 = require("../../types/base");
const errors_1 = require("../../types/errors");
class StringSchema extends base_1.BaseSchema {
    _type = 'string';
    _checks = [];
    _coerce;
    constructor(options = {}) {
        super();
        this._coerce = options.coerce || false;
    }
    _parse(input, ctx) {
        if (this._coerce) {
            input = String(input);
        }
        const parsedType = (0, errors_1.getParsedType)(input);
        if (parsedType !== 'string') {
            ctx.addIssue({
                code: errors_1.ErrorCode.INVALID_TYPE,
                message: `Expected string, received ${parsedType}`,
                expected: 'string',
                received: parsedType
            });
            throw ctx.makeError();
        }
        let value = input;
        for (const check of this._checks) {
            switch (check.kind) {
                case 'trim':
                    value = value.trim();
                    break;
                case 'toLowerCase':
                    value = value.toLowerCase();
                    break;
                case 'toUpperCase':
                    value = value.toUpperCase();
                    break;
                case 'min':
                    if (value.length < check.value) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.TOO_SMALL,
                            message: check.message,
                            options: {
                                type: 'string',
                                minimum: check.value,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'max':
                    if (value.length > check.value) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.TOO_BIG,
                            message: check.message,
                            options: {
                                type: 'string',
                                maximum: check.value,
                                inclusive: true
                            }
                        });
                    }
                    break;
                case 'length':
                    if (value.length !== check.value) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_STRING,
                            message: check.message || `String must be exactly ${check.value} characters`
                        });
                    }
                    break;
                case 'email':
                    if (!isValidEmail(value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_EMAIL,
                            message: check.message
                        });
                    }
                    break;
                case 'url':
                    if (!isValidUrl(value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_URL,
                            message: check.message
                        });
                    }
                    break;
                case 'uuid':
                    if (!isValidUuid(value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_UUID,
                            message: check.message
                        });
                    }
                    break;
                case 'cuid':
                    if (!isValidCuid(value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_CUID,
                            message: check.message
                        });
                    }
                    break;
                case 'regex':
                    if (!check.value.test(value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_STRING,
                            message: check.message || `String does not match pattern: ${check.value}`
                        });
                    }
                    break;
                case 'includes':
                    if (!value.includes(check.value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_STRING,
                            message: check.message || `String must include "${check.value}"`
                        });
                    }
                    break;
                case 'startsWith':
                    if (!value.startsWith(check.value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_STRING,
                            message: check.message || `String must start with "${check.value}"`
                        });
                    }
                    break;
                case 'endsWith':
                    if (!value.endsWith(check.value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_STRING,
                            message: check.message || `String must end with "${check.value}"`
                        });
                    }
                    break;
                case 'datetime':
                    if (!isValidDatetime(value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_DATETIME,
                            message: check.message
                        });
                    }
                    break;
                case 'ip':
                    const version = check.value || 'v4';
                    if (!isValidIp(value, version)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_IP,
                            message: check.message,
                            options: { version }
                        });
                    }
                    break;
                case 'base64':
                    if (!isValidBase64(value)) {
                        ctx.addIssue({
                            code: errors_1.ErrorCode.INVALID_BASE64,
                            message: check.message
                        });
                    }
                    break;
            }
        }
        if (ctx.hasIssues) {
            throw ctx.makeError();
        }
        return value;
    }
    async _parseAsync(input, ctx) {
        return this._parse(input, ctx);
    }
    min(length, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'min', value: length, message }];
        return schema;
    }
    max(length, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'max', value: length, message }];
        return schema;
    }
    length(length, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'length', value: length, message }];
        return schema;
    }
    email(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'email', message }];
        return schema;
    }
    url(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'url', message }];
        return schema;
    }
    uuid(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'uuid', message }];
        return schema;
    }
    cuid(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'cuid', message }];
        return schema;
    }
    regex(pattern, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'regex', value: pattern, message }];
        return schema;
    }
    includes(value, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'includes', value, message }];
        return schema;
    }
    startsWith(value, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'startsWith', value, message }];
        return schema;
    }
    endsWith(value, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'endsWith', value, message }];
        return schema;
    }
    datetime(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'datetime', message }];
        return schema;
    }
    ip(version, message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'ip', value: version, message }];
        return schema;
    }
    base64(message) {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'base64', message }];
        return schema;
    }
    trim() {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'trim' }];
        return schema;
    }
    toLowerCase() {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'toLowerCase' }];
        return schema;
    }
    toUpperCase() {
        const schema = Object.create(this);
        schema._checks = [...this._checks, { kind: 'toUpperCase' }];
        return schema;
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
exports.StringSchema = StringSchema;
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function isValidUuid(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
function isValidCuid(cuid) {
    const cuidRegex = /^c[a-z0-9]{24}$/;
    return cuidRegex.test(cuid);
}
function isValidDatetime(datetime) {
    const date = new Date(datetime);
    return !isNaN(date.getTime());
}
function isValidIp(ip, version) {
    if (version === 'v4') {
        const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(ip);
    }
    else {
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
        return ipv6Regex.test(ip);
    }
}
function isValidBase64(base64) {
    const base64Regex = /^[A-Za-z0-9+\/]*={0,2}$/;
    return base64Regex.test(base64) && base64.length % 4 === 0;
}
function string(options) {
    return new StringSchema(options);
}
//# sourceMappingURL=string.js.map