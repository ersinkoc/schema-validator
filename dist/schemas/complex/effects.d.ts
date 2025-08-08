import { BaseSchema, SchemaDefinition, RefinementCtx } from '../../types/base';
import { ParseContext } from '../../core/parser';
export type EffectCallback<T> = (value: T, ctx: RefinementCtx & {
    addIssue: (issue: any) => void;
    path: (string | number)[];
}) => void | Promise<void>;
export declare class EffectsSchema<Input, Output> extends BaseSchema<Input, Output> {
    readonly _type = "effects";
    private _schema;
    private _effect;
    constructor(schema: SchemaDefinition<Input, Output>, effect: EffectCallback<Output>);
    _parse(input: unknown, ctx: ParseContext): Output;
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Output>;
}
export declare function effects<Input, Output>(schema: SchemaDefinition<Input, Output>, effect: EffectCallback<Output>): EffectsSchema<Input, Output>;
//# sourceMappingURL=effects.d.ts.map