import type { SchemaDefinition } from './base';

export type Infer<T extends SchemaDefinition<any, any>> = T['_output'];
export type Input<T extends SchemaDefinition<any, any>> = T['_input'];

export type TypeOf<T extends SchemaDefinition<any, any>> = Infer<T>;
export type InputOf<T extends SchemaDefinition<any, any>> = Input<T>;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>;
    }
  : T;

export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

export type MergeShapes<A, B> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
    ? A[K]
    : never;
};

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type Branded<T, B> = T & { __brand: B };

export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type IsUnion<T, U extends T = T> = T extends any
  ? [U] extends [T]
    ? false
    : true
  : never;

export type IsOptional<T> = undefined extends T ? true : false;
export type IsNullable<T> = null extends T ? true : false;
export type IsNullish<T> = null extends T ? (undefined extends T ? true : false) : false;

export type FilterOptional<T extends object> = {
  [K in keyof T as IsOptional<T[K]> extends true ? K : never]: T[K];
};

export type FilterRequired<T extends object> = {
  [K in keyof T as IsOptional<T[K]> extends false ? K : never]: T[K];
};

export type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

export type OmitByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type GetType<T extends { _type: string }> = T['_type'];

export type ValidatorContext = {
  path: (string | number)[];
  parent?: any;
  data?: any;
  parsedType?: string;
  schemaErrorMap?: Map<string, string>;
  contextualErrorMap?: Map<string, string>;
};

export type ParsePath = (string | number)[];

export type SafeParseSuccess<T> = {
  success: true;
  data: T;
};

export type SafeParseError = {
  success: false;
  error: {
    issues: Array<{
      code: string;
      message: string;
      path: ParsePath;
    }>;
  };
};

export type SafeParseReturnType<T> = SafeParseSuccess<T> | SafeParseError;