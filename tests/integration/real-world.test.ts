import v, { SchemaDefinition } from '../../src';

describe('Real-world Integration Tests', () => {
  describe('E-commerce Order System', () => {
    const addressSchema = v.object({
      street: v.string().min(1),
      city: v.string().min(1),
      state: v.string().length(2),
      zipCode: v.string().regex(/^\d{5}(-\d{4})?$/),
      country: v.string().default('US')
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

    it('should validate a complete order', () => {
      const order = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        customerId: '550e8400-e29b-41d4-a716-446655440001',
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
      if (!result.success) {
        console.log('Order validation error:', JSON.stringify(result.error, null, 2));
      }
      expect(result.success).toBe(true);
      if (result.success && result.data.items[0]) {
        expect(result.data.items[0].discount).toBe(0.1);
      }
    });

    it('should reject invalid payment methods', () => {
      const invalidOrder = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        customerId: '550e8400-e29b-41d4-a716-446655440001',
        status: 'processing',
        items: [{
          productId: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Laptop',
          quantity: 1,
          price: 999.99,
          discount: 0
        }],
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        paymentMethod: {
          type: 'bitcoin' // Invalid type
        },
        subtotal: 999.99,
        tax: 80.00,
        shipping: 15.00,
        total: 1094.99,
        createdAt: new Date()
      };

      const result = orderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });
  });

  describe('User Authentication System', () => {
    const passwordSchema = v.string()
      .min(8)
      .max(128)
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
        password => /[!@#$%^&*(),.?":{}|<>]/.test(password),
        'Password must contain at least one special character'
      );

    const userRegistrationSchema = v.object({
      username: v.string()
        .min(3)
        .max(20)
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
      email: v.string().email(),
      password: passwordSchema,
      confirmPassword: v.string(),
      firstName: v.string().min(1).max(50),
      lastName: v.string().min(1).max(50),
      dateOfBirth: v.date()
        .refine(
          date => {
            const age = new Date().getFullYear() - date.getFullYear();
            return age >= 13;
          },
          'Must be at least 13 years old'
        ),
      acceptTerms: v.literal(true),
      marketingEmails: v.boolean().default(false)
    }).refine(
      data => data.password === data.confirmPassword,
      'Passwords do not match'
    );

    it('should validate correct registration data', () => {
      const registration = {
        username: 'john_doe123',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        acceptTerms: true,
        marketingEmails: false
      };

      const result = userRegistrationSchema.safeParse(registration);
      expect(result.success).toBe(true);
    });

    it('should reject weak passwords', () => {
      const registration = {
        username: 'john_doe123',
        email: 'john.doe@example.com',
        password: 'weak', // Too short and missing requirements
        confirmPassword: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        acceptTerms: true
      };

      const result = userRegistrationSchema.safeParse(registration);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject mismatched passwords', () => {
      const registration = {
        username: 'john_doe123',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        acceptTerms: true
      };

      const result = userRegistrationSchema.safeParse(registration);
      expect(result.success).toBe(false);
    });
  });

  describe('API Response Validation', () => {
    const paginationSchema = v.object({
      page: v.number().int().positive(),
      pageSize: v.number().int().min(1).max(100),
      total: v.number().int().nonnegative(),
      totalPages: v.number().int().nonnegative(),
      hasNext: v.boolean(),
      hasPrevious: v.boolean()
    });

    const apiResponseSchema = <T extends SchemaDefinition<any, any>>(dataSchema: T) =>
      v.discriminatedUnion('status', [
        v.object({
          status: v.literal('success'),
          data: dataSchema,
          meta: v.object({
            timestamp: v.date(),
            version: v.string(),
            requestId: v.string().uuid()
          }).optional()
        }),
        v.object({
          status: v.literal('error'),
          error: v.object({
            code: v.string(),
            message: v.string(),
            details: v.record(v.string(), v.any()).optional(),
            stack: v.string().optional()
          }),
          meta: v.object({
            timestamp: v.date(),
            version: v.string(),
            requestId: v.string().uuid()
          }).optional()
        })
      ]);

    const userSchema = v.object({
      id: v.string(),
      name: v.string(),
      email: v.string().email()
    });

    const paginatedUsersSchema = apiResponseSchema(
      v.object({
        users: v.array(userSchema),
        pagination: paginationSchema
      })
    );

    it('should validate successful API response', () => {
      const response = {
        status: 'success' as const,
        data: {
          users: [
            { id: '1', name: 'John', email: 'john@example.com' },
            { id: '2', name: 'Jane', email: 'jane@example.com' }
          ],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 2,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        },
        meta: {
          timestamp: new Date(),
          version: '1.0.0',
          requestId: '550e8400-e29b-41d4-a716-446655440000'
        }
      };

      const result = paginatedUsersSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should validate error API response', () => {
      const errorResponse = {
        status: 'error' as const,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User with specified ID was not found',
          details: {
            userId: '123',
            searchedAt: new Date().toISOString()
          }
        }
      };

      const result = paginatedUsersSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
      if (result.success && result.data.status === 'error') {
        expect(result.data.error.code).toBe('USER_NOT_FOUND');
      }
    });
  });

  describe('Configuration File Validation', () => {
    const databaseConfigSchema = v.object({
      host: v.string(),
      port: v.number().int().min(1).max(65535),
      database: v.string(),
      username: v.string(),
      password: v.string(),
      ssl: v.boolean().default(true),
      poolSize: v.number().int().min(1).max(100).default(10),
      connectionTimeout: v.number().int().positive().default(30000)
    });

    const appConfigSchema = v.object({
      app: v.object({
        name: v.string(),
        version: v.string().regex(/^\d+\.\d+\.\d+$/),
        environment: v.enum(['development', 'staging', 'production']),
        debug: v.boolean().default(false),
        port: v.number().int().min(1).max(65535).default(3000),
        baseUrl: v.string().url()
      }),
      database: databaseConfigSchema,
      redis: v.object({
        host: v.string(),
        port: v.number().int().default(6379),
        password: v.string().optional(),
        db: v.number().int().min(0).max(15).default(0)
      }).optional(),
      features: v.record(v.string(), v.boolean()),
      cors: v.object({
        enabled: v.boolean().default(true),
        origins: v.array(v.string().url()),
        credentials: v.boolean().default(true)
      }),
      rateLimit: v.object({
        enabled: v.boolean().default(true),
        windowMs: v.number().int().positive(),
        max: v.number().int().positive()
      }).optional()
    });

    it('should validate complete configuration', () => {
      const config = {
        app: {
          name: 'My Application',
          version: '1.2.3',
          environment: 'production' as const,
          debug: false,
          port: 8080,
          baseUrl: 'https://api.example.com'
        },
        database: {
          host: 'db.example.com',
          port: 5432,
          database: 'myapp',
          username: 'dbuser',
          password: 'secretpassword',
          ssl: true,
          poolSize: 20
        },
        redis: {
          host: 'redis.example.com',
          port: 6379,
          password: 'redispass',
          db: 0
        },
        features: {
          newUI: true,
          betaFeatures: false,
          analytics: true
        },
        cors: {
          enabled: true,
          origins: ['https://app.example.com', 'https://admin.example.com'],
          credentials: true
        },
        rateLimit: {
          enabled: true,
          windowMs: 60000,
          max: 100
        }
      };

      const result = appConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.database.connectionTimeout).toBe(30000); // Default value
      }
    });

    it('should apply default values', () => {
      const minimalConfig = {
        app: {
          name: 'My App',
          version: '1.0.0',
          environment: 'development' as const,
          baseUrl: 'http://localhost:3000'
        },
        database: {
          host: 'localhost',
          port: 5432,
          database: 'dev',
          username: 'dev',
          password: 'dev'
        },
        features: {},
        cors: {
          origins: ['http://localhost:3000']
        }
      };

      const result = appConfigSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.app.debug).toBe(false);
        expect(result.data.app.port).toBe(3000);
        expect(result.data.database.ssl).toBe(true);
        expect(result.data.database.poolSize).toBe(10);
        expect(result.data.cors.enabled).toBe(true);
      }
    });
  });
});