import { AppError, normalizeError } from '@/lib/errors/app-error';
import { APP, TIME } from '@/app/config/constants';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function requestJson<T>(input: RequestInfo | URL, options: RequestOptions = {}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? TIME.requestTimeoutMs;
  const retries = Math.max(0, options.retries ?? 2);
  const retryDelayMs = Math.max(100, options.retryDelayMs ?? 350);
  const requestId = createRequestId();

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const externalSignal = options.signal;
    const onAbort = () => controller.abort(externalSignal?.reason);
    externalSignal?.addEventListener('abort', onAbort, { once: true });
    const timeout = globalThis.setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), timeoutMs);

    try {
      const response = await fetch(input, {
        ...options,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'X-Request-ID': requestId,
          'X-Mobilex-Version': APP.version,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        const retryable = isRetryableStatus(response.status);
        if (retryable && attempt < retries) {
          await sleep(retryDelayMs * 2 ** attempt);
          continue;
        }
        throw new AppError(
          response.status === 429 ? 'RATE_LIMIT' : response.status === 404 ? 'NOT_FOUND' : 'DATABASE',
          body || `Request failed with status ${response.status}.`,
          { status: response.status, retryable, details: { requestId } },
        );
      }

      if (response.status === 204) return undefined as T;
      return await response.json() as T;
    } catch (error) {
      const normalized = normalizeError(error);
      if (normalized.retryable && attempt < retries) {
        await sleep(retryDelayMs * 2 ** attempt);
        continue;
      }
      throw normalized;
    } finally {
      globalThis.clearTimeout(timeout);
      externalSignal?.removeEventListener('abort', onAbort);
    }
  }

  throw new AppError('UNKNOWN', 'Request failed unexpectedly.');
}
