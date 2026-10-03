export function appBasePath(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

export function appPath(path = '/'): string {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  if (!clean) return appBasePath();
  return `${appBasePath()}${clean}`;
}

export function resolveAppUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(appPath(path), window.location.origin).href;
}
