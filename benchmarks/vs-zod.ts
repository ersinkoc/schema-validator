import { performance } from 'perf_hooks';
import v from '../src';
import { z } from 'zod';
import * as fs from 'fs';

// Test data
const simpleData = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
};

const complexData = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  user: {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    roles: ['admin', 'user'],
    settings: {
      theme: 'dark',
      notifications: true,
      language: 'en'
    }
  },
  posts: Array.from({ length: 10 }, (_, i) => ({
    id: `post-${i}`,
    title: `Post ${i}`,
    content: 'Lorem ipsum dolor sit amet',
    tags: ['javascript', 'typescript', 'nodejs'],
    published: true,
    createdAt: new Date(),
    author: {
      id: 'author-1',
      name: 'Author Name'
    }
  }))
};

// Schemas
const oxogSimpleSchema = v.object({
  name: v.string(),
  age: v.number(),
  email: v.string().email()
});

const zodSimpleSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email()
});

const oxogComplexSchema = v.object({
  id: v.string().uuid(),
  user: v.object({
    name: v.string(),
    age: v.number().int().positive(),
    email: v.string().email(),
    roles: v.array(v.string()),
    settings: v.object({
      theme: v.enum(['light', 'dark']),
      notifications: v.boolean(),
      language: v.string()
    })
  }),
  posts: v.array(v.object({
    id: v.string(),
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
    createdAt: v.date(),
    author: v.object({
      id: v.string(),
      name: v.string()
    })
  }))
});

const zodComplexSchema = z.object({
  id: z.string().uuid(),
  user: z.object({
    name: z.string(),
    age: z.number().int().positive(),
    email: z.string().email(),
    roles: z.array(z.string()),
    settings: z.object({
      theme: z.enum(['light', 'dark']),
      notifications: z.boolean(),
      language: z.string()
    })
  }),
  posts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()),
    published: z.boolean(),
    createdAt: z.date(),
    author: z.object({
      id: z.string(),
      name: z.string()
    })
  }))
});

// Benchmark function
function benchmark(name: string, fn: () => void, iterations: number = 10000): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return end - start;
}

// Run benchmarks
console.log('=== Performance Benchmarks: @oxog/schema-validator vs Zod ===\n');

const results: any = {
  timestamp: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch
  },
  benchmarks: []
};

// Simple object validation
console.log('1. Simple Object Validation (10,000 iterations)');
const oxogSimpleTime = benchmark('oxog-simple', () => {
  oxogSimpleSchema.safeParse(simpleData);
});
const zodSimpleTime = benchmark('zod-simple', () => {
  zodSimpleSchema.safeParse(simpleData);
});

console.log(`   @oxog/schema-validator: ${oxogSimpleTime.toFixed(2)}ms`);
console.log(`   Zod:                    ${zodSimpleTime.toFixed(2)}ms`);
console.log(`   Speedup:                ${(zodSimpleTime / oxogSimpleTime).toFixed(2)}x\n`);

results.benchmarks.push({
  name: 'Simple Object Validation',
  iterations: 10000,
  oxog: oxogSimpleTime,
  zod: zodSimpleTime,
  speedup: zodSimpleTime / oxogSimpleTime
});

// Complex object validation
console.log('2. Complex Object Validation (1,000 iterations)');
const oxogComplexTime = benchmark('oxog-complex', () => {
  oxogComplexSchema.safeParse(complexData);
}, 1000);
const zodComplexTime = benchmark('zod-complex', () => {
  zodComplexSchema.safeParse(complexData);
}, 1000);

console.log(`   @oxog/schema-validator: ${oxogComplexTime.toFixed(2)}ms`);
console.log(`   Zod:                    ${zodComplexTime.toFixed(2)}ms`);
console.log(`   Speedup:                ${(zodComplexTime / oxogComplexTime).toFixed(2)}x\n`);

results.benchmarks.push({
  name: 'Complex Object Validation',
  iterations: 1000,
  oxog: oxogComplexTime,
  zod: zodComplexTime,
  speedup: zodComplexTime / oxogComplexTime
});

// String validation with transforms
console.log('3. String Validation with Transforms (10,000 iterations)');
const oxogStringSchema = v.string().trim().toLowerCase().email();
const zodStringSchema = z.string().trim().toLowerCase().email();

const oxogStringTime = benchmark('oxog-string', () => {
  oxogStringSchema.safeParse('  TEST@EXAMPLE.COM  ');
});
const zodStringTime = benchmark('zod-string', () => {
  zodStringSchema.safeParse('  TEST@EXAMPLE.COM  ');
});

console.log(`   @oxog/schema-validator: ${oxogStringTime.toFixed(2)}ms`);
console.log(`   Zod:                    ${zodStringTime.toFixed(2)}ms`);
console.log(`   Speedup:                ${(zodStringTime / oxogStringTime).toFixed(2)}x\n`);

results.benchmarks.push({
  name: 'String with Transforms',
  iterations: 10000,
  oxog: oxogStringTime,
  zod: zodStringTime,
  speedup: zodStringTime / oxogStringTime
});

// Array validation
console.log('4. Array Validation (5,000 iterations)');
const arrayData = Array.from({ length: 100 }, (_, i) => i);
const oxogArraySchema = v.array(v.number().int().positive());
const zodArraySchema = z.array(z.number().int().positive());

const oxogArrayTime = benchmark('oxog-array', () => {
  oxogArraySchema.safeParse(arrayData);
}, 5000);
const zodArrayTime = benchmark('zod-array', () => {
  zodArraySchema.safeParse(arrayData);
}, 5000);

console.log(`   @oxog/schema-validator: ${oxogArrayTime.toFixed(2)}ms`);
console.log(`   Zod:                    ${zodArrayTime.toFixed(2)}ms`);
console.log(`   Speedup:                ${(zodArrayTime / oxogArrayTime).toFixed(2)}x\n`);

results.benchmarks.push({
  name: 'Array Validation',
  iterations: 5000,
  oxog: oxogArrayTime,
  zod: zodArrayTime,
  speedup: zodArrayTime / oxogArrayTime
});

// Union validation
console.log('5. Union Type Validation (10,000 iterations)');
const oxogUnionSchema = v.union([
  v.string(),
  v.number(),
  v.boolean(),
  v.null()
]);
const zodUnionSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
]);

const unionTestData = ['test', 42, true, null];
let oxogUnionTime = 0;
let zodUnionTime = 0;

unionTestData.forEach(data => {
  oxogUnionTime += benchmark('oxog-union', () => {
    oxogUnionSchema.safeParse(data);
  }, 2500);
  zodUnionTime += benchmark('zod-union', () => {
    zodUnionSchema.safeParse(data);
  }, 2500);
});

console.log(`   @oxog/schema-validator: ${oxogUnionTime.toFixed(2)}ms`);
console.log(`   Zod:                    ${zodUnionTime.toFixed(2)}ms`);
console.log(`   Speedup:                ${(zodUnionTime / oxogUnionTime).toFixed(2)}x\n`);

results.benchmarks.push({
  name: 'Union Type Validation',
  iterations: 10000,
  oxog: oxogUnionTime,
  zod: zodUnionTime,
  speedup: zodUnionTime / oxogUnionTime
});

// Failed validation performance
console.log('6. Failed Validation Performance (10,000 iterations)');
const invalidData = {
  name: 123, // Should be string
  age: 'thirty', // Should be number
  email: 'not-an-email' // Invalid email
};

const oxogFailTime = benchmark('oxog-fail', () => {
  oxogSimpleSchema.safeParse(invalidData);
});
const zodFailTime = benchmark('zod-fail', () => {
  zodSimpleSchema.safeParse(invalidData);
});

console.log(`   @oxog/schema-validator: ${oxogFailTime.toFixed(2)}ms`);
console.log(`   Zod:                    ${zodFailTime.toFixed(2)}ms`);
console.log(`   Speedup:                ${(zodFailTime / oxogFailTime).toFixed(2)}x\n`);

results.benchmarks.push({
  name: 'Failed Validation',
  iterations: 10000,
  oxog: oxogFailTime,
  zod: zodFailTime,
  speedup: zodFailTime / oxogFailTime
});

// Summary
console.log('=== Summary ===\n');
const avgSpeedup = results.benchmarks.reduce((acc: number, b: any) => acc + b.speedup, 0) / results.benchmarks.length;
console.log(`Average speedup: ${avgSpeedup.toFixed(2)}x faster than Zod`);

// Bundle size comparison (approximate)
console.log('\n=== Bundle Size Comparison ===\n');
console.log('   @oxog/schema-validator: ~8kb gzipped (zero dependencies)');
console.log('   Zod:                    ~14kb gzipped\n');

// Save results to file
fs.writeFileSync('benchmark-results.json', JSON.stringify(results, null, 2));
console.log('Results saved to benchmark-results.json');

// Export for GitHub Actions
if (process.env.GITHUB_ACTIONS) {
  const ghResults = results.benchmarks.map((b: any) => ({
    name: b.name,
    unit: 'ms',
    value: b.oxog,
    extra: `${b.speedup.toFixed(2)}x faster than Zod`
  }));
  console.log(`::set-output name=results::${JSON.stringify(ghResults)}`);
}