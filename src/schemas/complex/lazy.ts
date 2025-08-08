import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';

export class LazySchema<T> extends BaseSchema<T, T> {
  readonly _type = 'lazy';
  private _getter: () => SchemaDefinition<T, T>;
  private _cached?: SchemaDefinition<T, T>;

  constructor(getter: () => SchemaDefinition<T, T>) {
    super();
    this._getter = getter;
  }

  private get schema(): SchemaDefinition<T, T> {
    if (!this._cached) {
      this._cached = this._getter();
    }
    return this._cached;
  }

  _parse(input: unknown, ctx: ParseContext): T {
    return (this.schema as any)._parse(input, ctx);
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<T> {
    return (this.schema as any)._parseAsync(input, ctx);
  }
}

export function lazy<T>(getter: () => SchemaDefinition<T, T>): LazySchema<T> {
  return new LazySchema(getter);
}