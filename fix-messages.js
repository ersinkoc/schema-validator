const fs = require('fs');
const path = require('path');

// List of files that need fixing
const filesToFix = [
  'src/schemas/primitives/bigint.ts',
  'src/schemas/primitives/boolean.ts',
  'src/schemas/primitives/date.ts',
  'src/schemas/primitives/literal.ts',
  'src/schemas/primitives/nan.ts',
  'src/schemas/primitives/never.ts',
  'src/schemas/primitives/null.ts',
  'src/schemas/primitives/number.ts',
  'src/schemas/primitives/symbol.ts',
  'src/schemas/primitives/undefined.ts',
  'src/schemas/primitives/void.ts',
  'src/schemas/complex/discriminated-union.ts',
  'src/schemas/complex/function.ts',
  'src/schemas/complex/map.ts',
  'src/schemas/complex/object.ts',
  'src/schemas/complex/promise.ts',
  'src/schemas/complex/set.ts',
  'src/schemas/complex/tuple.ts'
];

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern to match addIssue calls that are missing message property
  const pattern = /ctx\.addIssue\(\{\s*code:\s*ErrorCode\.\w+,\s*expected:\s*[^,]+,\s*received:\s*[^}]+\}\)/g;
  
  const fixed = content.replace(pattern, (match) => {
    // Extract the expected and received values
    const expectedMatch = match.match(/expected:\s*([^,]+)/);
    const receivedMatch = match.match(/received:\s*([^}]+)/);
    
    if (expectedMatch && receivedMatch) {
      const expected = expectedMatch[1];
      const received = receivedMatch[1];
      
      return match.replace(
        /\{(\s*)code:/,
        `{$1code: ErrorCode.INVALID_TYPE,\n        message: \`Expected \${${expected}}, received \${${received}}\`,\n        code:`
      );
    }
    return match;
  });
  
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`Fixed ${filePath}`);
  }
}

filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  }
});