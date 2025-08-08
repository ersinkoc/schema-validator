import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class MapSchema<K, V> extends BaseSchema<Map<K, V>, Map<K, V>> {
  readonly _type = 'map';
  private _keySchema: SchemaDefinition<any, K>;
  private _valueSchema: SchemaDefinition<any, V>;

  constructor(keySchema: SchemaDefinition<any, K>, valueSchema: SchemaDefinition<any, V>) {
    super();
    this._keySchema = keySchema;
    this._valueSchema = valueSchema;
  }

  _parse(input: unknown, ctx: ParseContext): Map<K, V> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'map') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'Map',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const inputMap = input as Map<unknown, unknown>;
    const result = new Map<K, V>();

    let index = 0;
    for (const [key, value] of inputMap) {
      const keyCtx = ctx.child(`[${index}].key`, key);
      const valueCtx = ctx.child(`[${index}].value`, value);
      
      try {
        const parsedKey = (this._keySchema as any)._parse(key, keyCtx);
        const parsedValue = (this._valueSchema as any)._parse(value, valueCtx);
        result.set(parsedKey, parsedValue);
      } catch (error) {
        if (!ctx.common.async) {
          throw ctx.makeError();
        }
      }
      index++;
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<Map<K, V>> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'map') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'Map',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const inputMap = input as Map<unknown, unknown>;
    const result = new Map<K, V>();
    const promises: Promise<[K, V]>[] = [];

    let index = 0;
    for (const [key, value] of inputMap) {
      const keyCtx = ctx.child(`[${index}].key`, key);
      const valueCtx = ctx.child(`[${index}].value`, value);
      
      promises.push(
        Promise.all([
          (this._keySchema as any)._parseAsync(key, keyCtx),
          (this._valueSchema as any)._parseAsync(value, valueCtx)
        ])
      );
      index++;
    }

    const results = await Promise.allSettled(promises);
    for (const res of results) {
      if (res.status === 'fulfilled') {
        const [key, value] = res.value;
        result.set(key, value);
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result;
  }

  get keySchema(): SchemaDefinition<any, K> {
    return this._keySchema;
  }

  get valueSchema(): SchemaDefinition<any, V> {
    return this._valueSchema;
  }
}

export function map<K, V>(
  keySchema: SchemaDefinition<any, K>,
  valueSchema: SchemaDefinition<any, V>
): MapSchema<K, V> {
  return new MapSchema(keySchema, valueSchema);
}