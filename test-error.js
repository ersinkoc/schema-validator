const v = require('./dist/index.js').default;

const schema = v.object({ 
  name: v.string().min(2), 
  age: v.number().positive(),
  email: v.string().email()
});

const result = schema.safeParse({ 
  name: 'J', 
  age: -5,
  email: 'invalid'
});

if (!result.success) { 
  console.log('Error:', result.error);
  console.log('Issues:', JSON.stringify(result.error.issues, null, 2));
  console.log('Path test:', result.error.issues[0].path);
}