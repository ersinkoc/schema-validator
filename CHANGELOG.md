# Changelog

All notable changes to @oxog/schema-validator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-08-07

### Added
- Type guard utilities for runtime type checking
  - `createGuard()` - Create type guard functions from schemas
  - `createAssert()` - Create assertion functions from schemas
  - `is()` - Check if a value matches a schema
  - `assert()` - Assert that a value matches a schema
  - `isSchema()` - Check if a value is a valid schema
- Schema introspection capabilities
  - `introspect()` - Get detailed information about a schema
  - `getShape()`, `getElement()`, `getOptions()` - Access schema internals
  - `toJsonSchema()` - Convert to JSON Schema format
  - `walkSchema()` - Traverse schema trees
- Custom error formatting utilities
  - `formatError()` - Format errors with customizable options
  - `formatErrorAsJson()` - Export errors as JSON
  - `formatErrorAsTable()` - Display errors in table format
  - `formatErrorAsMarkdown()` - Generate Markdown error reports
  - `createFormatter()` - Create custom error formatters
- Schema composition utilities
  - `or()`, `and()` - Compose schemas with logical operators
  - `conditional()` - Create conditional schemas
  - `recursive()` - Define recursive schemas
  - `pipeline()` - Chain schema transformations
  - `coerce()`, `preprocess()`, `postprocess()` - Data transformation helpers
- Schema metadata system
  - `setMetadata()`, `getMetadata()` - Attach custom metadata to schemas
  - `describe()`, `example()`, `deprecate()` - Add documentation
  - `version()`, `tag()`, `author()` - Track schema information
  - `withMetadata()` - Create metadata-enhanced schemas

### Fixed
- Fixed `readonly()` return type issue
- Fixed object schema `refine()` method execution
- Fixed `refine()` to handle both sync and async validation
- Implemented missing `RecordSchema` class

## [1.0.0] - 2025-08-07

### Added
- Initial release of @oxog/schema-validator
- Complete TypeScript validation library with zero runtime dependencies
- Full type inference support
- Primitive validators:
  - `string()` with methods: min, max, length, email, url, uuid, regex, includes, startsWith, endsWith, cuid, cuid2, ulid, datetime, ip, emoji, trim, toLowerCase, toUpperCase
  - `number()` with methods: gt, gte, lt, lte, int, positive, negative, nonpositive, nonnegative, multipleOf, finite, safe, min, max
  - `boolean()` with coercion support
  - `date()` with min/max validation
  - `bigint()` with min/max/positive/negative validation
  - `symbol()`
  - `literal()` for exact value matching
  - `null()`, `undefined()`, `void()`, `any()`, `unknown()`, `never()`, `nan()`
  
- Complex type validators:
  - `object()` with shape validation, partial, required, extend, merge, pick, omit, passthrough, strict, strip, catchall
  - `array()` with element validation, min/max length, nonempty
  - `tuple()` for fixed-length arrays with specific types
  - `union()` for multiple possible types
  - `discriminatedUnion()` for optimized union validation
  - `intersection()` for combining schemas
  - `record()` for key-value pairs
  - `map()` and `set()` validators
  - `enum()` for enumeration validation
  - `promise()` for Promise validation
  - `lazy()` for recursive schemas
  - `function()` with args and returns validation

- Advanced features:
  - `transform()` for data transformation
  - `refine()` and `superRefine()` for custom validation
  - `default()` for default values
  - `catch()` for error recovery
  - `optional()`, `nullable()`, `nullish()` modifiers
  - `preprocess()` for input preprocessing
  - `pipeline()` for chained transformations
  - `effects()` for side effects and async validation
  - `describe()` for schema documentation
  - `brand()` for branded types
  - `readonly()` for immutable types

- Plugin architecture:
  - Extensible validation system
  - Example credit card validator plugin
  - Custom error messages and formatting

- CLI tool (`oxog-validator`):
  - Generate schemas from TypeScript types
  - Validate JSON files against schemas
  - Watch mode for development

- Build features:
  - CommonJS and ESM dual package support
  - Full TypeScript declarations
  - Rollup bundling with optimizations
  - Tree-shaking support

- Testing:
  - Jest test suite
  - Property-based testing with fast-check
  - Performance benchmarks vs Zod

### Performance
- Zero runtime dependencies
- Smaller bundle size than Zod
- Optimized for tree-shaking
- JIT compilation ready

### Developer Experience
- 100% TypeScript with strict mode
- Comprehensive type inference
- Fluent API design
- Detailed error messages with paths
- Async validation support

## [Unreleased]
### Planned
- Additional validators (email providers, phone numbers, etc.)
- More plugin examples
- Performance optimizations with JIT compilation
- Internationalization support for error messages
- Schema serialization/deserialization
- OpenAPI schema generation
- JSON Schema compatibility