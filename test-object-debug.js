const v = require('./dist/index.js').default;

// Create schemas with explicit logging
const nameSchema = v.string().min(2);
const ageSchema = v.number().positive();

// Test each individually first
console.log('\nTesting name schema:');
const nameResult = nameSchema.safeParse('J');
console.log('Name result:', JSON.stringify(nameResult, null, 2));

console.log('\nTesting age schema:');
const ageResult = ageSchema.safeParse(-5);
console.log('Age result:', JSON.stringify(ageResult, null, 2));

// Now test in object
console.log('\nTesting object schema:');
const objSchema = v.object({
  name: nameSchema,
  age: ageSchema
});

const objResult = objSchema.safeParse({
  name: 'J',
  age: -5
});

console.log('Object result:', JSON.stringify(objResult, null, 2));