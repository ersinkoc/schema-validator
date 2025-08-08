// Advanced usage examples for @oxog/schema-validator (ESM)
import v from '../dist/index.mjs';

console.log('=== Advanced Usage Examples ===\n');

// 1. Complex nested object with transforms
console.log('1. Complex nested schema:');
const productSchema = v.object({
  id: v.string().uuid(),
  name: v.string().min(3).max(100),
  price: v.number().positive().transform(p => Math.round(p * 100) / 100),
  category: v.enum(['electronics', 'clothing', 'food', 'other']),
  tags: v.array(v.string()).default([]),
  metadata: v.object({
    createdAt: v.date(),
    updatedAt: v.date().optional(),
    createdBy: v.string().uuid()
  }),
  variants: v.array(
    v.object({
      sku: v.string(),
      color: v.string().optional(),
      size: v.string().optional(),
      stock: v.number().int().nonnegative()
    })
  ).optional()
});

const product = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Wireless Headphones',
  price: 99.999,
  category: 'electronics',
  metadata: {
    createdAt: new Date(),
    createdBy: '550e8400-e29b-41d4-a716-446655440001'
  }
};

const productResult = productSchema.safeParse(product);
console.log('Product validation:', productResult.success ? 'Passed' : 'Failed');
if (productResult.success) {
  console.log('Transformed price:', productResult.data.price);
  console.log('Default tags:', productResult.data.tags);
}

// 2. Discriminated union
console.log('\n2. Discriminated union:');
const notificationSchema = v.discriminatedUnion('type', [
  v.object({
    type: v.literal('email'),
    to: v.string().email(),
    subject: v.string(),
    body: v.string()
  }),
  v.object({
    type: v.literal('sms'),
    phoneNumber: v.string().regex(/^\+?[1-9]\d{1,14}$/),
    message: v.string().max(160)
  }),
  v.object({
    type: v.literal('push'),
    deviceToken: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.record(v.string(), v.any()).optional()
  })
]);

const emailNotification = {
  type: 'email',
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Thank you for signing up.'
};

console.log('Email notification:', notificationSchema.safeParse(emailNotification).success);

// 3. Refine with custom validation
console.log('\n3. Custom refinement:');
const passwordSchema = v.string()
  .min(8)
  .refine(
    password => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    password => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    password => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    password => /[!@#$%^&*]/.test(password),
    'Password must contain at least one special character'
  );

const weakPassword = 'password';
const strongPassword = 'SecureP@ss123';

console.log('Weak password:', passwordSchema.safeParse(weakPassword).success);
console.log('Strong password:', passwordSchema.safeParse(strongPassword).success);

// 4. Preprocess and pipeline
console.log('\n4. Preprocessing:');
const preprocessedEmailSchema = v.preprocess(
  val => typeof val === 'string' ? val.trim().toLowerCase() : val,
  v.string().email()
);

const emailWithSpaces = '  USER@EXAMPLE.COM  ';
const processedEmail = preprocessedEmailSchema.parse(emailWithSpaces);
console.log('Original:', JSON.stringify(emailWithSpaces));
console.log('Processed:', processedEmail);

// 5. Recursive schema (lazy)
console.log('\n5. Recursive schema:');
const commentSchema = v.lazy(() =>
  v.object({
    id: v.string(),
    text: v.string(),
    author: v.string(),
    replies: v.array(commentSchema).optional()
  })
);

const nestedComment = {
  id: '1',
  text: 'Great post!',
  author: 'User1',
  replies: [
    {
      id: '2',
      text: 'Thanks!',
      author: 'Author',
      replies: [
        {
          id: '3',
          text: 'You\'re welcome!',
          author: 'User1'
        }
      ]
    }
  ]
};

console.log('Nested comments:', commentSchema.safeParse(nestedComment).success);

// 6. Async validation
console.log('\n6. Async validation:');
const usernameSchema = v.string()
  .min(3)
  .max(20)
  .refine(async (username) => {
    // Simulate API call to check username availability
    await new Promise(resolve => setTimeout(resolve, 100));
    const takenUsernames = ['admin', 'root', 'test'];
    return !takenUsernames.includes(username);
  }, 'Username is already taken');

const checkUsername = async (username) => {
  const result = await usernameSchema.safeParseAsync(username);
  console.log(`Username "${username}":`, result.success ? 'Available' : 'Taken');
};

await checkUsername('admin');
await checkUsername('john123');

// 7. Coercion
console.log('\n7. Coercion:');
const coercedSchema = v.object({
  count: v.coerce.number(),
  active: v.coerce.boolean(),
  createdAt: v.coerce.date()
});

const rawData = {
  count: '42',
  active: 'true',
  createdAt: '2024-01-01'
};

const coercedResult = coercedSchema.parse(rawData);
console.log('Original types:', Object.entries(rawData).map(([k, v]) => `${k}: ${typeof v}`));
console.log('Coerced types:', Object.entries(coercedResult).map(([k, v]) => `${k}: ${typeof v}`));

// 8. Partial and pick
console.log('\n8. Object utilities:');
const fullUserSchema = v.object({
  id: v.string(),
  name: v.string(),
  email: v.string().email(),
  password: v.string(),
  profile: v.object({
    bio: v.string(),
    avatar: v.string().url()
  })
});

const partialUserSchema = fullUserSchema.partial();
const publicUserSchema = fullUserSchema.pick(['id', 'name', 'profile']);

console.log('Partial user (all optional):', partialUserSchema.safeParse({}).success);
console.log('Public user (only selected fields):', 
  publicUserSchema.safeParse({ 
    id: '123', 
    name: 'John',
    profile: { bio: 'Developer', avatar: 'https://example.com/avatar.jpg' }
  }).success
);

// 9. Error formatting
console.log('\n9. Error handling:');
const strictSchema = v.object({
  name: v.string().min(2),
  age: v.number().int().positive(),
  email: v.string().email()
});

const invalidData = {
  name: 'J',
  age: -5,
  email: 'not-an-email'
};

const errorResult = strictSchema.safeParse(invalidData);
if (!errorResult.success) {
  console.log('Validation errors:');
  errorResult.error.issues.forEach(issue => {
    console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
}

console.log('\n=== Advanced examples completed ===');