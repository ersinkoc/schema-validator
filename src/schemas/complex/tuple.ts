import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

type TupleItems = readonly [SchemaDefinition<any, any>, ...SchemaDefinition<any, any>[]];
type TupleRestItem = SchemaDefinition<any, any> | null;

type InferTupleInput<T extends TupleItems, Rest extends TupleRestItem> = Rest extends SchemaDefinition<any, any>
  ? [...{ [K in keyof T]: T[K]['_input'] }, ...Rest['_input'][]]
  : { [K in keyof T]: T[K]['_input'] };

type InferTupleOutput<T extends TupleItems, Rest extends TupleRestItem> = Rest extends SchemaDefinition<any, any>
  ? [...{ [K in keyof T]: T[K]['_output'] }, ...Rest['_output'][]]
  : { [K in keyof T]: T[K]['_output'] };

export class TupleSchema<
  T extends TupleItems,
  Rest extends TupleRestItem = null
> extends BaseSchema<InferTupleInput<T, Rest>, InferTupleOutput<T, Rest>> {
  readonly _type = 'tuple';
  private _items: T;
  private _rest: Rest;

  constructor(items: T, rest: Rest = null as Rest) {
    super();
    this._items = items;
    this._rest = rest;
  }

  _parse(input: unknown, ctx: ParseContext): InferTupleOutput<T, Rest> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'array') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'array',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const arr = input as any[];
    const result: any[] = [];

    if (this._rest === null) {
      if (arr.length !== this._items.length) {
        ctx.addIssue({
          code: arr.length > this._items.length ? ErrorCode.TOO_BIG : ErrorCode.TOO_SMALL,
          message: `Expected array of length ${this._items.length}, received ${arr.length}`,
          options: {
            type: 'array',
            [arr.length > this._items.length ? 'maximum' : 'minimum']: this._items.length,
            inclusive: true
          }
        });
      }
    } else {
      if (arr.length < this._items.length) {
        ctx.addIssue({
          code: ErrorCode.TOO_SMALL,
          message: `Expected array of at least ${this._items.length} elements, received ${arr.length}`,
          options: {
            type: 'array',
            minimum: this._items.length,
            inclusive: true
          }
        });
      }
    }

    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i];
      const value = arr[i];
      const childCtx = ctx.child(i, value);
      
      try {
        const parsed = (item as any)._parse(value, childCtx);
        result.push(parsed);
      } catch (error) {
        if (!ctx.common.async) {
          throw ctx.makeError();
        }
      }
    }

    if (this._rest !== null) {
      for (let i = this._items.length; i < arr.length; i++) {
        const value = arr[i];
        const childCtx = ctx.child(i, value);
        
        try {
          const parsed = (this._rest as any)._parse(value, childCtx);
          result.push(parsed);
        } catch (error) {
          if (!ctx.common.async) {
            throw ctx.makeError();
          }
        }
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result as InferTupleOutput<T, Rest>;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<InferTupleOutput<T, Rest>> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'array') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'array',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const arr = input as any[];
    const result: any[] = [];

    if (this._rest === null) {
      if (arr.length !== this._items.length) {
        ctx.addIssue({
          code: arr.length > this._items.length ? ErrorCode.TOO_BIG : ErrorCode.TOO_SMALL,
          message: `Expected array of length ${this._items.length}, received ${arr.length}`,
          options: {
            type: 'array',
            [arr.length > this._items.length ? 'maximum' : 'minimum']: this._items.length,
            inclusive: true
          }
        });
      }
    } else {
      if (arr.length < this._items.length) {
        ctx.addIssue({
          code: ErrorCode.TOO_SMALL,
          message: `Expected array of at least ${this._items.length} elements, received ${arr.length}`,
          options: {
            type: 'array',
            minimum: this._items.length,
            inclusive: true
          }
        });
      }
    }

    const promises: Promise<any>[] = [];

    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i];
      const value = arr[i];
      const childCtx = ctx.child(i, value);
      promises.push((item as any)._parseAsync(value, childCtx));
    }

    if (this._rest !== null) {
      for (let i = this._items.length; i < arr.length; i++) {
        const value = arr[i];
        const childCtx = ctx.child(i, value);
        promises.push((this._rest as any)._parseAsync(value, childCtx));
      }
    }

    const results = await Promise.allSettled(promises);
    for (const res of results) {
      if (res.status === 'fulfilled') {
        result.push(res.value);
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result as InferTupleOutput<T, Rest>;
  }

  rest<R extends SchemaDefinition<any, any>>(schema: R): TupleSchema<T, R> {
    return new TupleSchema(this._items, schema);
  }

  get items(): T {
    return this._items;
  }
}

export function tuple<T extends TupleItems>(
  items: T
): TupleSchema<T, null> {
  return new TupleSchema(items);
}