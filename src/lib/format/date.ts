import type { Locale } from '@/types/core';

export function formatDate(value: string | number | Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(value: string | number | Date, locale: Locale): string {
  return formatDate(value, locale, { hour: '2-digit', minute: '2-digit' });
}
