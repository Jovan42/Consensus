import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'class-validator';
import { QueryFailedError } from 'typeorm';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(message, 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
}

// Handle different types of errors
const handleValidationError = (error: ValidationError): ErrorResponse => {
  return {
    success: false,
    message: error.message,
    errors: error.errors,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    path: '',
    method: ''
  };
};

const handleTypeORMError = (error: QueryFailedError): ErrorResponse => {
  let message = 'Database operation failed';
  let statusCode = 500;

  // Handle specific database errors
  if (error.message.includes('duplicate key')) {
    message = 'Resource already exists';
    statusCode = 409;
  } else if (error.message.includes('foreign key constraint')) {
    message = 'Referenced resource does not exist';
    statusCode = 400;
  } else if (error.message.includes('not null constraint')) {
    message = 'Required field is missing';
    statusCode = 400;
  } else if (error.message.includes('invalid input syntax for type uuid')) {
    message = 'Invalid ID format';
    statusCode = 400;
  }

  return {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: '',
    method: ''
  };
};

const handleClassValidatorError = (errors: ValidationError[]): ErrorResponse => {
  const errorMessages = errors.map(error => {
    const constraints = Object.values(error.constraints || {});
    return constraints.join(', ');
  });

  return {
    success: false,
    message: 'Validation failed',
    errors: errorMessages,
    statusCode: 400,
    timestamp: new Date().toISOString(),
    path: '',
    method: ''
  };
};

const handleAppError = (error: AppError): ErrorResponse => {
  return {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    path: '',
    method: ''
  };
};

const handleJSONError = (error: Error): ErrorResponse => {
  return {
    success: false,
    message: 'Invalid JSON format in request body',
    statusCode: 400,
    timestamp: new Date().toISOString(),
    path: '',
    method: ''
  };
};

const handleGenericError = (error: Error): ErrorResponse => {
  return {
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: '',
    method: ''
  };
};

// Main error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let errorResponse: ErrorResponse;

  // Add request info to error response
  const addRequestInfo = (response: ErrorResponse): ErrorResponse => ({
    ...response,
    path: req.path,
    method: req.method
  });

  // Handle different error types
  if (error instanceof AppError) {
    errorResponse = handleAppError(error);
  } else if (error instanceof QueryFailedError) {
    errorResponse = handleTypeORMError(error);
  } else if (Array.isArray(error) && error.length > 0 && error[0] instanceof ValidationError) {
    errorResponse = handleClassValidatorError(error as ValidationError[]);
  } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    errorResponse = handleJSONError(error);
  } else {
    errorResponse = handleGenericError(error);
  }

  // Log error for debugging
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Send error response
  res.status(errorResponse.statusCode).json(addRequestInfo(errorResponse));
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  res.status(404).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
