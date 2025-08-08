const v = require('./dist/index.js').default;

const addressSchema = v.object({
  street: v.string(),
  city: v.string(),
  state: v.string().length(2),
  zipCode: v.string().regex(/^\d{5}(-\d{4})?$/),
  country: v.string().length(2)
});

const orderItemSchema = v.object({
  productId: v.string().uuid(),
  name: v.string(),
  quantity: v.number().int().positive(),
  price: v.number().positive(),
  discount: v.number().min(0).max(1).default(0)
});

const orderSchema = v.object({
  id: v.string().uuid(),
  customerId: v.string().uuid(),
  status: v.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  items: v.array(orderItemSchema).nonempty(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: v.discriminatedUnion('type', [
    v.object({
      type: v.literal('credit_card'),
      last4: v.string().length(4),
      brand: v.enum(['visa', 'mastercard', 'amex', 'discover'])
    }),
    v.object({
      type: v.literal('paypal'),
      email: v.string().email()
    }),
    v.object({
      type: v.literal('bank_transfer'),
      accountNumber: v.string(),
      routingNumber: v.string().length(9)
    })
  ]),
  subtotal: v.number().positive(),
  tax: v.number().nonnegative(),
  shipping: v.number().nonnegative(),
  total: v.number().positive(),
  notes: v.string().optional(),
  createdAt: v.date(),
  updatedAt: v.date().optional()
});

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
    },
    {
      productId: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Mouse',
      quantity: 2,
      price: 29.99,
      discount: 0
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

const result = orderSchema.safeParse(order);
console.log('Success:', result.success);
if (!result.success) {
  console.log('Error:', JSON.stringify(result.error, null, 2));
} else {
  console.log('Discount check:', result.data.items[0].discount);
}