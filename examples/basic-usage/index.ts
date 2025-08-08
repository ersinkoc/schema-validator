import v from '@oxog/schema-validator';
import type { Infer } from '@oxog/schema-validator';

// Basic primitive schemas
const nameSchema = v.string().min(2).max(50);
const ageSchema = v.number().int().positive().max(120);
const emailSchema = v.string().email();
const activeSchema = v.boolean();

// Object schema with nested validation
const userSchema = v.object({
  id: v.string().uuid(),
  name: nameSchema,
  age: ageSchema.optional(),
  email: emailSchema,
  active: activeSchema.default(true),
  profile: v.object({
    bio: v.string().max(500).optional(),
    avatar: v.string().url().optional(),
    social: v.object({
      twitter: v.string().regex(/^@\w+$/).optional(),
      github: v.string().optional(),
      linkedin: v.string().url().optional()
    }).optional()
  }),
  roles: v.array(v.enum(['admin', 'user', 'moderator'])).min(1),
  metadata: v.record(v.string(), v.any()).optional(),
  createdAt: v.date(),
  updatedAt: v.date()
});

// Infer TypeScript type from schema
type User = Infer<typeof userSchema>;

// Example usage
async function validateUser() {
  const rawData = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    age: 30,
    email: 'john.doe@example.com',
    profile: {
      bio: 'Software developer passionate about TypeScript',
      avatar: 'https://example.com/avatar.jpg',
      social: {
        twitter: '@johndoe',
        github: 'johndoe'
      }
    },
    roles: ['user', 'moderator'],
    metadata: {
      source: 'web',
      referrer: 'google'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };

  try {
    // Synchronous parsing
    const user = userSchema.parse(rawData);
    console.log('Valid user:', user);

    // Type-safe access
    console.log('User email:', user.email);
    console.log('User roles:', user.roles);
  } catch (error) {
    console.error('Validation error:', error);
  }

  // Safe parsing (doesn't throw)
  const result = userSchema.safeParse(rawData);
  if (result.success) {
    console.log('Valid user:', result.data);
  } else {
    console.error('Validation errors:', result.error.format());
  }

  // Async parsing
  const asyncResult = await userSchema.safeParseAsync(rawData);
  if (asyncResult.success) {
    console.log('Async validation successful');
  }
}

// Union types
const responseSchema = v.union([
  v.object({
    status: v.literal('success'),
    data: v.any()
  }),
  v.object({
    status: v.literal('error'),
    message: v.string(),
    code: v.number()
  })
]);

type ApiResponse = Infer<typeof responseSchema>;

// Array validation
const itemsSchema = v.array(
  v.object({
    id: v.number(),
    name: v.string(),
    price: v.number().positive(),
    inStock: v.boolean()
  })
).min(1).max(100);

// Transform and refine
const processedDataSchema = v.object({
  input: v.string()
}).transform(data => ({
  ...data,
  processed: data.input.toUpperCase(),
  timestamp: new Date()
})).refine(
  data => data.processed.length > 0,
  'Processed data cannot be empty'
);

// Coercion
const coercedSchema = v.object({
  count: v.coerce.number(),
  active: v.coerce.boolean(),
  date: v.coerce.date()
});

// Tuple validation
const coordinatesSchema = v.tuple([
  v.number().min(-180).max(180), // longitude
  v.number().min(-90).max(90)     // latitude
]);

// Record/dictionary validation
const settingsSchema = v.record(
  v.string(),
  v.union([v.string(), v.number(), v.boolean()])
);

// Partial and required modifiers
const partialUserSchema = userSchema.partial();
const requiredUserSchema = userSchema.required();

// Pick and omit
const userCredentialsSchema = userSchema.pick(['email', 'name']);
const publicUserSchema = userSchema.omit(['metadata']);

// Merge schemas
const extendedUserSchema = userSchema.merge(
  v.object({
    lastLogin: v.date().optional(),
    loginCount: v.number().int().nonnegative().default(0)
  })
);

// Custom error messages
const customErrorSchema = v.object({
  username: v.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: v.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

// Lazy for recursive types
type Category = {
  name: string;
  subcategories?: Category[];
};

const categorySchema: v.Schema<Category> = v.lazy(() =>
  v.object({
    name: v.string(),
    subcategories: v.array(categorySchema).optional()
  })
);

// Default values
const configSchema = v.object({
  port: v.number().default(3000),
  host: v.string().default('localhost'),
  debug: v.boolean().default(false),
  retries: v.number().int().positive().default(3)
});

// Nullable and nullish
const nullableSchema = v.string().nullable(); // string | null
const nullishSchema = v.string().nullish();   // string | null | undefined

// Promise validation
const asyncDataSchema = v.promise(v.object({
  data: v.array(v.any()),
  total: v.number()
}));

// Run example
validateUser();

export {
  userSchema,
  responseSchema,
  itemsSchema,
  processedDataSchema,
  coercedSchema,
  coordinatesSchema,
  settingsSchema,
  customErrorSchema,
  categorySchema,
  configSchema
};