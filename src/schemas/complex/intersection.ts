import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ParseContext } from '../../core/parser';

export class IntersectionSchema<
  A extends SchemaDefinition<any, any>,
  B extends SchemaDefinition<any, any>
> extends BaseSchema<
  A['_input'] & B['_input'],
  A['_output'] & B['_output']
> {
  readonly _type = 'intersection';
  private _left: A;
  private _right: B;

  constructor(left: A, right: B) {
    super();
    this._left = left;
    this._right = right;
  }

  _parse(input: unknown, ctx: ParseContext): A['_output'] & B['_output'] {
    const leftResult = (this._left as any)._parse(input, ctx);
    const rightResult = (this._right as any)._parse(input, ctx);

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    // Merge results
    if (typeof leftResult === 'object' && typeof rightResult === 'object' && 
        leftResult !== null && rightResult !== null &&
        !Array.isArray(leftResult) && !Array.isArray(rightResult)) {
      return { ...leftResult, ...rightResult };
    }

    return rightResult;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<A['_output'] & B['_output']> {
    const [leftResult, rightResult] = await Promise.all([
      (this._left as any)._parseAsync(input, ctx),
      (this._right as any)._parseAsync(input, ctx)
    ]);

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    // Merge results
    if (typeof leftResult === 'object' && typeof rightResult === 'object' && 
        leftResult !== null && rightResult !== null &&
        !Array.isArray(leftResult) && !Array.isArray(rightResult)) {
      return { ...leftResult, ...rightResult };
    }

    return rightResult;
  }
}

export function intersection<
  A extends SchemaDefinition<any, any>,
  B extends SchemaDefinition<any, any>
>(left: A, right: B): IntersectionSchema<A, B> {
  return new IntersectionSchema(left, right);
}