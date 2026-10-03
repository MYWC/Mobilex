import type { Locale } from '@/types/core';

function localeCode(locale: Locale): string { return locale === 'fa' ? 'fa-IR' : 'en-US'; }

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeCode(locale)).format(value);
}

export function formatToman(value: number, locale: Locale): string {
  const number = formatNumber(Math.round(value), locale);
  return locale === 'fa' ? `${number} تومان` : `${number} Toman`;
}

export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeCode(locale), { style: 'percent', maximumFractionDigits: 0 }).format(value);
}
