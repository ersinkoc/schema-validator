const v = require('./dist/index.js').default;

// Test individual parts
const order = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  customerId: '550e8400-e29b-41d4-a716-446655440000',
  status: 'processing',
  items: [
    {
      productId: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Laptop',
      quantity: 1,
      price: 999.99,
      discount: 0.1
    }
  ],
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US'
  },
  paymentMethod: {
    type: 'credit_card',
    last4: '4242',
    brand: 'visa'
  },
  subtotal: 1059.97,
  tax: 84.80,
  shipping: 15.00,
  total: 1159.77,
  createdAt: new Date()
};

// Test each field individually
console.log('Testing ID:', v.string().uuid().safeParse(order.id));
console.log('Testing status:', v.enum(['pending', 'processing']).safeParse(order.status));

// Test enum with all values
const statusEnum = v.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
console.log('Testing full enum:', statusEnum.safeParse(order.status));

// Test simpler object
const simpleOrder = v.object({
  id: v.string(),
  status: v.string()
});

console.log('Simple order:', simpleOrder.safeParse({ id: '123', status: 'processing' }));