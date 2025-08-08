// Test both import methods
const vBuilt = require('./dist/index.js').default;
const vSource = require('./src/index.ts').default;

console.log('Built v:', typeof vBuilt, Object.keys(vBuilt).slice(0, 10));
console.log('Source v:', typeof vSource, Object.keys(vSource).slice(0, 10));

// Test simple object
const schema = vBuilt.object({ name: vBuilt.string() });
console.log('Built parse:', schema.safeParse({ name: 'test' }));