// Basic usage examples for @oxog/schema-validator
const v = require('../dist/index.js').default;

console.log('=== Basic Usage Examples ===\n');

// 1. Simple string validation
console.log('1. String validation:');
const emailSchema = v.string().email();
const emailResult = emailSchema.safeParse('user@example.com');
console.log('Valid email:', emailResult.success ? emailResult.data : emailResult.error.issues);

const invalidEmail = emailSchema.safeParse('not-an-email');
console.log('Invalid email:', invalidEmail.success ? 'Unexpected' : 'Validation failed (expected)');

// 2. Number validation with constraints
console.log('\n2. Number validation:');
const ageSchema = v.number().int().min(0).max(120);
console.log('Valid age (25):', ageSchema.safeParse(25).success);
console.log('Invalid age (-5):', ageSchema.safeParse(-5).success);
console.log('Invalid age (3.14):', ageSchema.safeParse(3.14).success);

// 3. Object schema
console.log('\n3. Object validation:');
const userSchema = v.object({
  name: v.string().min(2),
  email: v.string().email(),
  age: v.number().int().positive(),
  active: v.boolean().default(true)
});

const validUser = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
};

const userResult = userSchema.safeParse(validUser);
console.log('Valid user:', userResult.success ? 'Passed' : 'Failed');
if (userResult.success) {
  console.log('User data:', userResult.data);
}

// 4. Array validation
console.log('\n4. Array validation:');
const tagsSchema = v.array(v.string()).min(1).max(5);
const tags = ['javascript', 'typescript', 'nodejs'];
console.log('Valid tags:', tagsSchema.safeParse(tags).success);
console.log('Empty array:', tagsSchema.safeParse([]).success);

// 5. Union types
console.log('\n5. Union types:');
const idSchema = v.union([
  v.string().uuid(),
  v.number().int().positive()
]);

console.log('UUID string:', idSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success);
console.log('Positive integer:', idSchema.safeParse(123).success);
console.log('Negative number:', idSchema.safeParse(-123).success);

// 6. Transform
console.log('\n6. Transform:');
const upperCaseSchema = v.string().transform(s => s.toUpperCase());
const transformed = upperCaseSchema.parse('hello world');
console.log('Transformed:', transformed);

// 7. Optional and nullable
console.log('\n7. Optional and nullable:');
const profileSchema = v.object({
  bio: v.string().optional(),
  website: v.string().url().nullable(),
  followers: v.number().default(0)
});

const profile = profileSchema.parse({});
console.log('Profile with defaults:', profile);

// 8. Literal values
console.log('\n8. Literal values:');
const statusSchema = v.literal('active');
console.log('Literal "active":', statusSchema.safeParse('active').success);
console.log('Literal "inactive":', statusSchema.safeParse('inactive').success);

// 9. Enum
console.log('\n9. Enum:');
const roleSchema = v.enum(['admin', 'user', 'guest']);
console.log('Valid role "admin":', roleSchema.safeParse('admin').success);
console.log('Invalid role "superuser":', roleSchema.safeParse('superuser').success);

// 10. Date validation
console.log('\n10. Date validation:');
const dateSchema = v.date().min(new Date('2020-01-01')).max(new Date('2030-01-01'));
const now = new Date();
console.log('Current date valid:', dateSchema.safeParse(now).success);

console.log('\n=== All examples completed ===');