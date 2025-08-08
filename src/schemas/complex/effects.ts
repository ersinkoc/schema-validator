import { BaseSchema, SchemaDefinition, RefinementCtx } from '../../types/base';
import { ParseContext } from '../../core/parser';

export type EffectCallback<T> = (
  value: T,
  ctx: RefinementCtx & {
    addIssue: (issue: any) => void;
    path: (string | number)[];
  }
) => void | Promise<void>;

export class EffectsSchema<Input, Output> extends BaseSchema<Input, Output> {
  readonly _type = 'effects';
  private _schema: SchemaDefinition<Input, Output>;
  private _effect: EffectCallback<Output>;

  constructor(
    schema: SchemaDefinition<Input, Output>,
    effect: EffectCallback<Output>
  ) {
    super();
    this._schema = schema;
    this._effect = effect;
  }

  _parse(input: unknown, ctx: ParseContext): Output {
    const result = (this._schema as any)._parse(input, ctx);
    
    if (!ctx.hasIssues) {
      this._effect(result, ctx);
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<Output> {
    const result = await (this._schema as any)._parseAsync(input, ctx);
    
    if (!ctx.hasIssues) {
      await this._effect(result, ctx);
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result;
  }
}

export function effects<Input, Output>(
  schema: SchemaDefinition<Input, Output>,
  effect: EffectCallback<Output>
): EffectsSchema<Input, Output> {
  return new EffectsSchema(schema, effect);
}