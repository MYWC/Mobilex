import { emit } from '@/lib/events/bus';

export type PerformanceMetricName = 'ttfb' | 'fcp' | 'lcp' | 'cls' | 'inp' | 'navigation';
export interface PerformanceMetric { name: PerformanceMetricName; value: number; rating: 'good' | 'needs-improvement' | 'poor' | 'info'; navigationType?: string; at: number; }

function rating(name: PerformanceMetricName, value: number): PerformanceMetric['rating'] {
  const ranges: Record<PerformanceMetricName, [number, number]> = {
    ttfb: [800, 1800], fcp: [1800, 3000], lcp: [2500, 4000], cls: [0.1, 0.25], inp: [200, 500], navigation: [2500, 4000],
  };
  const pair = ranges[name]; if (!pair) return 'info';
  return value <= pair[0] ? 'good' : value <= pair[1] ? 'needs-improvement' : 'poor';
}

function report(name: PerformanceMetricName, value: number): void {
  if (!Number.isFinite(value)) return;
  const metric: PerformanceMetric = { name, value, rating: rating(name, value), at: Date.now() };
  emit('mobilex:performance', metric);
  window.dispatchEvent(new CustomEvent('mobilex:performance', { detail: metric }));
}

export function startPerformanceMonitoring(): () => void {
  if (typeof window === 'undefined' || !('performance' in window)) return () => undefined;
  const observers: PerformanceObserver[] = [];
  const supported = typeof PerformanceObserver !== 'undefined';
  const requestIdle = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(() => cb({ timeRemaining: () => 0, didTimeout: true }), 1));

  requestIdle(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      report('ttfb', Math.max(0, nav.responseStart - nav.requestStart));
      report('navigation', Math.max(0, nav.loadEventEnd - nav.startTime));
    }
  });

  if (!supported) return () => undefined;
  const observe = (type: string, handler: (list: PerformanceObserverEntryList) => void, options?: PerformanceObserverInit) => {
    try { const observer = new PerformanceObserver(handler); observer.observe({ type, buffered: true, ...(options ?? {}) }); observers.push(observer); } catch { /* unsupported */ }
  };
  observe('paint', list => { for (const entry of list.getEntries()) if (entry.name === 'first-contentful-paint') report('fcp', entry.startTime); });
  observe('largest-contentful-paint', list => { const last = list.getEntries().at(-1); if (last) report('lcp', last.startTime); });
  observe('layout-shift', list => {
    let cls = 0; for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) if (!entry.hadRecentInput) cls += Number(entry.value || 0); report('cls', cls);
  });
  observe('event', list => { const durations = list.getEntries() as Array<PerformanceEntry & { duration: number }>; const max = durations.reduce((m, e) => Math.max(m, e.duration || 0), 0); if (max) report('inp', max); }, { durationThreshold: 40 });
  return () => observers.forEach(observer => observer.disconnect());
}
