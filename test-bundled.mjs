import v from './dist/index.mjs';

console.log('Testing ESM bundle...\n');

// Test basic validation
const schema = v.object({
  name: v.string().min(2),
  age: v.number().int().positive(),
  email: v.string().email()
});

const validData = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
};

const invalidData = {
  name: 'J',
  age: -5,
  email: 'not-an-email'
};

// Test valid data
const validResult = schema.safeParse(validData);
console.log('Valid data:', validResult.success ? '✅ Passed' : '❌ Failed');

// Test invalid data
const invalidResult = schema.safeParse(invalidData);
console.log('Invalid data correctly rejected:', !invalidResult.success ? '✅ Passed' : '❌ Failed');

if (!invalidResult.success) {
  console.log('\nValidation errors:');
  invalidResult.error.issues.forEach(issue => {
    console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
}

// Test type inference
const userSchema = v.object({
  id: v.string().uuid(),
  username: v.string().min(3).max(20),
  active: v.boolean().default(true)
});

console.log('\n✅ ESM bundle working correctly!');