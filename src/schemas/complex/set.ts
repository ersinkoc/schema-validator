import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class SetSchema<T> extends BaseSchema<Set<T>, Set<T>> {
  readonly _type = 'set';
  private _element: SchemaDefinition<any, T>;

  constructor(element: SchemaDefinition<any, T>) {
    super();
    this._element = element;
  }

  _parse(input: unknown, ctx: ParseContext): Set<T> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'set') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'Set',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const inputSet = input as Set<unknown>;
    const result = new Set<T>();

    let index = 0;
    for (const value of inputSet) {
      const childCtx = ctx.child(index, value);
      
      try {
        const parsed = (this._element as any)._parse(value, childCtx);
        result.add(parsed);
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

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<Set<T>> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'set') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'Set',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const inputSet = input as Set<unknown>;
    const result = new Set<T>();
    const promises: Promise<T>[] = [];

    let index = 0;
    for (const value of inputSet) {
      const childCtx = ctx.child(index, value);
      promises.push((this._element as any)._parseAsync(value, childCtx));
      index++;
    }

    const results = await Promise.allSettled(promises);
    for (const res of results) {
      if (res.status === 'fulfilled') {
        result.add(res.value);
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result;
  }

  get element(): SchemaDefinition<any, T> {
    return this._element;
  }
}

export function set<T>(element: SchemaDefinition<any, T>): SetSchema<T> {
  return new SetSchema(element);
}