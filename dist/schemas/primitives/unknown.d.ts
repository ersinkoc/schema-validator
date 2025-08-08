import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
export declare class UnknownSchema extends BaseSchema<unknown, unknown> {
    readonly _type = "unknown";
    _parse(input: unknown, _ctx: ParseContext): unknown;
    _parseAsync(input: unknown, _ctx: ParseContext): Promise<unknown>;
}
export declare function unknown(): UnknownSchema;
//# sourceMappingURL=unknown.d.ts.map