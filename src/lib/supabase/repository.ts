import type { PostgrestError } from '@supabase/supabase-js';
import { requireSupabase } from '@/lib/supabase/client';
import { AppError, normalizeError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

function mapPostgrestError(error: PostgrestError): AppError {
  if (error.code === 'PGRST116')
    return new AppError('NOT_FOUND', error.message, { cause: error, status: 404 });
  if (error.code === '42501')
    return new AppError('FORBIDDEN', 'Permission denied.', { cause: error, status: 403 });
  if (error.code === '23505')
    return new AppError('CONFLICT', 'A record with the same unique value already exists.', {
      cause: error,
      status: 409,
    });
  if (error.code === 'PGRST301')
    return new AppError('RATE_LIMIT', 'Too many requests.', { cause: error, status: 429, retryable: true });
  return new AppError('DATABASE', error.message, {
    cause: error,
    retryable: true,
    details: { code: error.code, hint: error.hint },
  });
}

export async function supabaseQuery<T>(
  operation: () => Promise<{ data: T; error: PostgrestError | null }>,
): Promise<T> {
  const startedAt = performance.now();
  try {
    const { data, error } = await operation();
    if (error) throw mapPostgrestError(error);
    logger.debug('Supabase query completed', { durationMs: Math.round(performance.now() - startedAt) });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getById<T>(table: string, id: string): Promise<T | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw mapPostgrestError(error);
  return data as T | null;
}
