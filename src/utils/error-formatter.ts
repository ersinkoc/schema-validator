import { ValidationError, ValidationIssue } from '../types/base';

/**
 * Custom error formatting utilities
 */

export interface FormatOptions {
  /**
   * Include the full path in error messages
   */
  includePath?: boolean;
  
  /**
   * Include error codes
   */
  includeCode?: boolean;
  
  /**
   * Include expected/received types
   */
  includeTypes?: boolean;
  
  /**
   * Indentation for nested errors
   */
  indent?: string;
  
  /**
   * Maximum depth for nested errors
   */
  maxDepth?: number;
  
  /**
   * Custom message formatter
   */
  messageFormatter?: (issue: ValidationIssue) => string;
  
  /**
   * Color output (for terminal)
   */
  colors?: boolean;
}

/**
 * Format a validation error as a human-readable string
 */
export function formatError(
  error: ValidationError,
  options: FormatOptions = {}
): string {
  const {
    includePath = true,
    includeCode = false,
    includeTypes = true,
    indent = '  ',
    maxDepth = 10,
    messageFormatter,
    colors = false
  } = options;

  const lines: string[] = [];
  
  // Group issues by path for better organization
  const issuesByPath = new Map<string, ValidationIssue[]>();
  
  for (const issue of error.issues) {
    const pathKey = issue.path.join('.');
    if (!issuesByPath.has(pathKey)) {
      issuesByPath.set(pathKey, []);
    }
    issuesByPath.get(pathKey)!.push(issue);
  }
  
  // Format each group
  for (const [pathKey, issues] of issuesByPath) {
    const depth = pathKey ? pathKey.split('.').length - 1 : 0;
    
    if (depth > maxDepth) continue;
    
    const currentIndent = indent.repeat(depth);
    
    for (const issue of issues) {
      let message = messageFormatter ? messageFormatter(issue) : issue.message || 'Validation error';
      
      if (includePath && issue.path.length > 0) {
        const pathStr = colors ? colorize(pathKey, 'cyan') : pathKey;
        message = `[${pathStr}] ${message}`;
      }
      
      if (includeCode) {
        const codeStr = colors ? colorize(issue.code, 'gray') : issue.code;
        message = `(${codeStr}) ${message}`;
      }
      
      if (includeTypes && (issue.expected || issue.received)) {
        const typeInfo = [];
        if (issue.expected) {
          const expected = colors ? colorize(issue.expected, 'green') : issue.expected;
          typeInfo.push(`Expected: ${expected}`);
        }
        if (issue.received) {
          const received = colors ? colorize(issue.received, 'red') : issue.received;
          typeInfo.push(`Received: ${received}`);
        }
        message += ` (${typeInfo.join(', ')})`;
      }
      
      lines.push(currentIndent + message);
    }
  }
  
  return lines.join('\n');
}

/**
 * Format error as JSON
 */
export function formatErrorAsJson(
  error: ValidationError,
  pretty = false
): string {
  const data = {
    name: error.name,
    message: error.message,
    issues: error.issues.map(issue => ({
      code: issue.code,
      message: issue.message,
      path: issue.path,
      expected: issue.expected,
      received: issue.received,
      options: issue.options
    }))
  };
  
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Format error as a table (for terminal output)
 */
export function formatErrorAsTable(error: ValidationError): string {
  const rows: string[][] = [
    ['Path', 'Code', 'Message', 'Expected', 'Received']
  ];
  
  for (const issue of error.issues) {
    rows.push([
      issue.path.join('.') || 'root',
      issue.code,
      issue.message || '',
      issue.expected || '',
      issue.received || ''
    ]);
  }
  
  // Calculate column widths
  const firstRow = rows[0];
  if (!firstRow) {
    return '';
  }
  const widths = firstRow.map((_, colIndex) => 
    Math.max(...rows.map(row => row[colIndex]?.length || 0))
  );
  
  // Format rows
  const formattedRows = rows.map((row) => {
    const cells = row.map((cell, colIndex) => 
      cell.padEnd(widths[colIndex] || 0)
    );
    return '│ ' + cells.join(' │ ') + ' │';
  });
  
  // Add borders
  const border = '─';
  const topBorder = '┌' + widths.map(w => border.repeat(w + 2)).join('┬') + '┐';
  const middleBorder = '├' + widths.map(w => border.repeat(w + 2)).join('┼') + '┤';
  const bottomBorder = '└' + widths.map(w => border.repeat(w + 2)).join('┴') + '┘';
  
  return [
    topBorder,
    formattedRows[0],
    middleBorder,
    ...formattedRows.slice(1),
    bottomBorder
  ].join('\n');
}

/**
 * Format error as Markdown
 */
export function formatErrorAsMarkdown(error: ValidationError): string {
  const lines: string[] = [
    '## Validation Error',
    '',
    error.message,
    '',
    '### Issues',
    ''
  ];
  
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? `\`${issue.path.join('.')}\`` : '_root_';
    lines.push(`- **${path}**: ${issue.message || 'Validation error'}`);
    
    if (issue.expected || issue.received) {
      const details = [];
      if (issue.expected) details.push(`Expected: \`${issue.expected}\``);
      if (issue.received) details.push(`Received: \`${issue.received}\``);
      lines.push(`  - ${details.join(', ')}`);
    }
    
    if (issue.code !== 'custom') {
      lines.push(`  - Code: \`${issue.code}\``);
    }
  }
  
  return lines.join('\n');
}

/**
 * Create a custom error formatter
 */
export function createFormatter(
  template: string,
  variables?: Record<string, (issue: ValidationIssue) => string>
): (issue: ValidationIssue) => string {
  return (issue: ValidationIssue) => {
    let result = template;
    
    // Replace built-in variables
    result = result.replace('{path}', issue.path.join('.'));
    result = result.replace('{code}', issue.code);
    result = result.replace('{message}', issue.message || '');
    result = result.replace('{expected}', issue.expected || '');
    result = result.replace('{received}', issue.received || '');
    
    // Replace custom variables
    if (variables) {
      for (const [key, fn] of Object.entries(variables)) {
        result = result.replace(`{${key}}`, fn(issue));
      }
    }
    
    return result;
  };
}

/**
 * Colorize text for terminal output
 */
function colorize(text: string, color: string): string {
  const colors: Record<string, string> = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
  };
  
  const colorCode = colors[color] || colors['reset'];
  return `${colorCode}${text}${colors['reset']}`;
}

/**
 * Get a summary of validation errors
 */
export function getErrorSummary(error: ValidationError): {
  totalIssues: number;
  issuesByCode: Record<string, number>;
  affectedPaths: string[];
} {
  const issuesByCode: Record<string, number> = {};
  const affectedPaths = new Set<string>();
  
  for (const issue of error.issues) {
    issuesByCode[issue.code] = (issuesByCode[issue.code] || 0) + 1;
    if (issue.path.length > 0) {
      affectedPaths.add(issue.path.join('.'));
    }
  }
  
  return {
    totalIssues: error.issues.length,
    issuesByCode,
    affectedPaths: Array.from(affectedPaths)
  };
}

/**
 * Filter validation issues by criteria
 */
export function filterIssues(
  error: ValidationError,
  filter: {
    code?: string;
    path?: string[];
    minDepth?: number;
    maxDepth?: number;
  }
): ValidationIssue[] {
  return error.issues.filter(issue => {
    if (filter.code && issue.code !== filter.code) {
      return false;
    }
    
    if (filter.path) {
      const issuePath = issue.path.slice(0, filter.path.length);
      if (issuePath.join('.') !== filter.path.join('.')) {
        return false;
      }
    }
    
    const depth = issue.path.length;
    if (filter.minDepth !== undefined && depth < filter.minDepth) {
      return false;
    }
    if (filter.maxDepth !== undefined && depth > filter.maxDepth) {
      return false;
    }
    
    return true;
  });
}