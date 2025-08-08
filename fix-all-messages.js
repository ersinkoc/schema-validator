const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Pattern 1: Fix missing message in INVALID_TYPE calls
  const pattern1 = /ctx\.addIssue\(\{\s*code:\s*ErrorCode\.INVALID_TYPE,\s*expected:\s*([^,]+),\s*received:\s*([^}]+)\s*\}\);/g;
  
  const newContent = content.replace(pattern1, (match, expected, received) => {
    changed = true;
    return `ctx.addIssue({
        code: ErrorCode.INVALID_TYPE,
        message: \`Expected \${${expected}}, received \${${received}}\`,
        expected: ${expected},
        received: ${received}
      });`;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed ${filePath}`);
    return true;
  }
  return false;
}

// Find all TypeScript files in schemas directory
const schemaFiles = glob.sync('src/schemas/**/*.ts', { cwd: __dirname });

let totalFixed = 0;
schemaFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fixFile(fullPath)) {
    totalFixed++;
  }
});

console.log(`Fixed ${totalFixed} files`);