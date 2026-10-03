const EXTERNAL_PROTOCOLS = /^(https?:|mailto:|tel:)/i;

export function hardenExternalAnchors(root: ParentNode = document): void {
  for (const anchor of Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) continue;
    if (!EXTERNAL_PROTOCOLS.test(href)) continue;
    anchor.setAttribute('rel', `${anchor.rel} noopener noreferrer`.trim().replace(/\s+/g, ' '));
  }
}

export function disableUnsafeWindowOpen(): void {
  if (typeof window === 'undefined') return;
  const marker = '__mobilexOriginalWindowOpen';
  const state = window as unknown as Window & { [key: string]: unknown };
  if (state[marker]) return;
  const original = window.open;
  state[marker] = original;
  window.open = function hardenedOpen(url?: string | URL, target?: string, features?: string): Window | null {
    const safeFeatures = target === '_blank' && !(features ?? '').includes('noopener')
      ? `${features ?? ''}${features ? ',' : ''}noopener,noreferrer`
      : features;
    return original.call(window, url, target, safeFeatures);
  };
}
