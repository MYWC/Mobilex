import { normalizeError } from '@/lib/errors/app-error';

const isProduction = import.meta.env.PROD;

function contextToString(context?: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) return '';
  try {
    return ` ${JSON.stringify(context)}`;
  } catch {
    return '';
  }
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (!isProduction) console.debug(`[Mobilex] ${message}${contextToString(context)}`);
  },
  info(message: string, context?: Record<string, unknown>) {
    if (!isProduction) console.info(`[Mobilex] ${message}${contextToString(context)}`);
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(`[Mobilex] ${message}${contextToString(context)}`);
  },
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    const normalized = error ? normalizeError(error) : undefined;
    console.error(`[Mobilex] ${message}${contextToString(context)}`, normalized ?? '');
  },
};
