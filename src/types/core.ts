export type Locale = 'fa' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type UserRole = 'admin' | 'product_manager' | 'warehouse' | 'support' | 'customer';

export interface AppUser {
  id: string;
  email?: string;
  fullName?: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface AppErrorShape {
  code: string;
  message: string;
  cause?: unknown;
  retryable?: boolean;
  status?: number;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  requestId?: string;
  durationMs?: number;
  cached?: boolean;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiFailure {
  ok: false;
  error: AppErrorShape;
  meta?: ApiMeta;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}
