import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class FunctionSchema<
  Args extends readonly SchemaDefinition<any, any>[],
  Returns extends SchemaDefinition<any, any> | undefined = undefined
> extends BaseSchema<
  (...args: { [K in keyof Args]: Args[K]['_input'] }) => Returns extends SchemaDefinition<any, any> ? Returns['_output'] : any,
  (...args: { [K in keyof Args]: Args[K]['_input'] }) => Returns extends SchemaDefinition<any, any> ? Returns['_output'] : any
> {
  readonly _type = 'function';
  private _args?: Args;
  private _returns?: Returns;
  private _implement?: Function;

  constructor(args?: Args, returns?: Returns) {
    super();
    this._args = args;
    this._returns = returns;
  }

  _parse(input: unknown, ctx: ParseContext): any {
    const parsedType = getParsedType(input);
    if (parsedType !== 'function') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'function',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const fn = input as Function;

    // If we have an implementation function, validate it
    if (this._implement) {
      // Create a wrapper function that validates args and return value
      return (...args: any[]) => {
        // Validate arguments
        if (this._args) {
          for (let i = 0; i < this._args.length; i++) {
            const argSchema = this._args[i];
            const argValue = args[i];
            const argCtx = ctx.child(`arg[${i}]`, argValue);
            (argSchema as any)._parse(argValue, argCtx);
          }
        }

        // Call the function
        const result = fn(...args);

        // Validate return value
        if (this._returns) {
          const returnCtx = ctx.child('return', result);
          return (this._returns as any)._parse(result, returnCtx);
        }

        return result;
      };
    }

    return fn;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<any> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'function') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'function',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const fn = input as Function;

    // If we have an implementation function, validate it
    if (this._implement) {
      // Create a wrapper function that validates args and return value
      return async (...args: any[]) => {
        // Validate arguments
        if (this._args) {
          for (let i = 0; i < this._args.length; i++) {
            const argSchema = this._args[i];
            const argValue = args[i];
            const argCtx = ctx.child(`arg[${i}]`, argValue);
            await (argSchema as any)._parseAsync(argValue, argCtx);
          }
        }

        // Call the function
        const result = await fn(...args);

        // Validate return value
        if (this._returns) {
          const returnCtx = ctx.child('return', result);
          return await (this._returns as any)._parseAsync(result, returnCtx);
        }

        return result;
      };
    }

    return fn;
  }

  args<NewArgs extends readonly SchemaDefinition<any, any>[]>(
    ...schemas: NewArgs
  ): FunctionSchema<NewArgs, Returns> {
    return new FunctionSchema(schemas, this._returns);
  }

  returns<NewReturns extends SchemaDefinition<any, any>>(
    schema: NewReturns
  ): FunctionSchema<Args, NewReturns> {
    return new FunctionSchema(this._args, schema);
  }

  implement(fn: Function): FunctionSchema<Args, Returns> {
    const schema = Object.create(this);
    schema._implement = fn;
    return schema;
  }
}

export function functionSchema(): FunctionSchema<[], undefined> {
  return new FunctionSchema();
}