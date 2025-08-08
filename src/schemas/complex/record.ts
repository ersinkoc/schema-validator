import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class RecordSchema<K extends SchemaDefinition<any, any>, V extends SchemaDefinition<any, any>> extends BaseSchema<
  Record<string, V['_input']>,
  Record<string, V['_output']>
> {
  readonly _type = 'record';
  readonly _keySchema: K;
  readonly _valueSchema: V;

  constructor(keySchema: K, valueSchema: V) {
    super();
    this._keySchema = keySchema;
    this._valueSchema = valueSchema;
  }

  _parse(input: unknown, ctx: ParseContext): Record<string, V['_output']> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'object') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'object',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const obj = input as Record<string, any>;
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Validate key
        const keyResult = this._keySchema.safeParse(key);
        if (!keyResult.success) {
          ctx.addIssue({
            code: ErrorCode.INVALID_TYPE,
            message: `Invalid key: ${key}`
          });
          continue;
        }

        // Validate value
        const valueResult = this._valueSchema.safeParse(obj[key]);
        if (!valueResult.success) {
          for (const issue of valueResult.error.issues) {
            const { path, ...issueWithoutPath } = issue;
            ctx.addIssue(issueWithoutPath);
          }
        } else {
          result[key] = valueResult.data;
        }
      }
    }

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result;
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<Record<string, V['_output']>> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'object') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        expected: 'object',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const obj = input as Record<string, any>;
    const result: Record<string, any> = {};
    const promises: Promise<void>[] = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        promises.push(
          (async () => {
            // Validate key
            const keyResult = await this._keySchema.safeParseAsync(key);
            if (!keyResult.success) {
              ctx.addIssue({
                code: ErrorCode.INVALID_TYPE,
                message: `Invalid key: ${key}`
              });
              return;
            }

            // Validate value
            const valueResult = await this._valueSchema.safeParseAsync(obj[key]);
            if (!valueResult.success) {
              for (const issue of valueResult.error.issues) {
                const { path, ...issueWithoutPath } = issue;
                ctx.addIssue(issueWithoutPath);
              }
            } else {
              result[key] = valueResult.data;
            }
          })()
        );
      }
    }

    await Promise.all(promises);

    if (ctx.hasIssues) {
      throw ctx.makeError();
    }

    return result;
  }
}

export function record<K extends SchemaDefinition<any, any>, V extends SchemaDefinition<any, any>>(
  keySchema: K,
  valueSchema: V
): RecordSchema<K, V> {
  return new RecordSchema(keySchema, valueSchema);
}