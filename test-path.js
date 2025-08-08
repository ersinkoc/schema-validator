const v = require('./dist/index.js').default;

// Test the formatter directly with a mock error
const error = {
  name: 'ValidationError',
  message: 'Validation error',
  issues: [
    { code: 'too_small', message: 'String too short', path: ['name'] },
    { code: 'invalid_type', message: 'Expected number', path: ['age'] },
    { code: 'invalid_string', message: 'Invalid email', path: ['email'] }
  ]
};

const formatted = v.formatError(error);
console.log('Formatted:', formatted);