/**
 * Field error for validation
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Base domain error
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON(): { code: string; message: string } {
    return { code: this.code, message: this.message };
  }
}

/**
 * Validation error with field details
 */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly fields: FieldError[];

  constructor(message: string, fields: FieldError[] = []) {
    super(message);
    this.fields = fields;
  }

  override toJSON(): { code: string; message: string; fields: FieldError[] } {
    return {
      code: this.code,
      message: this.message,
      fields: this.fields,
    };
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(resourceType: string, id: string) {
    super(`${resourceType} with id '${id}' not found`);
  }
}

/**
 * Resource already exists error
 */
export class ConflictError extends DomainError {
  readonly code = 'RESOURCE_EXISTS';
  readonly statusCode = 409;
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
  }

  override toJSON(): { code: string; message: string; field?: string } {
    return {
      code: this.code,
      message: this.message,
      ...(this.field && { field: this.field }),
    };
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;
}

/**
 * Forbidden error
 */
export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;
}
