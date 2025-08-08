import { BaseSchema } from '../../types/base';
import { ParseContext } from '../../core/parser';
import { ObjectSchema } from './object';
export declare class DiscriminatedUnionSchema<Discriminator extends string, Options extends readonly ObjectSchema<any>[]> extends BaseSchema<Options[number]['_input'], Options[number]['_output']> {
    readonly _type = "discriminatedUnion";
    private _discriminator;
    private _unionOptions;
    private _optionsByDiscriminator;
    constructor(discriminator: Discriminator, options: Options);
    private extractLiteralValue;
    _parse(input: unknown, ctx: ParseContext): Options[number]['_output'];
    _parseAsync(input: unknown, ctx: ParseContext): Promise<Options[number]['_output']>;
    get discriminator(): Discriminator;
    get options(): Options;
}
export declare function discriminatedUnion<Discriminator extends string, Options extends readonly ObjectSchema<any>[]>(discriminator: Discriminator, options: Options): DiscriminatedUnionSchema<Discriminator, Options>;
//# sourceMappingURL=discriminated-union.d.ts.map