import type { ApiFailure, ApiMeta, ApiResult, AppErrorShape } from '@/types/core';

export type AppErrorCode =
  | 'UNKNOWN'
  | 'CONFIGURATION'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'DATABASE'
  | 'RATE_LIMIT'
  | 'CONFLICT'
  | 'ABORTED';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;
  readonly retryable: boolean;
  readonly status?: number;
  readonly details?: Record<string, unknown>;

  constructor(
    code: AppErrorCode,
    message: string,
    options?: {
      cause?: unknown;
      retryable?: boolean;
      status?: number;
      details?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = options?.cause;
    this.retryable = options?.retryable ?? false;
    this.status = options?.status;
    this.details = options?.details;
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return new AppError('TIMEOUT', 'The request timed out.', { cause: error, retryable: true });
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new AppError('ABORTED', 'The request was aborted.', { cause: error });
  }
  if (error instanceof TypeError && /fetch|network|failed to fetch/i.test(error.message)) {
    return new AppError('NETWORK', 'Network request failed.', { cause: error, retryable: true });
  }
  if (error instanceof Error && /timeout|timed out/i.test(error.message)) {
    return new AppError('TIMEOUT', 'The request timed out.', { cause: error, retryable: true });
  }
  if (error instanceof Error) return new AppError('UNKNOWN', error.message || 'Unknown application error.', { cause: error });
  return new AppError('UNKNOWN', 'An unknown application error occurred.', { cause: error });
}

export function toAppErrorShape(error: unknown): AppErrorShape {
  const normalized = normalizeError(error);
  return {
    code: normalized.code,
    message: normalized.message,
    cause: normalized.cause,
    retryable: normalized.retryable,
    status: normalized.status,
    details: normalized.details,
  };
}

export function ok<T>(data: T, meta?: ApiMeta): ApiResult<T> {
  return { ok: true, data, meta };
}

export function fail<T = never>(error: unknown, meta?: ApiMeta): ApiResult<T> {
  const result: ApiFailure = { ok: false, error: toAppErrorShape(error), meta };
  return result as ApiResult<T>;
}

export function assertOk<T>(result: ApiResult<T>): T {
  if (result.ok) return result.data;
  throw new AppError(
    (result.error.code as AppErrorCode) || 'UNKNOWN',
    result.error.message,
    { retryable: result.error.retryable, status: result.error.status, details: result.error.details },
  );
}

export function isAppErrorCode(value: string): value is AppErrorCode {
  return [
    'UNKNOWN', 'CONFIGURATION', 'NETWORK', 'TIMEOUT', 'AUTH_REQUIRED',
    'FORBIDDEN', 'NOT_FOUND', 'VALIDATION', 'DATABASE', 'RATE_LIMIT',
    'CONFLICT', 'ABORTED',
  ].includes(value);
}
