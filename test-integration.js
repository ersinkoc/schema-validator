const v = require('./dist/index.js').default;

// Reproduce the integration test
const orderItemSchema = v.object({
  productId: v.string().uuid(),
  name: v.string(),
  quantity: v.number().int().positive(),
  price: v.number().positive(),
  discount: v.number().min(0).max(1).default(0)
});

const item = {
  productId: '550e8400-e29b-41d4-a716-446655440002',
  name: 'Laptop',
  quantity: 1,
  price: 999.99,
  discount: 0.1
};

console.log('Testing order item:');
const result = orderItemSchema.safeParse(item);
console.log('Result:', JSON.stringify(result, null, 2));

// Test array of items
const itemsSchema = v.array(orderItemSchema);
const items = [item];
console.log('\nTesting array of items:');
const arrayResult = itemsSchema.safeParse(items);
console.log('Array result:', JSON.stringify(arrayResult, null, 2));