import type { Locale } from '@/types/core';
import { STORAGE_KEYS } from '@/app/config/constants';
import { readStorage, writeStorage } from '@/lib/storage/storage';

export const localeStorageKey = STORAGE_KEYS.locale;

const messages = {
  fa: {
    appName: 'Mobilex',
    appVersion: '2.0',
    heroEyebrow: 'نسل جدید فروشگاه موبایل',
    heroTitle: 'Mobilex 2.0 از همین‌جا شروع می‌شود.',
    heroText:
      'هسته‌ی جدید فروشگاه برای سرعت، مقیاس‌پذیری، تجربه کاربری حرفه‌ای و توسعه‌ی بدون آشفتگی ساخته شده است.',
    configured: 'Supabase متصل است',
    notConfigured: 'Supabase هنوز تنظیم نشده',
    architecture: 'Core Architecture',
    designSystem: 'Design System',
    state: 'Global State',
    routing: 'Routing',
    ready: 'آماده',
    loading: 'در حال بارگذاری…',
    errorTitle: 'خطایی رخ داد',
    errorDescription: 'برنامه نتوانست این بخش را با موفقیت اجرا کند.',
    retry: 'تلاش دوباره',
    offline: 'اتصال اینترنت برقرار نیست. عملیات حساس پس از اتصال دوباره بررسی می‌شوند.',
    online: 'اتصال برقرار شد.',
    home: 'خانه',
    products: 'محصولات',
    cart: 'سبد خرید',
    wishlist: 'علاقه‌مندی‌ها',
    orders: 'سفارش‌ها',
    account: 'حساب کاربری',
    admin: 'مدیریت',
    login: 'ورود',
    foundationTitle: 'ستون فقرات Mobilex 2.0',
    foundationDescription: 'قابلیت‌های بعدی دقیقاً روی همین قراردادهای مرکزی ساخته خواهند شد.',
    dataReadyTitle: 'Supabase آماده‌ی اتصال کنترل‌شده است',
    dataReadyText:
      'کلاینت مرکزی، auth listener، repository wrapper، ENV validation و error normalization در لایه هسته قرار گرفته‌اند.',
    inspectStructure: 'مشاهده ساختار',
    register: 'ثبت‌نام',
  },
  en: {
    appName: 'Mobilex',
    appVersion: '2.0',
    heroEyebrow: 'Next-generation mobile store',
    heroTitle: 'Mobilex 2.0 starts here.',
    heroText:
      'A new foundation built for speed, scale, polished UX, and a codebase that stays maintainable as the store grows.',
    configured: 'Supabase connected',
    notConfigured: 'Supabase is not configured yet',
    architecture: 'Core Architecture',
    designSystem: 'Design System',
    state: 'Global State',
    routing: 'Routing',
    ready: 'Ready',
    loading: 'Loading…',
    errorTitle: 'Something went wrong',
    errorDescription: 'The application could not render this section successfully.',
    retry: 'Try again',
    offline: 'You are offline. Sensitive operations will be checked after reconnecting.',
    online: 'Connection restored.',
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    wishlist: 'Wishlist',
    orders: 'Orders',
    account: 'Account',
    admin: 'Admin',
    login: 'Login',
    foundationTitle: 'The Mobilex 2.0 foundation',
    foundationDescription: 'Every large feature that follows is built on these central contracts.',
    dataReadyTitle: 'Supabase is ready for controlled integration',
    dataReadyText:
      'Central client, auth listener, repository wrapper, environment validation, and error normalization now live in the core.',
    inspectStructure: 'Explore the foundation',
    register: 'Register',
  },
} as const;

export type TranslationKey = keyof typeof messages.fa;

export function detectLocale(): Locale {
  const stored = readStorage<string | null>(localeStorageKey, null);
  if (stored === 'fa' || stored === 'en') return stored;
  const browser = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'fa';
  return browser.startsWith('en') ? 'en' : 'fa';
}

export function setLocale(locale: Locale): void {
  writeStorage(localeStorageKey, locale);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  }
}

export function getMessage(locale: Locale, key: TranslationKey): string {
  return messages[locale][key] ?? messages.fa[key];
}

export function createTranslator(locale: Locale) {
  return (key: TranslationKey): string => getMessage(locale, key);
}
