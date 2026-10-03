export const APP = {
  name: 'Mobilex',
  productName: 'Mobilex 2.0',
  version: '2.0.0',
  storagePrefix: 'mobilex',
  defaultLocale: 'fa' as const,
  defaultTheme: 'system' as const,
  currency: 'TOMAN' as const,
} as const;

export const STORAGE_KEYS = {
  locale: `${APP.storagePrefix}.locale`,
  theme: `${APP.storagePrefix}.theme`,
  cart: `${APP.storagePrefix}.cart`,
  wishlist: `${APP.storagePrefix}.wishlist`,
  recentSearches: `${APP.storagePrefix}.recent-searches`,
  recentlyViewed: `${APP.storagePrefix}.recently-viewed`,
  authHint: `${APP.storagePrefix}.auth-hint`,
  cookieConsent: `${APP.storagePrefix}.cookie-consent`,
  notifications: `${APP.storagePrefix}.notifications`,
  compare: `${APP.storagePrefix}.compare`,
} as const;

/** Compatibility keys from the Mobilex 1.x HTML/JS application. */
export const LEGACY_STORAGE_KEYS = {
  cart: 'mobile-shop-cart',
  wishlist: 'mobile-shop-wishlist',
} as const;

export const EVENTS = {
  localeChanged: 'mobilex:locale-change',
  themeChanged: 'mobilex:theme-change',
  cartChanged: 'mobilex:cart-change',
  wishlistChanged: 'mobilex:wishlist-change',
  authChanged: 'mobilex:auth-change',
  notification: 'mobilex:notification',
  networkChanged: 'mobilex:network-change',
  compareChanged: 'mobilex:compare-change',
  growthEvent: 'mobilex:growth-event',
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const TIME = {
  toast: 3600,
  authRefreshGraceMs: 10_000,
  requestTimeoutMs: 15_000,
  storageDebounceMs: 80,
} as const;
