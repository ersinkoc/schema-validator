import v from '../../src';
import { 
  formatError,
  formatErrorAsJson,
  formatErrorAsTable,
  formatErrorAsMarkdown,
  createFormatter,
  getErrorSummary,
  filterIssues
} from '../../src/utils/error-formatter';

describe('Error Formatting', () => {
  const createTestError = () => {
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
      return result.error;
    }
    throw new Error('Expected validation to fail');
  };

  describe('formatError', () => {
    it('should format error with default options', () => {
      const error = createTestError();
      const formatted = formatError(error);
      
      expect(formatted).toContain('[name]');
      expect(formatted).toContain('[age]');
      expect(formatted).toContain('[email]');
    });

    it('should format error without path', () => {
      const error = createTestError();
      const formatted = formatError(error, { includePath: false });
      
      expect(formatted).not.toContain('[name]');
      expect(formatted).not.toContain('[age]');
      expect(formatted).not.toContain('[email]');
    });

    it('should format error with code', () => {
      const error = createTestError();
      const formatted = formatError(error, { includeCode: true });
      
      expect(formatted).toContain('(');
      expect(formatted).toContain(')');
    });

    it('should format error with custom formatter', () => {
      const error = createTestError();
      const formatted = formatError(error, {
        messageFormatter: (issue) => `Error at ${issue.path.join('.')}: ${issue.message}`
      });
      
      expect(formatted).toContain('Error at name:');
      expect(formatted).toContain('Error at age:');
      expect(formatted).toContain('Error at email:');
    });
  });

  describe('formatErrorAsJson', () => {
    it('should format error as JSON', () => {
      const error = createTestError();
      const json = formatErrorAsJson(error);
      const parsed = JSON.parse(json);
      
      expect(parsed.name).toBe('ValidationError');
      expect(parsed.issues).toBeInstanceOf(Array);
      expect(parsed.issues.length).toBeGreaterThan(0);
    });

    it('should format error as pretty JSON', () => {
      const error = createTestError();
      const json = formatErrorAsJson(error, true);
      
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });
  });

  describe('formatErrorAsTable', () => {
    it('should format error as table', () => {
      const error = createTestError();
      const table = formatErrorAsTable(error);
      
      expect(table).toContain('┌');
      expect(table).toContain('┐');
      expect(table).toContain('│');
      expect(table).toContain('Path');
      expect(table).toContain('Code');
      expect(table).toContain('Message');
    });
  });

  describe('formatErrorAsMarkdown', () => {
    it('should format error as Markdown', () => {
      const error = createTestError();
      const markdown = formatErrorAsMarkdown(error);
      
      expect(markdown).toContain('## Validation Error');
      expect(markdown).toContain('### Issues');
      expect(markdown).toContain('- **');
      expect(markdown).toContain('`');
    });
  });

  describe('createFormatter', () => {
    it('should create custom formatter with template', () => {
      const formatter = createFormatter('{path}: {message} ({code})');
      const error = createTestError();
      
      if (error.issues[0]) {
        const formatted = formatter(error.issues[0]);
        expect(formatted).toContain(':');
        expect(formatted).toContain('(');
        expect(formatted).toContain(')');
      }
    });

    it('should support custom variables', () => {
      const formatter = createFormatter('{path} - {severity}', {
        severity: (issue) => issue.code === 'too_small' ? 'ERROR' : 'WARNING'
      });
      
      const error = createTestError();
      if (error.issues[0]) {
        const formatted = formatter(error.issues[0]);
        expect(formatted).toMatch(/ERROR|WARNING/);
      }
    });
  });

  describe('getErrorSummary', () => {
    it('should get error summary', () => {
      const error = createTestError();
      const summary = getErrorSummary(error);
      
      expect(summary.totalIssues).toBeGreaterThan(0);
      expect(summary.issuesByCode).toBeDefined();
      expect(summary.affectedPaths).toBeInstanceOf(Array);
      expect(summary.affectedPaths).toContain('name');
      expect(summary.affectedPaths).toContain('age');
      expect(summary.affectedPaths).toContain('email');
    });
  });

  describe('filterIssues', () => {
    it('should filter issues by code', () => {
      const error = createTestError();
      const filtered = filterIssues(error, { code: 'too_small' });
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(issue => issue.code === 'too_small')).toBe(true);
    });

    it('should filter issues by path', () => {
      const error = createTestError();
      const filtered = filterIssues(error, { path: ['name'] });
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(issue => issue.path[0] === 'name')).toBe(true);
    });

    it('should filter issues by depth', () => {
      const schema = v.object({
        user: v.object({
          profile: v.object({
            name: v.string()
          })
        })
      });
      
      const result = schema.safeParse({ user: { profile: { name: 123 } } });
      if (!result.success) {
        const filtered = filterIssues(result.error, { minDepth: 2 });
        expect(filtered.every(issue => issue.path.length >= 2)).toBe(true);
      }
    });
  });
});