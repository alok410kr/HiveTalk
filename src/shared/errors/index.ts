// Custom error types for the application

export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Domain errors (business rule violations)
export class DomainError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
  }
}

// Validation errors
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;
  readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message);
    this.fields = fields;
  }
}

// Not found errors
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;
  readonly resource: string;

  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id ${id} not found` : `${resource} not found`);
    this.resource = resource;
  }
}

// Authorization errors
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message: string = "Unauthorized") {
    super(message);
  }
}

// Forbidden errors
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly isOperational = true;

  constructor(message: string = "Forbidden") {
    super(message);
  }
}

// Rate limit errors
export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly isOperational = true;
  readonly retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

// Conflict errors (e.g., duplicate entries)
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
  }
}

// Internal server errors
export class InternalError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false;

  constructor(message: string = "Internal server error") {
    super(message);
  }
}

// Error factory
export const Errors = {
  domain: (message: string) => new DomainError(message),
  validation: (message: string, fields?: Record<string, string>) => new ValidationError(message, fields),
  notFound: (resource: string, id?: string) => new NotFoundError(resource, id),
  unauthorized: (message?: string) => new UnauthorizedError(message),
  forbidden: (message?: string) => new ForbiddenError(message),
  rateLimit: (message: string, retryAfter: number) => new RateLimitError(message, retryAfter),
  conflict: (message: string) => new ConflictError(message),
  internal: (message?: string) => new InternalError(message),
};
