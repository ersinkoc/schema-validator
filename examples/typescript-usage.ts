// TypeScript usage examples for @oxog/schema-validator
import v, { Infer, Input, Output } from '../src';

// 1. Type inference
console.log('=== TypeScript Type Inference Examples ===\n');

const userSchema = v.object({
  id: v.string().uuid(),
  username: v.string().min(3).max(20),
  email: v.string().email(),
  age: v.number().int().min(18),
  roles: v.array(v.enum(['admin', 'moderator', 'user'])),
  profile: v.object({
    bio: v.string().optional(),
    avatar: v.string().url().nullable(),
    settings: v.record(v.string(), v.any()).default({})
  }),
  createdAt: v.date(),
  isActive: v.boolean().default(true)
});

// Infer the TypeScript type from the schema
type User = Infer<typeof userSchema>;

// The inferred type is:
// type User = {
//   id: string;
//   username: string;
//   email: string;
//   age: number;
//   roles: ('admin' | 'moderator' | 'user')[];
//   profile: {
//     bio?: string;
//     avatar: string | null;
//     settings: Record<string, any>;
//   };
//   createdAt: Date;
//   isActive: boolean;
// }

// 2. Input vs Output types
const transformSchema = v.object({
  name: v.string().transform(s => s.toUpperCase()),
  count: v.string().transform(s => parseInt(s, 10)),
  tags: v.string().transform(s => s.split(',').map(t => t.trim()))
});

type TransformInput = Input<typeof transformSchema>;
// type TransformInput = {
//   name: string;
//   count: string;
//   tags: string;
// }

type TransformOutput = Output<typeof transformSchema>;
// type TransformOutput = {
//   name: string;
//   count: number;
//   tags: string[];
// }

// 3. Branded types for type safety
const UserIdSchema = v.string().uuid().brand<'UserId'>();
const PostIdSchema = v.string().uuid().brand<'PostId'>();

type UserId = Infer<typeof UserIdSchema>;
type PostId = Infer<typeof PostIdSchema>;

// These are different types, preventing accidental misuse
function getUser(id: UserId): void {
  console.log('Getting user:', id);
}

function getPost(id: PostId): void {
  console.log('Getting post:', id);
}

// 4. Generic schema function
function createPaginatedResponseSchema<T extends v.SchemaDefinition>(
  itemSchema: T
) {
  return v.object({
    items: v.array(itemSchema),
    total: v.number().int().nonnegative(),
    page: v.number().int().positive(),
    pageSize: v.number().int().positive(),
    hasNext: v.boolean(),
    hasPrevious: v.boolean()
  });
}

const paginatedUsersSchema = createPaginatedResponseSchema(userSchema);
type PaginatedUsers = Infer<typeof paginatedUsersSchema>;

// 5. Discriminated union with exhaustive checking
const eventSchema = v.discriminatedUnion('type', [
  v.object({
    type: v.literal('user.created'),
    userId: v.string(),
    email: v.string().email(),
    timestamp: v.date()
  }),
  v.object({
    type: v.literal('user.updated'),
    userId: v.string(),
    changes: v.record(v.string(), v.any()),
    timestamp: v.date()
  }),
  v.object({
    type: v.literal('user.deleted'),
    userId: v.string(),
    reason: v.string().optional(),
    timestamp: v.date()
  })
]);

type Event = Infer<typeof eventSchema>;

function handleEvent(event: Event): void {
  switch (event.type) {
    case 'user.created':
      console.log('User created:', event.email);
      break;
    case 'user.updated':
      console.log('User updated:', event.changes);
      break;
    case 'user.deleted':
      console.log('User deleted:', event.reason);
      break;
    default:
      // TypeScript knows this is exhaustive
      const _exhaustive: never = event;
      throw new Error(`Unhandled event type: ${_exhaustive}`);
  }
}

// 6. Recursive types
type Comment = {
  id: string;
  text: string;
  author: string;
  replies?: Comment[];
};

const commentSchema: v.SchemaDefinition<Comment, Comment> = v.lazy(() =>
  v.object({
    id: v.string(),
    text: v.string(),
    author: v.string(),
    replies: v.array(commentSchema).optional()
  })
);

// 7. Type guards
const stringOrNumberSchema = v.union([v.string(), v.number()]);

function processValue(value: unknown): void {
  const result = stringOrNumberSchema.safeParse(value);
  
  if (result.success) {
    // TypeScript knows result.data is string | number
    if (typeof result.data === 'string') {
      console.log('String length:', result.data.length);
    } else {
      console.log('Number squared:', result.data ** 2);
    }
  } else {
    console.log('Invalid value:', result.error.issues);
  }
}

// 8. Schema composition
const timestampSchema = v.object({
  createdAt: v.date(),
  updatedAt: v.date().optional()
});

const authorSchema = v.object({
  authorId: v.string(),
  authorName: v.string()
});

const postSchema = v.intersection(
  v.object({
    id: v.string(),
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string())
  }),
  timestampSchema,
  authorSchema
);

type Post = Infer<typeof postSchema>;
// Post has all properties from all three schemas

// 9. Custom type predicates
function isValidUser(data: unknown): data is User {
  return userSchema.safeParse(data).success;
}

// Usage
const maybeUser: unknown = { /* ... */ };
if (isValidUser(maybeUser)) {
  // TypeScript knows maybeUser is User here
  console.log(maybeUser.username);
}

// 10. Schema from existing type
interface ExistingUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const existingUserSchema: v.SchemaDefinition<ExistingUser, ExistingUser> = v.object({
  id: v.string(),
  name: v.string(),
  email: v.string().email(),
  role: v.enum(['admin', 'user'])
});

// Ensure schema matches the interface
const _typeCheck: ExistingUser = {} as Infer<typeof existingUserSchema>;

console.log('TypeScript examples demonstrate compile-time type safety');
export { User, Post, Event, Comment };