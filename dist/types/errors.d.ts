export declare enum ErrorCode {
    INVALID_TYPE = "invalid_type",
    INVALID_LITERAL = "invalid_literal",
    CUSTOM = "custom",
    INVALID_UNION = "invalid_union",
    INVALID_UNION_DISCRIMINATOR = "invalid_union_discriminator",
    INVALID_ENUM_VALUE = "invalid_enum_value",
    UNRECOGNIZED_KEYS = "unrecognized_keys",
    INVALID_ARGUMENTS = "invalid_arguments",
    INVALID_RETURN_TYPE = "invalid_return_type",
    INVALID_DATE = "invalid_date",
    INVALID_STRING = "invalid_string",
    TOO_SMALL = "too_small",
    TOO_BIG = "too_big",
    INVALID_INTERSECTION_TYPES = "invalid_intersection_types",
    NOT_MULTIPLE_OF = "not_multiple_of",
    NOT_FINITE = "not_finite",
    INVALID_REGEX = "invalid_regex",
    INVALID_EMAIL = "invalid_email",
    INVALID_URL = "invalid_url",
    INVALID_UUID = "invalid_uuid",
    INVALID_CUID = "invalid_cuid",
    INVALID_DATETIME = "invalid_datetime",
    INVALID_IP = "invalid_ip",
    INVALID_JSON = "invalid_json",
    INVALID_BASE64 = "invalid_base64",
    REQUIRED = "required"
}
export interface ErrorMapCtx {
    code: ErrorCode;
    message?: string;
    path: (string | number)[];
    input: any;
    expected?: string;
    received?: string;
    options?: Record<string, any>;
}
export type ErrorMap = (ctx: ErrorMapCtx) => string;
export declare const defaultErrorMap: ErrorMap;
export type ParsedType = 'string' | 'number' | 'bigint' | 'boolean' | 'date' | 'symbol' | 'function' | 'undefined' | 'null' | 'array' | 'object' | 'unknown' | 'promise' | 'void' | 'never' | 'map' | 'set';
export declare function getParsedType(data: any): ParsedType;
//# sourceMappingURL=errors.d.ts.map