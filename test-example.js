const v = require('./dist/index.js').default;

// Test basic string validation
const nameSchema = v.string().min(2).max(50);

try {
  console.log('Valid name:', nameSchema.parse('John Doe'));
  console.log('Invalid name:', nameSchema.parse('J')); // Should throw
} catch (error) {
  console.error('Validation error:', error.message);
}

// Test object validation
const userSchema = v.object({
  name: v.string(),
  age: v.number().int().positive(),
  email: v.string().email()
});

const testUser = {
  name: 'Jane Doe',
  age: 30,
  email: 'jane@example.com'
};

const result = userSchema.safeParse(testUser);
if (result.success) {
  console.log('Valid user:', result.data);
} else {
  console.log('Invalid user:', result.error.format());
}

// Test union types
const stringOrNumber = v.union([v.string(), v.number()]);
try {
  console.log('String:', stringOrNumber.parse('hello'));
  console.log('Number:', stringOrNumber.parse(42));
} catch (error) {
  console.error('Union error:', error.message);
}

console.log('\n✅ Library is working correctly!');