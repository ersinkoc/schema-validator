import { BaseSchema, SchemaDefinition } from '../../types/base';
import { ErrorCode, getParsedType } from '../../types/errors';
import { ParseContext } from '../../core/parser';
import { ObjectSchema } from './object';

type DiscriminatorValue = string | number | boolean | null | undefined;

export class DiscriminatedUnionSchema<
  Discriminator extends string,
  Options extends readonly ObjectSchema<any>[]
> extends BaseSchema<
  Options[number]['_input'],
  Options[number]['_output']
> {
  readonly _type = 'discriminatedUnion';
  private _discriminator: Discriminator;
  private _unionOptions: Options;
  private _optionsByDiscriminator: Map<DiscriminatorValue, ObjectSchema<any>>;

  constructor(discriminator: Discriminator, options: Options) {
    super();
    this._discriminator = discriminator;
    this._unionOptions = options;
    this._optionsByDiscriminator = new Map();

    // Build lookup map for fast discrimination
    for (const option of options) {
      const shape = option.shape;
      const discriminatorSchema = shape[discriminator];
      
      if (!discriminatorSchema) {
        throw new Error(`Discriminator "${discriminator}" not found in option schema`);
      }

      // Extract the literal value from the discriminator schema
      const literalValue = this.extractLiteralValue(discriminatorSchema);
      if (literalValue !== undefined) {
        this._optionsByDiscriminator.set(literalValue, option);
      }
    }
  }

  private extractLiteralValue(schema: SchemaDefinition<any, any>): DiscriminatorValue | undefined {
    // Check if it's a literal schema
    if ('value' in schema && typeof (schema as any).value !== 'function') {
      return (schema as any).value;
    }
    
    // For complex schemas, try to extract the expected value
    if (schema._type === 'literal' && 'value' in schema) {
      return (schema as any).value;
    }
    
    return undefined;
  }

  _parse(input: unknown, ctx: ParseContext): Options[number]['_output'] {
    const parsedType = getParsedType(input);
    if (parsedType !== 'object') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected object, received ${parsedType}`,
        expected: 'object',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const obj = input as Record<string, any>;
    const discriminatorValue = obj[this._discriminator];

    const option = this._optionsByDiscriminator.get(discriminatorValue);
    if (!option) {
      ctx.addIssue({
        code: ErrorCode.INVALID_UNION_DISCRIMINATOR,
        message: `Invalid discriminator value`,
        options: {
          expected: Array.from(this._optionsByDiscriminator.keys()),
          received: discriminatorValue
        }
      });
      throw ctx.makeError();
    }

    return (option as any)._parse(input, ctx);
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<Options[number]['_output']> {
    const parsedType = getParsedType(input);
    if (parsedType !== 'object') {
      ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: `Expected object, received ${parsedType}`,
        expected: 'object',
        received: parsedType
      });
      throw ctx.makeError();
    }

    const obj = input as Record<string, any>;
    const discriminatorValue = obj[this._discriminator];

    const option = this._optionsByDiscriminator.get(discriminatorValue);
    if (!option) {
      ctx.addIssue({
        code: ErrorCode.INVALID_UNION_DISCRIMINATOR,
        message: `Invalid discriminator value`,
        options: {
          expected: Array.from(this._optionsByDiscriminator.keys()),
          received: discriminatorValue
        }
      });
      throw ctx.makeError();
    }

    return (option as any)._parseAsync(input, ctx);
  }

  get discriminator(): Discriminator {
    return this._discriminator;
  }

  get options(): Options {
    return this._unionOptions;
  }
}

export function discriminatedUnion<
  Discriminator extends string,
  Options extends readonly ObjectSchema<any>[]
>(discriminator: Discriminator, options: Options): DiscriminatedUnionSchema<Discriminator, Options> {
  return new DiscriminatedUnionSchema(discriminator, options);
}