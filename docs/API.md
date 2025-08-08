# API Reference

## Table of Contents

- [Core API](#core-api)
- [Primitive Schemas](#primitive-schemas)
- [String Methods](#string-methods)
- [Number Methods](#number-methods)
- [Complex Types](#complex-types)
- [Modifiers](#modifiers)
- [Transformations](#transformations)
- [Error Handling](#error-handling)
- [Type Utilities](#type-utilities)

## Core API

### `v`

The main export of the library. Used to create all schema types.

```typescript
import v from '@oxog/schema-validator';
```

### `parse(data: unknown): T`

Parses data and returns the validated result. Throws `ValidationError` on failure.

```typescript
const schema = v.string();
const result = schema.parse('hello'); // 'hello'
schema.parse(123); // throws ValidationError
```

### `safeParse(data: unknown): ParseResult<T>`

Parses data and returns a result object. Does not throw errors.

```typescript
const schema = v.string();
const result = schema.safeParse('hello');
if (result.success) {
  console.log(result.data); // 'hello'
} else {
  console.log(result.error.issues);
}
```

### `parseAsync(data: unknown): Promise<T>`

Async version of `parse`. Required when using async refinements.

```typescript
const result = await schema.parseAsync(data);
```

### `safeParseAsync(data: unknown): Promise<ParseResult<T>>`

Async version of `safeParse`.

```typescript
const result = await schema.safeParseAsync(data);
```

## Primitive Schemas

### `v.string()`

Creates a string schema.

```typescript
const schema = v.string();
schema.parse('hello'); // 'hello'
```

### `v.number()`

Creates a number schema.

```typescript
const schema = v.number();
schema.parse(42); // 42
```

### `v.boolean()`

Creates a boolean schema.

```typescript
const schema = v.boolean();
schema.parse(true); // true
```

### `v.date()`

Creates a date schema.

```typescript
const schema = v.date();
schema.parse(new Date()); // Date object
```

### `v.bigint()`

Creates a bigint schema.

```typescript
const schema = v.bigint();
schema.parse(123n); // 123n
```

### `v.symbol()`

Creates a symbol schema.

```typescript
const schema = v.symbol();
schema.parse(Symbol('test')); // Symbol(test)
```

### `v.literal(value)`

Creates a literal value schema.

```typescript
const schema = v.literal('constant');
schema.parse('constant'); // 'constant'
schema.parse('other'); // throws
```

### `v.null()`

Validates null values.

```typescript
const schema = v.null();
schema.parse(null); // null
```

### `v.undefined()`

Validates undefined values.

```typescript
const schema = v.undefined();
schema.parse(undefined); // undefined
```

### `v.void()`

Validates undefined values (alias for undefined).

```typescript
const schema = v.void();
schema.parse(undefined); // undefined
```

### `v.any()`

Accepts any value.

```typescript
const schema = v.any();
schema.parse(anything); // anything
```

### `v.unknown()`

Accepts any value (safer than `any` for TypeScript).

```typescript
const schema = v.unknown();
schema.parse(anything); // unknown
```

### `v.never()`

Never passes validation.

```typescript
const schema = v.never();
schema.parse(anything); // always throws
```

### `v.nan()`

Validates NaN values.

```typescript
const schema = v.nan();
schema.parse(NaN); // NaN
```

## String Methods

### `.min(length: number)`

Sets minimum string length.

```typescript
v.string().min(5)
```

### `.max(length: number)`

Sets maximum string length.

```typescript
v.string().max(10)
```

### `.length(length: number)`

Sets exact string length.

```typescript
v.string().length(8)
```

### `.email()`

Validates email format.

```typescript
v.string().email()
```

### `.url()`

Validates URL format.

```typescript
v.string().url()
```

### `.uuid()`

Validates UUID format.

```typescript
v.string().uuid()
```

### `.cuid()`

Validates CUID format.

```typescript
v.string().cuid()
```

### `.cuid2()`

Validates CUID2 format.

```typescript
v.string().cuid2()
```

### `.ulid()`

Validates ULID format.

```typescript
v.string().ulid()
```

### `.regex(pattern: RegExp)`

Validates against regex pattern.

```typescript
v.string().regex(/^[A-Z]/)
```

### `.includes(substring: string)`

Checks if string contains substring.

```typescript
v.string().includes('test')
```

### `.startsWith(prefix: string)`

Checks if string starts with prefix.

```typescript
v.string().startsWith('http')
```

### `.endsWith(suffix: string)`

Checks if string ends with suffix.

```typescript
v.string().endsWith('.com')
```

### `.datetime()`

Validates ISO datetime string.

```typescript
v.string().datetime()
```

### `.ip()`

Validates IP address (v4 or v6).

```typescript
v.string().ip()
```

### `.base64()`

Validates base64 encoded string.

```typescript
v.string().base64()
```

### `.trim()`

Trims whitespace from string.

```typescript
v.string().trim()
```

### `.toLowerCase()`

Converts string to lowercase.

```typescript
v.string().toLowerCase()
```

### `.toUpperCase()`

Converts string to uppercase.

```typescript
v.string().toUpperCase()
```

### `.nonempty()`

Ensures string is not empty.

```typescript
v.string().nonempty()
```

## Number Methods

### `.gt(value: number)`

Greater than.

```typescript
v.number().gt(5)
```

### `.gte(value: number)`

Greater than or equal.

```typescript
v.number().gte(5)
```

### `.lt(value: number)`

Less than.

```typescript
v.number().lt(10)
```

### `.lte(value: number)`

Less than or equal.

```typescript
v.number().lte(10)
```

### `.min(value: number)`

Minimum value (alias for gte).

```typescript
v.number().min(0)
```

### `.max(value: number)`

Maximum value (alias for lte).

```typescript
v.number().max(100)
```

### `.int()`

Integer values only.

```typescript
v.number().int()
```

### `.positive()`

Positive numbers only (> 0).

```typescript
v.number().positive()
```

### `.negative()`

Negative numbers only (< 0).

```typescript
v.number().negative()
```

### `.nonnegative()`

Non-negative numbers (>= 0).

```typescript
v.number().nonnegative()
```

### `.nonpositive()`

Non-positive numbers (<= 0).

```typescript
v.number().nonpositive()
```

### `.multipleOf(value: number)`

Must be multiple of value.

```typescript
v.number().multipleOf(5)
```

### `.finite()`

Finite numbers only.

```typescript
v.number().finite()
```

### `.safe()`

Safe integers only.

```typescript
v.number().safe()
```

## Complex Types

### `v.object(shape)`

Creates an object schema.

```typescript
const schema = v.object({
  name: v.string(),
  age: v.number()
});
```

#### Object Methods

- `.strict()` - No unknown keys allowed
- `.passthrough()` - Pass unknown keys through
- `.strip()` - Strip unknown keys (default)
- `.partial()` - Make all properties optional
- `.required()` - Make all properties required
- `.pick(keys)` - Pick specific keys
- `.omit(keys)` - Omit specific keys
- `.extend(shape)` - Add new properties
- `.merge(schema)` - Merge with another object schema
- `.deepPartial()` - Deep partial (nested objects also partial)
- `.keyof()` - Get union of keys
- `.catchall(schema)` - Schema for unknown keys

### `v.array(schema)`

Creates an array schema.

```typescript
const schema = v.array(v.string());
```

#### Array Methods

- `.min(length)` - Minimum array length
- `.max(length)` - Maximum array length
- `.length(length)` - Exact array length
- `.nonempty()` - Non-empty array

### `v.tuple(schemas)`

Creates a tuple schema.

```typescript
const schema = v.tuple([v.string(), v.number()]);
```

#### Tuple Methods

- `.rest(schema)` - Rest elements schema

### `v.union(schemas)`

Creates a union schema.

```typescript
const schema = v.union([v.string(), v.number()]);
```

### `v.discriminatedUnion(discriminator, schemas)`

Creates an optimized discriminated union.

```typescript
const schema = v.discriminatedUnion('type', [
  v.object({ type: v.literal('a'), value: v.string() }),
  v.object({ type: v.literal('b'), value: v.number() })
]);
```

### `v.intersection(...schemas)`

Creates an intersection schema.

```typescript
const schema = v.intersection(
  v.object({ a: v.string() }),
  v.object({ b: v.number() })
);
```

### `v.record(keySchema, valueSchema)`

Creates a record schema.

```typescript
const schema = v.record(v.string(), v.number());
```

### `v.map(keySchema, valueSchema)`

Creates a Map schema.

```typescript
const schema = v.map(v.string(), v.number());
```

### `v.set(valueSchema)`

Creates a Set schema.

```typescript
const schema = v.set(v.string());
```

### `v.enum(values)`

Creates an enum schema.

```typescript
const schema = v.enum(['red', 'green', 'blue']);
```

### `v.nativeEnum(enumObject)`

Creates a schema from TypeScript enum.

```typescript
enum Color { Red, Green, Blue }
const schema = v.nativeEnum(Color);
```

### `v.promise(schema)`

Creates a Promise schema.

```typescript
const schema = v.promise(v.string());
```

### `v.function()`

Creates a function schema.

```typescript
const schema = v.function()
  .args(v.string(), v.number())
  .returns(v.boolean());
```

### `v.lazy(schemaFn)`

Creates a lazy schema for recursive types.

```typescript
const schema = v.lazy(() => 
  v.object({
    value: v.string(),
    children: v.array(schema).optional()
  })
);
```

## Modifiers

### `.optional()`

Makes a schema optional (allows undefined).

```typescript
v.string().optional()
```

### `.nullable()`

Makes a schema nullable (allows null).

```typescript
v.string().nullable()
```

### `.nullish()`

Makes a schema nullish (allows null or undefined).

```typescript
v.string().nullish()
```

### `.default(value)`

Provides default value for undefined inputs.

```typescript
v.string().default('default')
```

### `.catch(value)`

Provides fallback value on parse error.

```typescript
v.string().catch('fallback')
```

### `.brand<T>()`

Creates a branded type.

```typescript
v.string().brand<'UserId'>()
```

### `.readonly()`

Makes type readonly.

```typescript
v.object({ name: v.string() }).readonly()
```

### `.describe(description)`

Adds description to schema.

```typescript
v.string().describe('User email address')
```

## Transformations

### `.transform(fn)`

Transforms parsed value.

```typescript
v.string().transform(s => s.toUpperCase())
```

### `.refine(check, message?)`

Adds custom validation.

```typescript
v.number().refine(n => n % 2 === 0, 'Must be even')
```

### `.superRefine(check)`

Adds complex custom validation.

```typescript
v.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: 'custom',
      message: 'Too short'
    });
  }
})
```

### `v.preprocess(preprocessFn, schema)`

Preprocesses input before validation.

```typescript
v.preprocess(
  val => String(val).trim(),
  v.string().email()
)
```

### `v.pipeline(...schemas)`

Chains multiple transformations.

```typescript
v.pipeline(
  v.string(),
  v.transform(s => s.trim()),
  v.refine(s => s.length > 0)
)
```

### `v.effects(schema, effect)`

Adds side effects to parsing.

```typescript
v.effects(
  v.string(),
  {
    transform: async (val) => {
      await logToDatabase(val);
      return val;
    }
  }
)
```

## Error Handling

### `ValidationError`

The error thrown when validation fails.

```typescript
class ValidationError {
  issues: ValidationIssue[];
  format(): string;
}
```

### `ValidationIssue`

Individual validation issue.

```typescript
interface ValidationIssue {
  code: string;
  message?: string;
  path: (string | number)[];
  expected?: string;
  received?: string;
}
```

### Error Codes

Common error codes:

- `invalid_type` - Wrong type
- `invalid_literal` - Wrong literal value
- `custom` - Custom validation failed
- `invalid_union` - No union option matched
- `invalid_enum_value` - Invalid enum value
- `too_small` - Below minimum
- `too_big` - Above maximum
- `invalid_string` - String validation failed
- `invalid_date` - Invalid date

## Type Utilities

### `Infer<T>`

Infers the output type of a schema.

```typescript
import { Infer } from '@oxog/schema-validator';
type User = Infer<typeof userSchema>;
```

### `Input<T>`

Infers the input type of a schema.

```typescript
import { Input } from '@oxog/schema-validator';
type UserInput = Input<typeof userSchema>;
```

### `Output<T>`

Infers the output type of a schema (alias for Infer).

```typescript
import { Output } from '@oxog/schema-validator';
type UserOutput = Output<typeof userSchema>;
```

## Coercion

### `v.coerce`

Namespace for coercion schemas.

```typescript
v.coerce.string()   // Coerces to string
v.coerce.number()   // Coerces to number
v.coerce.boolean()  // Coerces to boolean
v.coerce.date()     // Coerces to Date
v.coerce.bigint()   // Coerces to bigint
```

Coercion rules:

**String coercion:**
- Numbers → string representation
- Booleans → 'true' or 'false'
- Dates → ISO string
- null/undefined → empty string

**Number coercion:**
- Strings → parsed number
- Booleans → 1 or 0
- Dates → timestamp
- null → 0
- undefined → NaN

**Boolean coercion:**
- Truthy values → true
- Falsy values → false
- Strings 'true', 'yes', '1' → true
- Strings 'false', 'no', '0' → false

**Date coercion:**
- Strings → parsed date
- Numbers → date from timestamp
- Invalid dates → Invalid Date object

**BigInt coercion:**
- Numbers → bigint (if integer)
- Strings → parsed bigint
- Booleans → 1n or 0n