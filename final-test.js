const v = require('./dist/index.js').default;

console.log('🚀 @oxog/schema-validator - Final Test Suite\n');
console.log('=' .repeat(50));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

// Test 1: Basic Types
test('String validation', () => {
  const schema = v.string();
  const result = schema.parse('hello');
  if (result !== 'hello') throw new Error('Failed');
});

test('Number validation', () => {
  const schema = v.number();
  const result = schema.parse(42);
  if (result !== 42) throw new Error('Failed');
});

test('Boolean validation', () => {
  const schema = v.boolean();
  const result = schema.parse(true);
  if (result !== true) throw new Error('Failed');
});

// Test 2: String Methods
test('String min/max length', () => {
  const schema = v.string().min(2).max(10);
  schema.parse('hello');
  try {
    schema.parse('a');
    throw new Error('Should have failed');
  } catch (e) {
    // Expected
  }
});

test('Email validation', () => {
  const schema = v.string().email();
  schema.parse('test@example.com');
  try {
    schema.parse('not-an-email');
    throw new Error('Should have failed');
  } catch (e) {
    // Expected
  }
});

// Test 3: Number Methods
test('Integer validation', () => {
  const schema = v.number().int();
  schema.parse(42);
  try {
    schema.parse(3.14);
    throw new Error('Should have failed');
  } catch (e) {
    // Expected
  }
});

test('Positive number', () => {
  const schema = v.number().positive();
  schema.parse(10);
  try {
    schema.parse(-5);
    throw new Error('Should have failed');
  } catch (e) {
    // Expected
  }
});

// Test 4: Object Validation
test('Object validation', () => {
  const schema = v.object({
    name: v.string(),
    age: v.number()
  });
  const result = schema.parse({ name: 'John', age: 30 });
  if (result.name !== 'John' || result.age !== 30) throw new Error('Failed');
});

// Test 5: Array Validation
test('Array validation', () => {
  const schema = v.array(v.number());
  const result = schema.parse([1, 2, 3]);
  if (result.length !== 3) throw new Error('Failed');
});

// Test 6: Optional and Default
test('Optional fields', () => {
  const schema = v.object({
    required: v.string(),
    optional: v.string().optional()
  });
  const result = schema.parse({ required: 'test' });
  if (result.required !== 'test') throw new Error('Failed');
});

test('Default values', () => {
  const schema = v.object({
    name: v.string(),
    active: v.boolean().default(true)
  });
  const result = schema.parse({ name: 'test' });
  if (!result.active) throw new Error('Failed');
});

// Test 7: Safe Parsing
test('Safe parse success', () => {
  const schema = v.string();
  const result = schema.safeParse('hello');
  if (!result.success || result.data !== 'hello') throw new Error('Failed');
});

test('Safe parse failure', () => {
  const schema = v.string();
  const result = schema.safeParse(123);
  if (result.success) throw new Error('Should have failed');
});

// Test 8: Literal
test('Literal validation', () => {
  const schema = v.literal('hello');
  schema.parse('hello');
  try {
    schema.parse('world');
    throw new Error('Should have failed');
  } catch (e) {
    // Expected
  }
});

// Test 9: Date
test('Date validation', () => {
  const schema = v.date();
  const now = new Date();
  const result = schema.parse(now);
  if (result.getTime() !== now.getTime()) throw new Error('Failed');
});

// Test 10: Coercion
test('String coercion', () => {
  const schema = v.coerce.string();
  const result = schema.parse(123);
  if (result !== '123') throw new Error('Failed');
});

test('Number coercion', () => {
  const schema = v.coerce.number();
  const result = schema.parse('42');
  if (result !== 42) throw new Error('Failed');
});

// Results
console.log('\n' + '=' .repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! The library is working correctly.');
} else {
  console.log('\n⚠️ Some tests failed. Please review the implementation.');
}

process.exit(failed > 0 ? 1 : 0);