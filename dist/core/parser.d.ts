import { ValidationError, ValidationIssue, RefinementCtx } from '../types/base';
import { getParsedType, defaultErrorMap } from '../types/errors';
export interface ParseContext extends RefinementCtx {
    common: {
        issues: ValidationIssue[];
        async: boolean;
        errorMap: typeof defaultErrorMap;
        contextualErrorMap?: typeof defaultErrorMap;
    };
    parsedType: ReturnType<typeof getParsedType>;
    schemaErrorMap?: typeof defaultErrorMap;
    parent?: any;
    data: any;
    child(key: string | number, data: any): ParseContext;
    makeError(): ValidationError;
    hasIssues: boolean;
}
export declare class ParseContextImpl implements ParseContext {
    common: ParseContext['common'];
    path: (string | number)[];
    parsedType: ReturnType<typeof getParsedType>;
    schemaErrorMap?: typeof defaultErrorMap;
    parent?: any;
    data: any;
    constructor(data: any, path?: (string | number)[], parent?: any, errorMap?: typeof defaultErrorMap, async?: boolean);
    addIssue(issue: Omit<ValidationIssue, 'path'>): void;
    clone(data?: any, path?: (string | number)[]): ParseContext;
    child(key: string | number, data: any): ParseContext;
    setAsync(): void;
    get hasIssues(): boolean;
    get issues(): ValidationIssue[];
    makeError(): ValidationError;
}
export type ParseInput = {
    data: any;
    path?: (string | number)[];
    parent?: any;
    errorMap?: typeof defaultErrorMap;
    async?: boolean;
};
export type ParseReturnType<T> = {
    status: 'ok';
    value: T;
} | {
    status: 'error';
    error: ValidationError;
};
export type ParsePathComponent = string | number;
export declare function createParser<T>(parseFunction: (data: any, ctx: ParseContext) => T): (input: ParseInput) => ParseReturnType<T>;
export declare function createAsyncParser<T>(parseFunction: (data: any, ctx: ParseContext) => Promise<T>): Promise<(input: ParseInput) => Promise<ParseReturnType<T>>>;
export declare function mergeResults<T>(results: ParseReturnType<T>[]): ParseReturnType<T[]>;
//# sourceMappingURL=parser.d.ts.map