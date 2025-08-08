import { ValidationError, ValidationIssue } from '../../src/types/base';
import { ErrorCode, getParsedType, defaultErrorMap } from '../../src/types/errors';

describe('Error System - Comprehensive Coverage', () => {
  describe('ValidationError Class', () => {
    it('should create ValidationError with single issue', () => {
      const issue: ValidationIssue = {
        code: ErrorCode.INVALID_TYPE,
        message: 'Expected string',
        path: ['field'],
        expected: 'string',
        received: 'number'
      };
      
      const error = new ValidationError(issue);
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Expected string');
      expect(error.issues).toEqual([issue]);
      expect(error.path).toEqual(['field']);
      expect(error.code).toBe(ErrorCode.INVALID_TYPE);
      expect(error.expected).toBe('string');
      expect(error.received).toBe('number');
    });

    it('should create ValidationError with multiple issues', () => {
      const issues: ValidationIssue[] = [
        {
          code: ErrorCode.INVALID_TYPE,
          message: 'Expected string',
          path: ['name'],
          expected: 'string',
          received: 'number'
        },
        {
          code: ErrorCode.TOO_SMALL,
          message: 'Too short',
          path: ['age'],
          options: { minimum: 18 }
        }
      ];
      
      const error = new ValidationError(issues);
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Expected string');
      expect(error.issues).toEqual(issues);
      expect(error.path).toEqual(['name']);
      expect(error.code).toBe(ErrorCode.INVALID_TYPE);
    });

    it('should create ValidationError with empty issue (fallback)', () => {
      const issue: ValidationIssue = {
        code: '',
        path: []
      };
      
      const error = new ValidationError(issue);
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation error');
      expect(error.code).toBe('validation_error');
      expect(error.path).toEqual([]);
    });

    it('should create ValidationError with undefined message (fallback)', () => {
      const issue: ValidationIssue = {
        code: ErrorCode.CUSTOM,
        path: ['test']
      };
      
      const error = new ValidationError(issue);
      
      expect(error.message).toBe('Validation error');
    });

    it('should format error messages correctly', () => {
      const issues: ValidationIssue[] = [
        {
          code: ErrorCode.INVALID_TYPE,
          message: 'Expected string',
          path: ['user', 'name']
        },
        {
          code: ErrorCode.TOO_SMALL,
          message: 'Too short',
          path: []
        },
        {
          code: ErrorCode.CUSTOM,
          message: 'Custom error',
          path: ['nested', 'field', 0]
        }
      ];
      
      const error = new ValidationError(issues);
      const formatted = error.format();
      
      expect(formatted).toContain('[user.name] Expected string');
      expect(formatted).toContain('Too short');
      expect(formatted).toContain('[nested.field.0] Custom error');
    });

    it('should handle empty path in format', () => {
      const issue: ValidationIssue = {
        code: ErrorCode.CUSTOM,
        message: 'Root level error',
        path: []
      };
      
      const error = new ValidationError(issue);
      const formatted = error.format();
      
      expect(formatted).toBe('Root level error');
    });
  });

  describe('getParsedType Function', () => {
    it('should identify string type', () => {
      expect(getParsedType('hello')).toBe('string');
      expect(getParsedType('')).toBe('string');
      expect(getParsedType(String('test'))).toBe('string');
    });

    it('should identify number type', () => {
      expect(getParsedType(123)).toBe('number');
      expect(getParsedType(0)).toBe('number');
      expect(getParsedType(-123.45)).toBe('number');
      expect(getParsedType(Infinity)).toBe('number');
      expect(getParsedType(-Infinity)).toBe('number');
    });

    it('should identify NaN as unknown', () => {
      expect(getParsedType(NaN)).toBe('unknown');
    });

    it('should identify boolean type', () => {
      expect(getParsedType(true)).toBe('boolean');
      expect(getParsedType(false)).toBe('boolean');
      expect(getParsedType(Boolean(1))).toBe('boolean');
    });

    it('should identify function type', () => {
      expect(getParsedType(() => {})).toBe('function');
      expect(getParsedType(function() {})).toBe('function');
      expect(getParsedType(console.log)).toBe('function');
    });

    it('should identify bigint type', () => {
      expect(getParsedType(BigInt(123))).toBe('bigint');
      expect(getParsedType(123n)).toBe('bigint');
    });

    it('should identify symbol type', () => {
      expect(getParsedType(Symbol('test'))).toBe('symbol');
      expect(getParsedType(Symbol.iterator)).toBe('symbol');
    });

    it('should identify undefined type', () => {
      expect(getParsedType(undefined)).toBe('undefined');
      expect(getParsedType(void 0)).toBe('undefined');
    });

    it('should identify null type', () => {
      expect(getParsedType(null)).toBe('null');
    });

    it('should identify array type', () => {
      expect(getParsedType([])).toBe('array');
      expect(getParsedType([1, 2, 3])).toBe('array');
      expect(getParsedType(new Array(5))).toBe('array');
    });

    it('should identify date type', () => {
      expect(getParsedType(new Date())).toBe('date');
      expect(getParsedType(new Date('2023-01-01'))).toBe('date');
    });

    it('should identify map type', () => {
      expect(getParsedType(new Map())).toBe('map');
      expect(getParsedType(new Map([['key', 'value']]))).toBe('map');
    });

    it('should identify set type', () => {
      expect(getParsedType(new Set())).toBe('set');
      expect(getParsedType(new Set([1, 2, 3]))).toBe('set');
    });

    it('should identify promise type', () => {
      expect(getParsedType(Promise.resolve())).toBe('promise');
      expect(getParsedType(new Promise(() => {}))).toBe('promise');
    });

    it('should identify object type', () => {
      expect(getParsedType({})).toBe('object');
      expect(getParsedType({ key: 'value' })).toBe('object');
      expect(getParsedType(new Object())).toBe('object');
    });

    it('should handle unknown edge cases', () => {
      // Mock an object with no typeof match
      const weirdObject = Object.create(null);
      Object.defineProperty(weirdObject, Symbol.toStringTag, {
        value: 'WeirdType'
      });
      
      expect(getParsedType(weirdObject)).toBe('object');
    });
  });

  describe('DefaultErrorMap Function', () => {
    it('should handle INVALID_TYPE error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_TYPE,
        path: [],
        input: 123,
        expected: 'string',
        received: 'number'
      });
      
      expect(message).toBe('Expected string, received number');
    });

    it('should handle INVALID_LITERAL error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_LITERAL,
        path: [],
        input: 'wrong',
        expected: 'correct'
      });
      
      expect(message).toBe('Invalid literal value, expected "correct"');
    });

    it('should handle UNRECOGNIZED_KEYS error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.UNRECOGNIZED_KEYS,
        path: [],
        input: {},
        options: {
          keys: ['unknown1', 'unknown2']
        }
      });
      
      expect(message).toBe('Unrecognized key(s) in object: unknown1, unknown2');
    });

    it('should handle INVALID_UNION error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_UNION,
        path: [],
        input: 'test'
      });
      
      expect(message).toBe('Invalid input');
    });

    it('should handle INVALID_UNION_DISCRIMINATOR error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_UNION_DISCRIMINATOR,
        path: [],
        input: { type: 'unknown' },
        options: {
          expected: ['type1', 'type2']
        }
      });
      
      expect(message).toBe('Invalid discriminator value. Expected type1 | type2');
    });

    it('should handle INVALID_ENUM_VALUE error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_ENUM_VALUE,
        path: [],
        input: 'invalid',
        received: 'invalid',
        options: {
          expected: ['option1', 'option2']
        }
      });
      
      expect(message).toBe('Invalid enum value. Expected option1 | option2, received \'invalid\'');
    });

    it('should handle INVALID_ARGUMENTS error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_ARGUMENTS,
        path: [],
        input: []
      });
      
      expect(message).toBe('Invalid function arguments');
    });

    it('should handle INVALID_RETURN_TYPE error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_RETURN_TYPE,
        path: [],
        input: 'invalid'
      });
      
      expect(message).toBe('Invalid function return type');
    });

    it('should handle INVALID_DATE error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_DATE,
        path: [],
        input: 'invalid-date'
      });
      
      expect(message).toBe('Invalid date');
    });

    it('should handle INVALID_STRING error with custom message', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_STRING,
        path: [],
        input: 'test',
        message: 'Must be valid email'
      });
      
      expect(message).toBe('Must be valid email');
    });

    it('should handle INVALID_STRING error without custom message', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_STRING,
        path: [],
        input: 'test'
      });
      
      expect(message).toBe('Invalid string');
    });

    describe('TOO_SMALL errors', () => {
      it('should handle array too small with inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_SMALL,
          path: [],
          input: [1],
          options: {
            type: 'array',
            minimum: 3,
            inclusive: true
          }
        });
        
        expect(message).toBe('Array must contain at least 3 element(s)');
      });

      it('should handle array too small without inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_SMALL,
          path: [],
          input: [1, 2],
          options: {
            type: 'array',
            minimum: 2,
            inclusive: false
          }
        });
        
        expect(message).toBe('Array must contain more than 2 element(s)');
      });

      it('should handle string too small with inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_SMALL,
          path: [],
          input: 'hi',
          options: {
            type: 'string',
            minimum: 5,
            inclusive: true
          }
        });
        
        expect(message).toBe('String must contain at least 5 character(s)');
      });

      it('should handle string too small without inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_SMALL,
          path: [],
          input: 'test',
          options: {
            type: 'string',
            minimum: 4,
            inclusive: false
          }
        });
        
        expect(message).toBe('String must contain more than 4 character(s)');
      });

      it('should handle number too small with inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_SMALL,
          path: [],
          input: 5,
          options: {
            type: 'number',
            minimum: 10,
            inclusive: true
          }
        });
        
        expect(message).toBe('Number must be greater than or equal to 10');
      });

      it('should handle number too small without inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_SMALL,
          path: [],
          input: 10,
          options: {
            type: 'number',
            minimum: 10,
            inclusive: false
          }
        });
        
        expect(message).toBe('Number must be greater than 10');
      });

      it('should handle date too small with inclusive', () => {
        const minDate = new Date('2023-01-01');
        const message = defaultErrorMap({
          code: ErrorCode.TOO_SMALL,
          path: [],
          input: new Date('2022-12-31'),
          options: {
            type: 'date',
            minimum: minDate.getTime(),
            inclusive: true
          }
        });
        
        expect(message).toBe(`Date must be greater than or equal to ${minDate.toISOString()}`);
      });

      it('should handle date too small without inclusive', () => {
        const minDate = new Date('2023-01-01');
        const message = defaultErrorMap({
          code: ErrorCode.TOO_SMALL,
          path: [],
          input: new Date('2023-01-01'),
          options: {
            type: 'date',
            minimum: minDate.getTime(),
            inclusive: false
          }
        });
        
        expect(message).toBe(`Date must be greater than ${minDate.toISOString()}`);
      });

      it('should handle generic too small', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_SMALL,
          path: [],
          input: 'test',
          options: {
            type: 'other',
            minimum: 10
          }
        });
        
        expect(message).toBe('Too small');
      });
    });

    describe('TOO_BIG errors', () => {
      it('should handle array too big with inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_BIG,
          path: [],
          input: [1, 2, 3, 4],
          options: {
            type: 'array',
            maximum: 3,
            inclusive: true
          }
        });
        
        expect(message).toBe('Array must contain at most 3 element(s)');
      });

      it('should handle array too big without inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_BIG,
          path: [],
          input: [1, 2, 3],
          options: {
            type: 'array',
            maximum: 3,
            inclusive: false
          }
        });
        
        expect(message).toBe('Array must contain less than 3 element(s)');
      });

      it('should handle string too big with inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_BIG,
          path: [],
          input: 'toolong',
          options: {
            type: 'string',
            maximum: 5,
            inclusive: true
          }
        });
        
        expect(message).toBe('String must contain at most 5 character(s)');
      });

      it('should handle string too big without inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_BIG,
          path: [],
          input: 'exact',
          options: {
            type: 'string',
            maximum: 5,
            inclusive: false
          }
        });
        
        expect(message).toBe('String must contain less than 5 character(s)');
      });

      it('should handle number too big with inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_BIG,
          path: [],
          input: 15,
          options: {
            type: 'number',
            maximum: 10,
            inclusive: true
          }
        });
        
        expect(message).toBe('Number must be less than or equal to 10');
      });

      it('should handle number too big without inclusive', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_BIG,
          path: [],
          input: 10,
          options: {
            type: 'number',
            maximum: 10,
            inclusive: false
          }
        });
        
        expect(message).toBe('Number must be less than 10');
      });

      it('should handle date too big with inclusive', () => {
        const maxDate = new Date('2023-12-31');
        const message = defaultErrorMap({
          code: ErrorCode.TOO_BIG,
          path: [],
          input: new Date('2024-01-01'),
          options: {
            type: 'date',
            maximum: maxDate.getTime(),
            inclusive: true
          }
        });
        
        expect(message).toBe(`Date must be less than or equal to ${maxDate.toISOString()}`);
      });

      it('should handle date too big without inclusive', () => {
        const maxDate = new Date('2023-12-31');
        const message = defaultErrorMap({
          code: ErrorCode.TOO_BIG,
          path: [],
          input: new Date('2023-12-31'),
          options: {
            type: 'date',
            maximum: maxDate.getTime(),
            inclusive: false
          }
        });
        
        expect(message).toBe(`Date must be less than ${maxDate.toISOString()}`);
      });

      it('should handle generic too big', () => {
        const message = defaultErrorMap({
          code: ErrorCode.TOO_BIG,
          path: [],
          input: 'test',
          options: {
            type: 'other',
            maximum: 10
          }
        });
        
        expect(message).toBe('Too big');
      });
    });

    it('should handle NOT_MULTIPLE_OF error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.NOT_MULTIPLE_OF,
        path: [],
        input: 7,
        options: {
          multipleOf: 5
        }
      });
      
      expect(message).toBe('Number must be a multiple of 5');
    });

    it('should handle NOT_FINITE error', () => {
      const message = defaultErrorMap({
        code: ErrorCode.NOT_FINITE,
        path: [],
        input: Infinity
      });
      
      expect(message).toBe('Number must be finite');
    });

    it('should handle validation-specific errors', () => {
      const errors = [
        ErrorCode.INVALID_REGEX,
        ErrorCode.INVALID_EMAIL,
        ErrorCode.INVALID_URL,
        ErrorCode.INVALID_UUID,
        ErrorCode.INVALID_CUID,
        ErrorCode.INVALID_DATETIME,
        ErrorCode.INVALID_JSON,
        ErrorCode.INVALID_BASE64,
        ErrorCode.REQUIRED
      ];
      
      const expectedMessages = [
        'Invalid regular expression',
        'Invalid email',
        'Invalid URL',
        'Invalid UUID',
        'Invalid CUID',
        'Invalid datetime string',
        'Invalid JSON',
        'Invalid base64 string',
        'Required'
      ];
      
      errors.forEach((code, index) => {
        const message = defaultErrorMap({
          code,
          path: [],
          input: 'test'
        });
        expect(message).toBe(expectedMessages[index]);
      });
    });

    it('should handle INVALID_IP error with version', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_IP,
        path: [],
        input: '192.168.1.999',
        options: {
          version: 'v4'
        }
      });
      
      expect(message).toBe('Invalid IP address (version v4)');
    });

    it('should handle INVALID_IP error without version', () => {
      const message = defaultErrorMap({
        code: ErrorCode.INVALID_IP,
        path: [],
        input: 'invalid-ip'
      });
      
      expect(message).toBe('Invalid IP address (version unknown)');
    });

    it('should handle CUSTOM error with message', () => {
      const message = defaultErrorMap({
        code: ErrorCode.CUSTOM,
        path: [],
        input: 'test',
        message: 'Custom validation failed'
      });
      
      expect(message).toBe('Custom validation failed');
    });

    it('should handle CUSTOM error without message', () => {
      const message = defaultErrorMap({
        code: ErrorCode.CUSTOM,
        path: [],
        input: 'test'
      });
      
      expect(message).toBe('Invalid input');
    });

    it('should handle unknown error code', () => {
      const message = defaultErrorMap({
        code: 'unknown_error' as ErrorCode,
        path: [],
        input: 'test'
      });
      
      expect(message).toBe('Invalid input');
    });

    it('should handle unknown error code with custom message', () => {
      const message = defaultErrorMap({
        code: 'unknown_error' as ErrorCode,
        path: [],
        input: 'test',
        message: 'Custom unknown error'
      });
      
      expect(message).toBe('Custom unknown error');
    });
  });
});