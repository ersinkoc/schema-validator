# Contributing to @oxog/schema-validator

Thank you for your interest in contributing to @oxog/schema-validator! We welcome contributions from the community and are grateful for any help you can provide.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully
- Put the project's best interests first

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature/fix
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 16+ and npm 7+
- TypeScript knowledge
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/schema-validator.git
cd schema-validator

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Development Commands

```bash
npm run build       # Build the library
npm run test        # Run all tests
npm run test:unit   # Run unit tests only
npm run lint        # Lint the code
npm run typecheck   # Check TypeScript types
npm run benchmark   # Run performance benchmarks
```

## How to Contribute

### Types of Contributions

#### 1. Bug Fixes
- Fix existing issues
- Improve error messages
- Fix edge cases

#### 2. New Features
- Add new validators
- Implement new schema methods
- Add utility functions

#### 3. Performance Improvements
- Optimize validation algorithms
- Reduce bundle size
- Improve memory usage

#### 4. Documentation
- Fix typos and errors
- Add examples
- Improve clarity
- Translate documentation

#### 5. Tests
- Add missing test cases
- Improve test coverage
- Add integration tests
- Add performance tests

### Finding Issues to Work On

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - We need help with these
- `enhancement` - New features
- `bug` - Something needs fixing
- `documentation` - Documentation improvements

## Pull Request Process

### Before Submitting

1. **Check existing issues/PRs** to avoid duplicates
2. **Create an issue first** for significant changes
3. **Update from main** regularly to avoid conflicts
4. **Write tests** for new functionality
5. **Update documentation** if needed
6. **Run all checks locally**:
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

### PR Guidelines

1. **Title**: Use a clear, descriptive title
   - ✅ "Add email validation with custom domains"
   - ❌ "Update string.ts"

2. **Description**: Include:
   - What changed and why
   - Any breaking changes
   - Related issue numbers
   - Testing performed

3. **Commits**: 
   - Use meaningful commit messages
   - Follow conventional commits format:
     ```
     feat: add new validation method
     fix: resolve edge case in number validator
     docs: update API documentation
     test: add tests for union types
     perf: optimize object validation
     refactor: simplify string validator logic
     ```

4. **Size**: Keep PRs focused and manageable
   - One feature/fix per PR
   - Break large changes into smaller PRs

### Review Process

1. All PRs require at least one review
2. CI checks must pass
3. Maintain or improve test coverage
4. Address reviewer feedback promptly
5. Squash commits before merging

## Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit types, clear naming
export function validateEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// ❌ Bad: Implicit types, unclear naming
export function check(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
```

### Style Rules

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Use explicit return types for functions
- Document complex logic with comments
- Keep lines under 100 characters

### File Organization

```
src/
├── schemas/
│   ├── primitives/    # Primitive validators
│   └── complex/        # Complex type validators
├── types/              # TypeScript type definitions
├── core/               # Core functionality
├── plugins/            # Plugin system
└── utils/              # Utility functions
```

## Testing Guidelines

### Test Structure

```typescript
describe('StringSchema', () => {
  describe('email validation', () => {
    it('should validate correct email format', () => {
      const schema = v.string().email();
      expect(schema.safeParse('test@example.com').success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const schema = v.string().email();
      expect(schema.safeParse('not-an-email').success).toBe(false);
    });
  });
});
```

### Test Coverage

- Aim for 100% coverage for new code
- Test edge cases and error conditions
- Include both positive and negative tests
- Test TypeScript types with type tests

### Performance Tests

```typescript
describe('Performance', () => {
  it('should validate 10000 objects in under 100ms', () => {
    const schema = v.object({ /* ... */ });
    const start = performance.now();
    
    for (let i = 0; i < 10000; i++) {
      schema.safeParse(data);
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
```

## Documentation

### Code Documentation

```typescript
/**
 * Validates that a string matches an email format.
 * 
 * @param options - Optional configuration for email validation
 * @returns Schema that validates email strings
 * 
 * @example
 * ```typescript
 * const schema = v.string().email();
 * schema.parse('user@example.com'); // passes
 * schema.parse('invalid'); // throws
 * ```
 */
export function email(options?: EmailOptions): StringSchema {
  // Implementation
}
```

### README Updates

When adding new features, update:
1. Feature list if applicable
2. API documentation
3. Usage examples
4. Migration guide if it affects Zod compatibility

## Reporting Issues

### Bug Reports

Include:
1. **Description**: Clear description of the bug
2. **Reproduction**: Minimal code to reproduce
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: Node version, TypeScript version, OS
6. **Error messages**: Complete error output

### Feature Requests

Include:
1. **Use case**: Why you need this feature
2. **Proposed API**: How it should work
3. **Examples**: Code examples of usage
4. **Alternatives**: Current workarounds
5. **Breaking changes**: Any compatibility concerns

## Release Process

1. **Version bump**: Follow semantic versioning
2. **Changelog**: Update CHANGELOG.md
3. **Tests**: Ensure all tests pass
4. **Build**: Create production build
5. **Tag**: Create git tag for release
6. **Publish**: Publish to npm
7. **Announce**: Update GitHub releases

## Getting Help

- 📖 Read the [documentation](./README.md)
- 💬 Ask questions in [issues](https://github.com/ersinkoc/schema-validator/issues)
- 🐛 Report bugs with reproducible examples
- 💡 Suggest features with use cases
- 🤝 Help others in discussions

## Recognition

Contributors are recognized in:
- GitHub contributors page
- CHANGELOG.md for significant contributions
- Special thanks in release notes

Thank you for contributing to @oxog/schema-validator! 🎉