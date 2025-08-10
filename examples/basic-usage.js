/**
 * Basic usage examples for @oxog/schema-validator
 * Demonstrates core validation features and common use cases
 */

const v = require('../dist/index.js').default;

console.log('🚀 Basic Schema Validation Examples\n');

// 1. String validation
const emailSchema = v.string().email();
console.log('✉️  Email validation:');
console.log('  Valid:', emailSchema.safeParse('user@example.com').success); // true
console.log('  Invalid:', emailSchema.safeParse('not-email').success); // false

// 2. Number validation
const ageSchema = v.number().int().min(0).max(120);
console.log('\n🔢 Number validation:');
console.log('  Valid age (25):', ageSchema.safeParse(25).success); // true
console.log('  Invalid age (-5):', ageSchema.safeParse(-5).success); // false

// 3. Object schema - Most common use case
const userSchema = v.object({
  name: v.string().min(2),
  email: v.string().email(),
  age: v.number().int().positive(),
  active: v.boolean().default(true)
});

const user = userSchema.parse({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
  // active will default to true
});
console.log('\n👤 User object:', user);

// 4. Arrays
const tagsSchema = v.array(v.string()).min(1).max(5);
console.log('\n🏷️  Array validation:');
console.log('  Valid:', tagsSchema.safeParse(['js', 'ts']).success); // true
console.log('  Empty:', tagsSchema.safeParse([]).success); // false (min: 1)

// 5. Union types - Multiple possible types
const idSchema = v.union([
  v.string().uuid(),
  v.number().int().positive()
]);
console.log('\n🔀 Union types:');
console.log('  UUID:', idSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success); // true
console.log('  Number:', idSchema.safeParse(123).success); // true

// 6. Transform - Modify data during parsing
const normalizedEmail = v.string()
  .email()
  .transform(email => email.toLowerCase().trim());
console.log('\n🔄 Transform:');
console.log('  Input: "  USER@EXAMPLE.COM  "');
console.log('  Output:', normalizedEmail.parse('  USER@EXAMPLE.COM  ')); // user@example.com

// 7. Enum - Restrict to specific values
const roleSchema = v.enum(['admin', 'user', 'guest']);
console.log('\n📋 Enum validation:');
console.log('  Valid role:', roleSchema.safeParse('admin').success); // true
console.log('  Invalid role:', roleSchema.safeParse('superuser').success); // false

// 8. Error handling
console.log('\n❌ Error handling:');
const result = userSchema.safeParse({ name: 'J', age: 'not-a-number' });
if (!result.success) {
  result.error.issues.forEach(issue => {
    console.log(`  ${issue.path.join('.')}: ${issue.message}`);
  });
}

console.log('\n✅ Examples completed!');