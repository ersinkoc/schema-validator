import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class UndefinedSchema extends BaseSchema<undefined, undefined> {
    readonly _type = "undefined";
    _parse(input: unknown, ctx: ParseContext): undefined;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<undefined>;
}
export { UndefinedSchema as undefined };
export declare function undefinedSchema(): UndefinedSchema;
//# sourceMappingURL=undefined.d.ts.map