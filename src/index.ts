export * from './types/base';
export * from './types/infer';
export * from './types/errors';

// Export utilities
export * as guards from './utils/guards';
export * as introspection from './utils/introspection';
export * as errorFormatter from './utils/error-formatter';
export * as composition from './utils/composition';
export * as metadata from './utils/metadata';

import { SchemaDefinition } from './types/base';

// Type alias for convenience
export type Schema<T = any> = SchemaDefinition<T, T>;

export { string, StringSchema } from './schemas/primitives/string';
export { number, NumberSchema } from './schemas/primitives/number';
export { boolean, BooleanSchema } from './schemas/primitives/boolean';
export { date, DateSchema } from './schemas/primitives/date';
export { bigint, BigIntSchema } from './schemas/primitives/bigint';
export { symbol, SymbolSchema } from './schemas/primitives/symbol';
export { literal, LiteralSchema } from './schemas/primitives/literal';
export { undefinedSchema, UndefinedSchema } from './schemas/primitives/undefined';
export { nullSchema, NullSchema } from './schemas/primitives/null';
export { any, AnySchema } from './schemas/primitives/any';
export { unknown, UnknownSchema } from './schemas/primitives/unknown';
export { never, NeverSchema } from './schemas/primitives/never';
export { voidSchema, VoidSchema } from './schemas/primitives/void';
export { nan, NanSchema } from './schemas/primitives/nan';

export { array, ArraySchema } from './schemas/complex/array';
export { object, ObjectSchema } from './schemas/complex/object';
export { record, RecordSchema } from './schemas/complex/record';
export { union, UnionSchema } from './schemas/complex/union';
export { tuple, TupleSchema } from './schemas/complex/tuple';
export { intersection, IntersectionSchema } from './schemas/complex/intersection';
export { discriminatedUnion, DiscriminatedUnionSchema } from './schemas/complex/discriminated-union';
export { map, MapSchema } from './schemas/complex/map';
export { set, SetSchema } from './schemas/complex/set';
export { lazy, LazySchema } from './schemas/complex/lazy';
export { promise, PromiseSchema } from './schemas/complex/promise';
export { enumSchema, EnumSchema, nativeEnum, NativeEnumSchema } from './schemas/complex/enum';
export { functionSchema, FunctionSchema } from './schemas/complex/function';
export { preprocess, PreprocessSchema } from './schemas/complex/preprocess';
export { pipeline, PipelineSchema } from './schemas/complex/pipeline';
export { effects, EffectsSchema } from './schemas/complex/effects';

import * as string from './schemas/primitives/string';
import * as number from './schemas/primitives/number';
import * as boolean from './schemas/primitives/boolean';
import * as date from './schemas/primitives/date';
import * as bigint from './schemas/primitives/bigint';
import * as symbol from './schemas/primitives/symbol';
import * as literal from './schemas/primitives/literal';
import * as undefinedSchema from './schemas/primitives/undefined';
import * as nullSchema from './schemas/primitives/null';
import * as any from './schemas/primitives/any';
import * as unknown from './schemas/primitives/unknown';
import * as never from './schemas/primitives/never';
import * as voidSchema from './schemas/primitives/void';
import * as nan from './schemas/primitives/nan';
import * as array from './schemas/complex/array';
import * as object from './schemas/complex/object';
import * as union from './schemas/complex/union';
import * as tuple from './schemas/complex/tuple';
import * as intersection from './schemas/complex/intersection';
import * as discriminatedUnion from './schemas/complex/discriminated-union';
import * as mapSchema from './schemas/complex/map';
import * as setSchema from './schemas/complex/set';
import * as lazy from './schemas/complex/lazy';
import * as promiseSchema from './schemas/complex/promise';
import * as enumSchema from './schemas/complex/enum';
import * as functionSchema from './schemas/complex/function';
import * as preprocess from './schemas/complex/preprocess';
import * as pipeline from './schemas/complex/pipeline';
import * as effects from './schemas/complex/effects';
import * as recordSchema from './schemas/complex/record';
import { pluginManager } from './plugins/manager';
import * as guards from './utils/guards';
import * as introspection from './utils/introspection';
import * as errorFormatter from './utils/error-formatter';
import * as composition from './utils/composition';
import * as metadata from './utils/metadata';

const v = {
  string: string.string,
  number: number.number,
  boolean: boolean.boolean,
  date: date.date,
  bigint: bigint.bigint,
  symbol: symbol.symbol,
  literal: literal.literal,
  undefined: undefinedSchema.undefinedSchema,
  null: nullSchema.nullSchema,
  any: any.any,
  unknown: unknown.unknown,
  never: never.never,
  void: voidSchema.voidSchema,
  nan: nan.nan,
  array: array.array,
  object: object.object,
  record: recordSchema.record,
  union: union.union,
  tuple: tuple.tuple,
  intersection: intersection.intersection,
  discriminatedUnion: discriminatedUnion.discriminatedUnion,
  map: mapSchema.map,
  set: setSchema.set,
  lazy: lazy.lazy,
  promise: promiseSchema.promise,
  enum: enumSchema.enumSchema,
  nativeEnum: enumSchema.nativeEnum,
  function: functionSchema.functionSchema,
  preprocess: preprocess.preprocess,
  pipeline: pipeline.pipeline,
  effects: effects.effects,
  coerce: {
    string: (options?: any) => string.string({ ...options, coerce: true }),
    number: (options?: any) => number.number({ ...options, coerce: true }),
    boolean: (options?: any) => boolean.boolean({ ...options, coerce: true }),
    date: (options?: any) => date.date({ ...options, coerce: true }),
    bigint: (options?: any) => bigint.bigint({ ...options, coerce: true })
  },
  use: (plugin: any) => pluginManager.register(plugin),
  // Utility functions
  is: guards.is,
  assert: guards.assert,
  createGuard: guards.createGuard,
  createAssert: guards.createAssert,
  introspect: introspection.introspect,
  toJsonSchema: introspection.toJsonSchema,
  formatError: errorFormatter.formatError,
  compose: {
    or: composition.or,
    and: composition.and,
    conditional: composition.conditional,
    recursive: composition.recursive,
    pipeline: composition.pipeline,
    coerce: composition.coerce,
    withFallback: composition.withFallback,
    preprocess: composition.preprocess,
    postprocess: composition.postprocess,
    nullable: composition.nullable,
    optional: composition.optional,
    nullish: composition.nullish,
    withDefault: composition.withDefault,
    brand: composition.brand,
    readonly: composition.readonly,
    defer: composition.defer,
    firstOf: composition.firstOf,
    allOf: composition.allOf,
    extend: composition.extend,
    pick: composition.pick,
    omit: composition.omit,
    partial: composition.partial,
    required: composition.required,
    deepPartial: composition.deepPartial,
    mergeObjects: composition.mergeObjects
  },
  metadata: {
    set: metadata.setMetadata,
    get: metadata.getMetadata,
    has: metadata.hasMetadata,
    delete: metadata.deleteMetadata,
    clear: metadata.clearMetadata,
    describe: metadata.describe,
    example: metadata.example,
    deprecate: metadata.deprecate,
    version: metadata.version,
    tag: metadata.tag,
    document: metadata.document,
    withMetadata: metadata.withMetadata,
    getSummary: metadata.getMetadataSummary
  }
};

export { v };
export default v;