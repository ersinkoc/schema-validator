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
export declare function formatError(error: ValidationError, options?: FormatOptions): string;
/**
 * Format error as JSON
 */
export declare function formatErrorAsJson(error: ValidationError, pretty?: boolean): string;
/**
 * Format error as a table (for terminal output)
 */
export declare function formatErrorAsTable(error: ValidationError): string;
/**
 * Format error as Markdown
 */
export declare function formatErrorAsMarkdown(error: ValidationError): string;
/**
 * Create a custom error formatter
 */
export declare function createFormatter(template: string, variables?: Record<string, (issue: ValidationIssue) => string>): (issue: ValidationIssue) => string;
/**
 * Get a summary of validation errors
 */
export declare function getErrorSummary(error: ValidationError): {
    totalIssues: number;
    issuesByCode: Record<string, number>;
    affectedPaths: string[];
};
/**
 * Filter validation issues by criteria
 */
export declare function filterIssues(error: ValidationError, filter: {
    code?: string;
    path?: string[];
    minDepth?: number;
    maxDepth?: number;
}): ValidationIssue[];
//# sourceMappingURL=error-formatter.d.ts.map