# @oxog/schema-validator

A powerful, zero-dependency TypeScript validation library. A performant alternative to Zod with comprehensive type safety and an intuitive API.

[![npm version](https://badge.fury.io/js/%40oxog%2Fschema-validator.svg)](https://badge.fury.io/js/%40oxog%2Fschema-validator)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@oxog/schema-validator)](https://bundlephobia.com/package/@oxog/schema-validator)

## Features

- 🚀 **Zero Runtime Dependencies** - Lightweight and fast
- 🔒 **100% Type Safe** - Full TypeScript support with type inference
- 📦 **Tree-Shakeable** - Only import what you need
- 🔄 **Dual Package Support** - Works with both CommonJS and ESM
- 🎯 **Comprehensive Validators** - Primitives, objects, arrays, and more
- 🔌 **Plugin Architecture** - Extend with custom validators
- ⚡ **High Performance** - Optimized for speed
- 🛠️ **Developer Friendly** - Intuitive fluent API
- 🔍 **Detailed Errors** - Clear error messages with paths
- 🌐 **Async Support** - Async validation and transformations

## Installation

```bash
npm install @oxog/schema-validator
# or
yarn add @oxog/schema-validator
# or
pnpm add @oxog/schema-validator
```

## Quick Start

```typescript
import v from '@oxog/schema-validator';

// Define a schema
const userSchema = v.object({
  name: v.string().min(2).max(50),
  age: v.number().int().positive(),
  email: v.string().email(),
  roles: v.array(v.enum(['admin', 'user', 'moderator'])),
  profile: v.object({
    bio: v.string().optional(),
    avatar: v.string().url().optional()
  })
});

// Infer TypeScript type
import { Infer } from '@oxog/schema-validator';
type User = Infer<typeof userSchema>;

// Parse data
const user = userSchema.parse(data); // throws on error
const result = userSchema.safeParse(data); // returns result object
```

## Core Validators

### Primitives

```typescript
v.string()    // String validation
v.number()    // Number validation
v.boolean()   // Boolean validation
v.date()      // Date validation
v.bigint()    // BigInt validation
v.symbol()    // Symbol validation
v.undefined() // Undefined validation
v.null()      // Null validation
v.any()       // Any type
v.unknown()   // Unknown type
v.never()     // Never type
v.void()      // Void type
v.nan()       // NaN validation
```

### String Methods

```typescript
v.string()
  .min(5)                   // Minimum length
  .max(20)                  // Maximum length
  .length(10)               // Exact length
  .email()                  // Email validation
  .url()                    // URL validation
  .uuid()                   // UUID validation
  .cuid()                   // CUID validation
  .regex(/pattern/)         // Regex pattern
  .includes('substring')    // Contains substring
  .startsWith('prefix')     // Starts with
  .endsWith('suffix')       // Ends with
  .datetime()               // ISO datetime string
  .ip()                     // IP address (v4 or v6)
  .base64()                 // Base64 string
  .trim()                   // Trim whitespace
  .toLowerCase()            // Convert to lowercase
  .toUpperCase()            // Convert to uppercase
  .nonempty()              // Non-empty string
```

### Number Methods

```typescript
v.number()
  .min(0)                   // Minimum value
  .max(100)                 // Maximum value
  .int()                    // Integer only
  .positive()               // Positive numbers
  .negative()               // Negative numbers
  .nonnegative()            // Non-negative (>= 0)
  .nonpositive()            // Non-positive (<= 0)
  .multipleOf(5)            // Multiple of value
  .finite()                 // Finite numbers only
  .safe()                   // Safe integers only
  .gt(5)                    // Greater than
  .gte(5)                   // Greater than or equal
  .lt(10)                   // Less than
  .lte(10)                  // Less than or equal
```

### Complex Types

#### Objects

```typescript
const schema = v.object({
  name: v.string(),
  age: v.number()
});

// Object methods
schema.strict()             // No unknown keys
schema.passthrough()        // Pass unknown keys
schema.strip()              // Strip unknown keys (default)
schema.partial()            // Make all properties optional
schema.required()           // Make all properties required
schema.pick(['name'])       // Pick specific keys
schema.omit(['age'])        // Omit specific keys
schema.merge(otherSchema)   // Merge with another schema
schema.extend({ ... })      // Extend with new properties
schema.deepPartial()        // Deep partial
schema.keyof()              // Get union of keys
```

#### Arrays

```typescript
const schema = v.array(v.string());

// Array methods
schema.min(1)               // Minimum length
schema.max(10)              // Maximum length
schema.length(5)            // Exact length
schema.nonempty()           // Non-empty array
```

#### Tuples

```typescript
// Fixed length tuple
const coords = v.tuple([v.number(), v.number()]);

// Variable length with rest
const args = v.tuple([v.string()]).rest(v.number());
```

#### Unions & Intersections

```typescript
// Union - one of multiple types
const stringOrNumber = v.union([v.string(), v.number()]);

// Discriminated union for better performance
const response = v.discriminatedUnion('status', [
  v.object({ status: v.literal('success'), data: v.any() }),
  v.object({ status: v.literal('error'), message: v.string() })
]);

// Intersection - combine types
const intersection = v.intersection(
  v.object({ name: v.string() }),
  v.object({ age: v.number() })
);
```

#### Other Complex Types

```typescript
// Record (dictionary)
v.record(v.string(), v.number())  // { [key: string]: number }

// Map
v.map(v.string(), v.number())     // Map<string, number>

// Set
v.set(v.string())                  // Set<string>

// Promise
v.promise(v.string())              // Promise<string>

// Function
v.function()
  .args(v.string(), v.number())   // Define arguments
  .returns(v.boolean())           // Define return type

// Enum
v.enum(['red', 'green', 'blue'])  // Union of literals

// Native enum
enum Color { Red, Green, Blue }
v.nativeEnum(Color)               // TypeScript enum
```

## Advanced Features

### Transform

```typescript
const schema = v.string().transform(val => val.toUpperCase());
const result = schema.parse('hello'); // 'HELLO'
```

### Refine

```typescript
const schema = v.number().refine(
  val => val % 2 === 0,
  'Must be an even number'
);
```

### Default Values

```typescript
const schema = v.object({
  name: v.string(),
  role: v.string().default('user'),
  active: v.boolean().default(true)
});
```

### Catch Errors

```typescript
const schema = v.string().catch('fallback');
schema.parse(123); // 'fallback' instead of throwing
```

### Coercion

```typescript
// Enable coercion for automatic type conversion
v.coerce.string()   // Convert to string
v.coerce.number()   // Convert to number
v.coerce.boolean()  // Convert to boolean
v.coerce.date()     // Convert to date
v.coerce.bigint()   // Convert to bigint
```

### Preprocessing

```typescript
const schema = v.preprocess(
  val => String(val).trim(),
  v.string().email()
);
```

### Pipeline

```typescript
const schema = v.pipeline(
  v.string(),
  v.transform(s => s.trim()),
  v.refine(s => s.length > 0)
);
```

### Lazy (Recursive Types)

```typescript
type Category = {
  name: string;
  subcategories?: Category[];
};

const categorySchema = v.lazy(() =>
  v.object({
    name: v.string(),
    subcategories: v.array(categorySchema).optional()
  })
);
```

### Branded Types

```typescript
const UserId = v.string().uuid().brand<'UserId'>();
type UserId = Infer<typeof UserId>;
```

## Type Inference

```typescript
// Infer output type
import { Infer, Input } from '@oxog/schema-validator';
type User = Infer<typeof userSchema>;

// Infer input type
type UserInput = Input<typeof userSchema>;

// Type predicates
if (userSchema.safeParse(data).success) {
  // data is typed as User here
}
```

## Error Handling

```typescript
const result = schema.safeParse(data);

if (!result.success) {
  console.log(result.error.issues);
  console.log(result.error.format());
  
  // Custom error map
  const customErrors = result.error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message
  }));
}
```

## Plugin System

```typescript
import { createPlugin } from '@oxog/schema-validator/plugins';

const customPlugin = createPlugin({
  name: 'custom-validators',
  version: '1.0.0',
  validators: {
    creditCard: (value: string) => {
      // Custom validation logic
      return isValidCreditCard(value);
    }
  }
});

// Use plugin
v.use(customPlugin);
v.string().creditCard(); // Now available
```

## CLI Tool

Generate schemas from TypeScript types:

```bash
npx oxog-validator generate --input types.ts --output schemas.ts
```

Validate data files:

```bash
npx oxog-validator validate --schema user.schema.ts --data data.json
```

## Performance

@oxog/schema-validator is optimized for performance with:

- JIT compilation for validators
- Memoization for repeated validations
- Short-circuit evaluation
- Lazy evaluation
- Optimized path tracking

Benchmarks show 2-3x faster performance than Zod for common operations.

## Migration from Zod

The API is designed to be familiar to Zod users. Key differences:

```typescript
// Zod
import { z } from 'zod';
const schema = z.string();

// @oxog/schema-validator
import v from '@oxog/schema-validator';
const schema = v.string();
```

Most Zod schemas can be migrated with minimal changes. See the [migration guide](docs/migration-from-zod.md) for details.

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting PRs.

## License

MIT © Ersin KOC

## Acknowledgments

Inspired by Zod and other validation libraries, but built from scratch with zero dependencies for maximum performance and control.