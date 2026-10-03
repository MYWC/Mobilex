const VERSION = 'mobilex-v2.0.0-final';
const APP_CACHE = `${VERSION}-app`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/offline.html'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => !key.startsWith(VERSION)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      const cache = await caches.open(APP_CACHE);
      cache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match('/index.html')) || (await caches.match('/offline.html')) || new Response('Offline', { status:503, headers:{'Content-Type':'text/plain;charset=utf-8'} });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request).then(response => { if (response.ok || response.type === 'opaque') cache.put(request, response.clone()); return response; }).catch(() => null);
  return cached || network || new Response('', { status: 504 });
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin && req.mode === 'navigate') { event.respondWith(networkFirstNavigation(req)); return; }
  if (req.destination === 'script' || req.destination === 'style' || req.destination === 'font' || req.destination === 'image') { event.respondWith(staleWhileRevalidate(req)); }
});
