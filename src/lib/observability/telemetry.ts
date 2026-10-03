import { appEnv } from '@/app/config/env';
import { normalizeError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

export interface TelemetryEvent {
  type: 'error' | 'unhandled-rejection' | 'metric' | 'navigation' | 'custom';
  name: string;
  payload?: Record<string, unknown>;
  at: number;
  sessionId: string;
}
const SESSION_KEY = 'mobilex.telemetry.session';
const QUEUE_KEY = 'mobilex.telemetry.queue';
const MAX_QUEUE = 40;

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
  } catch {
    /* ignore */
  }
  const value =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    sessionStorage.setItem(SESSION_KEY, value);
  } catch {
    /* ignore */
  }
  return value;
}
function sanitizedUrl(): string {
  try {
    const url = new URL(location.href);
    return `${url.pathname}${url.hash ? '#…' : ''}`;
  } catch {
    return '';
  }
}
function readQueue(): TelemetryEvent[] {
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function writeQueue(events: TelemetryEvent[]) {
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-MAX_QUEUE)));
  } catch {
    /* ignore */
  }
}

async function flush(events: TelemetryEvent[]): Promise<void> {
  if (!events.length || !appEnv.observabilityEndpoint) return;
  const body = JSON.stringify({
    app: 'Mobilex',
    version: appEnv.version,
    environment: appEnv.appEnv,
    events,
  });
  try {
    if (navigator.sendBeacon) {
      const accepted = navigator.sendBeacon(
        appEnv.observabilityEndpoint,
        new Blob([body], { type: 'application/json' }),
      );
      if (accepted) return;
    }
    await fetch(appEnv.observabilityEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    /* telemetry must never break the app */
  }
}

export function track(event: Omit<TelemetryEvent, 'at' | 'sessionId'>): void {
  const item: TelemetryEvent = { ...event, at: Date.now(), sessionId: sessionId() };
  const queue = [...readQueue(), item].slice(-MAX_QUEUE);
  writeQueue(queue);
  void flush(queue).then(() => {
    if (appEnv.observabilityEndpoint) writeQueue([]);
  });
}

export function trackError(error: unknown, context?: Record<string, unknown>): void {
  const normalized = normalizeError(error);
  track({
    type: 'error',
    name: normalized.code,
    payload: {
      message: normalized.message,
      status: normalized.status,
      retryable: normalized.retryable,
      pathname: sanitizedUrl(),
      ...context,
    },
  });
  logger.error('Telemetry error captured', error, context);
}

export function initGlobalObservability(): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onError = (event: ErrorEvent) =>
    trackError(event.error ?? new Error(event.message), {
      source: 'window',
      filename: event.filename || undefined,
    });
  const onReject = (event: PromiseRejectionEvent) =>
    trackError(event.reason, { source: 'unhandledrejection' });
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onReject);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onReject);
  };
}
