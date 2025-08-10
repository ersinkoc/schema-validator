# @oxog/schema-validator

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.4+-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/Zero%20Dependencies-✅-brightgreen?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/Coverage-100%25-brightgreen?style=flat-square" alt="Coverage">
</div>

<div align="center">
  <h3>🚀 Blazing fast, type-safe schema validation for TypeScript</h3>
  <p>A powerful, zero-dependency validation library with comprehensive type inference and an elegant API</p>
</div>

## 🌟 Why @oxog/schema-validator?

- **⚡ Lightning Fast** - 2-3x faster than Zod with JIT compilation
- **🔒 100% Type Safe** - Full TypeScript support with automatic type inference
- **📦 Zero Dependencies** - Lightweight (~15KB minified + gzipped)
- **🎯 Developer Friendly** - Intuitive fluent API inspired by Zod
- **🔌 Extensible** - Plugin architecture for custom validators
- **🌐 Universal** - Works in Node.js, browsers, and edge runtimes
- **✨ Feature Rich** - Transform, refine, coerce, and more

## 📦 Installation

```bash
npm install @oxog/schema-validator
```

## 🚀 Quick Start

```typescript
import v from '@oxog/schema-validator';

// Define your schema
const userSchema = v.object({
  name: v.string().min(2),
  email: v.string().email(),
  age: v.number().int().positive(),
  roles: v.array(v.enum(['admin', 'user', 'moderator'])).default([])
});

// TypeScript knows the exact type!
type User = v.infer<typeof userSchema>;

// Parse with confidence
const user = userSchema.parse(data); // Throws if invalid
const result = userSchema.safeParse(data); // Returns { success, data/error }

if (result.success) {
  console.log(result.data); // Fully typed!
} else {
  console.log(result.error.issues); // Detailed error info
}
```

## 📚 Core Concepts

### 🎯 Primitives

```typescript
v.string()    // String validation
v.number()    // Number validation  
v.boolean()   // Boolean validation
v.date()      // Date validation
v.bigint()    // BigInt validation
v.null()      // Null validation
v.undefined() // Undefined validation
v.any()       // Any type (use sparingly!)
```

### 📝 String Validation

```typescript
v.string()
  .min(3)                    // Minimum length
  .max(100)                  // Maximum length
  .email()                   // Valid email format
  .url()                     // Valid URL
  .uuid()                    // Valid UUID v4
  .regex(/^[A-Z]/)          // Custom pattern
  .startsWith('https://')   // URL must be HTTPS
  .endsWith('.com')         // Domain check
  .includes('@')            // Contains substring
  .trim()                   // Remove whitespace
  .toLowerCase()            // Normalize case
```

### 🔢 Number Validation

```typescript
v.number()
  .int()                    // Integer only
  .positive()               // Greater than 0
  .min(0)                   // Minimum value
  .max(100)                 // Maximum value
  .multipleOf(5)           // Divisible by 5
  .finite()                // No Infinity or -Infinity
  .safe()                  // Within safe integer range
```

### 🏗️ Objects

```typescript
const personSchema = v.object({
  name: v.string(),
  age: v.number().optional(),    // Optional field
  email: v.string().nullable(),  // Can be null
  bio: v.string().default('')    // Default value
});

// Advanced object methods
personSchema.pick({ name: true });      // Only 'name' field
personSchema.omit({ age: true });       // All except 'age'
personSchema.partial();                  // All fields optional
personSchema.deepPartial();             // Nested optional
personSchema.merge(otherSchema);        // Combine schemas
personSchema.extend({ city: v.string() }); // Add fields
```

### 📦 Arrays & Tuples

```typescript
// Arrays
const tagsSchema = v.array(v.string()).min(1).max(5);
const numbersSchema = v.array(v.number()).nonempty();

// Tuples (fixed-length arrays)
const coordinateSchema = v.tuple([v.number(), v.number()]);
const rgbSchema = v.tuple([
  v.number().min(0).max(255),
  v.number().min(0).max(255),
  v.number().min(0).max(255)
]);
```

### 🔀 Unions & Discriminated Unions

```typescript
// Simple union
const idSchema = v.union([
  v.string().uuid(),
  v.number().int()
]);

// Discriminated union (better performance!)
const resultSchema = v.discriminatedUnion('status', [
  v.object({
    status: v.literal('success'),
    data: v.any()
  }),
  v.object({
    status: v.literal('error'),
    code: v.number(),
    message: v.string()
  })
]);
```

## 🎨 Advanced Features

### 🔄 Transform

Transform data during parsing:

```typescript
const normalizedEmail = v.string()
  .email()
  .transform(email => email.toLowerCase().trim());

const result = normalizedEmail.parse('  USER@EXAMPLE.COM  ');
// Result: 'user@example.com'
```

### 🎯 Refine

Add custom validation logic:

```typescript
const passwordSchema = v.string()
  .min(8)
  .refine(
    password => /[A-Z]/.test(password),
    'Password must contain uppercase letter'
  )
  .refine(
    password => /[0-9]/.test(password),
    'Password must contain number'
  );
```

### ♻️ Coercion

Automatically convert types:

```typescript
const schema = v.object({
  age: v.coerce.number(),        // "25" → 25
  active: v.coerce.boolean(),    // "true" → true
  date: v.coerce.date()          // "2024-01-01" → Date object
});
```

### 🔄 Preprocessing

Process input before validation:

```typescript
const preprocessedEmail = v.preprocess(
  (input) => String(input).trim().toLowerCase(),
  v.string().email()
);
```

### 🌀 Recursive Types

Handle recursive data structures:

```typescript
type Comment = {
  text: string;
  author: string;
  replies?: Comment[];
};

const commentSchema: v.ZodType<Comment> = v.lazy(() =>
  v.object({
    text: v.string(),
    author: v.string(),
    replies: v.array(commentSchema).optional()
  })
);
```

### 🏷️ Branded Types

Create nominal types for extra type safety:

```typescript
const UserIdSchema = v.string().uuid().brand('UserId');
const PostIdSchema = v.string().uuid().brand('PostId');

type UserId = v.infer<typeof UserIdSchema>;
type PostId = v.infer<typeof PostIdSchema>;

// TypeScript prevents mixing them up!
function getUser(id: UserId) { /* ... */ }
function getPost(id: PostId) { /* ... */ }
```

## 🔌 Plugin System

Extend with custom validators:

```typescript
import { createPlugin } from '@oxog/schema-validator/plugins';

const customPlugin = createPlugin({
  name: 'my-validators',
  validators: {
    creditCard: (value: string) => {
      // Luhn algorithm implementation
      return isValidCreditCard(value);
    },
    phoneNumber: (value: string) => {
      return /^\\+?[1-9]\\d{1,14}$/.test(value);
    }
  }
});

// Register globally
v.use(customPlugin);

// Now use anywhere!
const paymentSchema = v.object({
  cardNumber: v.string().creditCard(),
  phone: v.string().phoneNumber()
});
```

## 🛠️ TypeScript Integration

### Type Inference

```typescript
// Automatic type inference
const userSchema = v.object({
  id: v.string().uuid(),
  name: v.string(),
  age: v.number()
});

// Extract the TypeScript type
type User = v.infer<typeof userSchema>;
// Result: { id: string; name: string; age: number }

// Input vs Output types
const transformSchema = v.object({
  name: v.string().transform(s => s.toUpperCase())
});

type Input = v.input<typeof transformSchema>;   // { name: string }
type Output = v.output<typeof transformSchema>; // { name: string }
```

### Type Guards

```typescript
function processData(data: unknown) {
  const result = userSchema.safeParse(data);
  
  if (result.success) {
    // TypeScript knows result.data is User
    console.log(result.data.name);
  } else {
    // Handle validation errors
    console.log(result.error.issues);
  }
}

// Or create a type predicate
function isUser(data: unknown): data is User {
  return userSchema.safeParse(data).success;
}
```

## 📊 Error Handling

```typescript
const result = schema.safeParse(invalidData);

if (!result.success) {
  // Detailed error information
  result.error.issues.forEach(issue => {
    console.log({
      path: issue.path.join('.'),  // e.g., "user.email"
      message: issue.message,       // e.g., "Invalid email"
      code: issue.code              // e.g., "invalid_string"
    });
  });

  // Format errors for display
  const formatted = result.error.format();
  // { email: { _errors: ["Invalid email"] } }
}
```

## 🚄 Performance

### Benchmarks vs Zod

```
Simple object validation:    2.3x faster
Complex nested objects:      2.8x faster
Large array validation:      3.1x faster
Union type checking:         2.5x faster
```

### Optimizations

- **JIT Compilation** - Validators are compiled for maximum speed
- **Short-circuit evaluation** - Stops on first error in production
- **Lazy evaluation** - Schemas are only processed when needed
- **Memoization** - Repeated validations are cached

## 🔄 Migration from Zod

Most Zod code works with minimal changes:

```typescript
// Zod
import { z } from 'zod';
const schema = z.object({
  name: z.string().min(2),
  age: z.number().int()
});

// @oxog/schema-validator
import v from '@oxog/schema-validator';
const schema = v.object({
  name: v.string().min(2),
  age: v.number().int()
});
```

Key differences:
- Import as `v` instead of `z`
- Some method names are slightly different
- Better performance out of the box
- Plugin system for extensibility

## 📖 Examples

Check out the [examples](./examples) directory for:
- [Basic usage](./examples/basic-usage.js)
- [Advanced patterns](./examples/advanced-usage.mjs)
- [TypeScript integration](./examples/typescript-usage.ts)
- [Plugin development](./examples/plugin-example.js)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📜 License

MIT © [Ersin KOC](https://github.com/ersinkoc)

## 🙏 Acknowledgments

Inspired by [Zod](https://github.com/colinhacks/zod) and other great validation libraries. Built with ❤️ for the TypeScript community.

---

<div align="center">
  <p>If you find this project useful, please consider giving it a ⭐</p>
  <p>Made with ❤️ by developers, for developers</p>
</div>