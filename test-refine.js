const v = require('./dist/index.js').default;

// Test refine on object
const schema = v.object({
  password: v.string(),
  confirmPassword: v.string()
}).refine(
  data => {
    console.log('Refine called with:', data);
    return data.password === data.confirmPassword;
  },
  'Passwords do not match'
);

console.log('Testing matching passwords:');
const result1 = schema.safeParse({
  password: 'test123',
  confirmPassword: 'test123'
});
console.log('Result:', result1.success ? 'Success' : result1.error.issues);

console.log('\nTesting mismatched passwords:');
const result2 = schema.safeParse({
  password: 'test123',
  confirmPassword: 'different'
});
console.log('Result:', result2.success ? 'Success' : result2.error.issues);