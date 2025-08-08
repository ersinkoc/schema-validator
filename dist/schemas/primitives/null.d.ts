import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class NullSchema extends BaseSchema<null, null> {
    readonly _type = "null";
    _parse(input: unknown, ctx: ParseContext): null;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<null>;
}
export { NullSchema as null };
export declare function nullSchema(): NullSchema;
//# sourceMappingURL=null.d.ts.map