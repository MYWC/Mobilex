import { useEffect, useState } from 'react';
import {
  GitCompareArrows,
  Heart,
  Languages,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  UserRound,
  X,
  ChevronDown,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/features/cart/cart.store';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';
import { useCompareStore } from '@/features/compare/compare.store';
import { getMessage, type TranslationKey } from '@/lib/i18n/i18n';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/ui/cn';
import { Modal } from '@/components/ui/Modal';
import { SearchPanel } from '@/components/search/SearchPanel';
import { useSearchStore } from '@/features/search/search.store';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function SiteHeader() {
  const locale = useAppStore((s) => s.locale),
    theme = useAppStore((s) => s.theme),
    setLocale = useAppStore((s) => s.setLocale),
    setTheme = useAppStore((s) => s.setTheme),
    mobileNavOpen = useAppStore((s) => s.mobileNavOpen),
    setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen);
  const user = useAuthStore((s) => s.appUser),
    compareCount = useCompareStore((s) => s.ids.length),
    cartCount = useCartStore((s) => s.count()),
    wishlistCount = useWishlistStore((s) => s.ids.length);
  const [searchOpen, setSearchOpen] = useState(false),
    [query, setQuery] = useState('');
  const location = useLocation(),
    navigate = useNavigate();
  const hydrateSearch = useSearchStore((s) => s.hydrate);
  const t = (key: TranslationKey) => getMessage(locale, key);
  const fa = locale === 'fa';
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);
  useEffect(() => {
    hydrateSearch();
  }, [hydrateSearch]);
  const submit = (value: string) => {
    const q = value.trim();
    if (q.length >= 2) {
      useSearchStore.getState().add(q);
      navigate(`/products?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
    }
  };
  const nav = [
    { to: '/', key: 'home' as TranslationKey },
    { to: '/products', key: 'products' as TranslationKey },
    ...(user ? [{ to: '/orders', key: 'orders' as TranslationKey }] : []),
  ];
  return (
    <>
      <div className="mx-announce">
        <div className="mx-shell mx-announce-inner">
          <span>✦ Mobilex 2.0 · {fa ? 'فروشگاه نسل جدید موبایل' : 'The next generation mobile store'}</span>
          <span className="mx-announce-extra">
            {fa
              ? 'امنیت، سرعت و تجربه کاربری در یک هسته واحد'
              : 'Security, speed and one consistent experience'}
          </span>
        </div>
      </div>
      <header className="mx-header">
        <div className="mx-shell mx-header-inner">
          <Link to="/" className="mx-brand">
            <span className="mx-brand-mark">
              <span>M</span>
            </span>
            <span className="mx-brand-copy">
              <strong>
                Mobilex <em>2.0</em>
              </strong>
              <small>mobile commerce platform</small>
            </span>
          </Link>
          <div className="mx-header-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && submit(query)}
              placeholder={fa ? 'جستجوی محصول، برند یا دسته‌بندی…' : 'Search products, brands or categories…'}
              aria-label="Search"
            />
            {query && (
              <button type="button" className="mx-search-clear" onClick={() => setQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <nav className="mx-main-nav" aria-label="Primary navigation">
            {nav.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) => cn('mx-nav-link', isActive && 'is-active')}
              >
                {t(i.key)}
              </NavLink>
            ))}
          </nav>
          <div className="mx-header-actions">
            <button className="mx-category-button" type="button" onClick={() => navigate('/products')}>
              <span>{fa ? 'دسته‌بندی‌ها' : 'Categories'}</span>
              <ChevronDown size={14} />
            </button>
            <IconButton label={fa ? 'English' : 'فارسی'} onClick={() => setLocale(fa ? 'en' : 'fa')}>
              <Languages size={17} />
            </IconButton>
            <IconButton
              label="Search"
              className="mx-mobile-search-trigger"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={17} />
            </IconButton>
            <NotificationBell />
            <Link className="mx-icon-anchor" to="/compare" aria-label={fa ? 'مقایسه' : 'Compare'}>
              <GitCompareArrows size={17} />
              {compareCount > 0 && <Badge tone="info">{compareCount}</Badge>}
            </Link>
            <Link className="mx-icon-anchor" to="/wishlist" aria-label={t('wishlist')}>
              <Heart size={17} />
              {wishlistCount > 0 && <Badge tone="danger">{wishlistCount > 99 ? '99+' : wishlistCount}</Badge>}
            </Link>
            <Link className="mx-icon-anchor" to="/cart" aria-label={t('cart')}>
              <ShoppingCart size={17} />
              {cartCount > 0 && <Badge tone="primary">{cartCount > 99 ? '99+' : cartCount}</Badge>}
            </Link>
            <Link
              className="mx-icon-anchor"
              to={user ? '/account' : '/login'}
              aria-label={user ? t('account') : t('login')}
            >
              <UserRound size={17} />
            </Link>
            <div className="mx-theme-switcher" role="group" aria-label="Theme">
              <button
                type="button"
                className={theme === 'light' ? 'is-active' : ''}
                onClick={() => setTheme('light')}
              >
                <Sun size={14} />
              </button>
              <button
                type="button"
                className={theme === 'system' ? 'is-active' : ''}
                onClick={() => setTheme('system')}
              >
                <span className="mx-theme-dot" />
              </button>
              <button
                type="button"
                className={theme === 'dark' ? 'is-active' : ''}
                onClick={() => setTheme('dark')}
              >
                <Moon size={14} />
              </button>
            </div>
            <IconButton
              label="Menu"
              className="mx-menu-trigger"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
            </IconButton>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="mx-mobile-menu">
            <div className="mx-shell mx-mobile-menu-grid">
              <button type="button" className="mx-mobile-search-launch" onClick={() => setSearchOpen(true)}>
                <Search size={16} />
                <span>{fa ? 'جستجو…' : 'Search…'}</span>
              </button>
              <div className="mx-mobile-nav">
                {nav.map((i) => (
                  <NavLink
                    key={i.to}
                    to={i.to}
                    className={({ isActive }) => cn('mx-mobile-nav-link', isActive && 'is-active')}
                  >
                    {t(i.key)}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title={fa ? 'جستجوی هوشمند' : 'Smart search'}
        description={
          fa ? 'محصول، برند یا دسته‌بندی موردنظر را پیدا کنید.' : 'Find a product, brand or category.'
        }
        size="lg"
      >
        <SearchPanel />
      </Modal>
    </>
  );
}
