import { describe, expect, it } from 'vitest';
import { AppError, assertOk, fail, normalizeError, ok } from '@/lib/errors/app-error';

describe('error core', () => {
  it('keeps AppError identity', () => {
    const error = new AppError('FORBIDDEN', 'No access.');
    expect(normalizeError(error)).toBe(error);
  });

  it('normalizes network failures as retryable', () => {
    const error = normalizeError(new TypeError('Failed to fetch'));
    expect(error.code).toBe('NETWORK');
    expect(error.retryable).toBe(true);
  });

  it('supports typed ApiResult', () => {
    expect(assertOk(ok({ id: '1' }))).toEqual({ id: '1' });
    expect(() => assertOk(fail('boom'))).toThrow();
  });
});
