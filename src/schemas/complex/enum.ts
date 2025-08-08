import { BaseSchema } from '../../types/base';
import { ErrorCode } from '../../types/errors';
import { ParseContext } from '../../core/parser';

export class EnumSchema<T extends readonly [string, ...string[]]> extends BaseSchema<T[number], T[number]> {
  readonly _type = 'enum';
  private _values: T;
  private _enumValues: Set<T[number]>;

  constructor(values: T) {
    super();
    this._values = values;
    this._enumValues = new Set(values);
  }

  _parse(input: unknown, ctx: ParseContext): T[number] {
    if (!this._enumValues.has(input as T[number])) {
      ctx.addIssue({
        code: ErrorCode.INVALID_ENUM_VALUE,
        message: `Invalid enum value`,
        options: {
          expected: Array.from(this._enumValues),
          received: String(input)
        }
      });
      throw ctx.makeError();
    }

    return input as T[number];
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<T[number]> {
    return this._parse(input, ctx);
  }

  get values(): T {
    return this._values;
  }

  get options(): T[number][] {
    return Array.from(this._enumValues);
  }
}

export function enumSchema<T extends readonly [string, ...string[]]>(values: T): EnumSchema<T> {
  return new EnumSchema(values);
}

// Native enum support
export class NativeEnumSchema<T extends Record<string, string | number>> extends BaseSchema<T[keyof T], T[keyof T]> {
  readonly _type = 'nativeEnum';
  private _enum: T;
  private _enumValues: Set<T[keyof T]>;

  constructor(enumObject: T) {
    super();
    this._enum = enumObject;
    
    // Extract enum values (handle both string and numeric enums)
    const values = new Set<T[keyof T]>();
    for (const key in enumObject) {
      const value = enumObject[key];
      // For numeric enums, TypeScript creates reverse mappings
      // We need to filter those out
      if (typeof value === 'number' || typeof enumObject[value as any] !== 'number') {
        values.add(value);
      }
    }
    this._enumValues = values;
  }

  _parse(input: unknown, ctx: ParseContext): T[keyof T] {
    if (!this._enumValues.has(input as T[keyof T])) {
      ctx.addIssue({
        code: ErrorCode.INVALID_ENUM_VALUE,
        message: `Invalid enum value`,
        options: {
          expected: Array.from(this._enumValues),
          received: String(input)
        }
      });
      throw ctx.makeError();
    }

    return input as T[keyof T];
  }

  async _parseAsync(input: unknown, ctx: ParseContext): Promise<T[keyof T]> {
    return this._parse(input, ctx);
  }

  get enum(): T {
    return this._enum;
  }

  get options(): T[keyof T][] {
    return Array.from(this._enumValues);
  }
}

export function nativeEnum<T extends Record<string, string | number>>(enumObject: T): NativeEnumSchema<T> {
  return new NativeEnumSchema(enumObject);
}