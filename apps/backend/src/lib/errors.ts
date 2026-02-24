import type { ErrorResponse } from '../types/domain.js';

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  public constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

export function toErrorResponse(error: AppError): ErrorResponse {
  return {
    code: error.code,
    message: error.message,
    ...(typeof error.details === 'undefined' ? {} : { details: error.details }),
  };
}
