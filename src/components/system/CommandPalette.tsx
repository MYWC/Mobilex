import {
  Command,
  Search,
  ShoppingCart,
  Heart,
  Package,
  User,
  LayoutDashboard,
  Settings,
  Moon,
  Sun,
  Monitor,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { routes } from '@/app/routes/routeConfig';

type Action = {
  id: string;
  label: string;
  hint: string;
  icon: ReactNode;
  run: () => void;
};

export function CommandPalette() {
  const navigate = useNavigate();
  const locale = useAppStore((s) => s.locale);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const role = useAuthStore((s) => s.appUser?.role);
  const authenticated = useAuthStore((s) => s.status === 'authenticated');

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const go = useCallback(
    (path: string) => {
      close();
      navigate(path);
    },
    [close, navigate],
  );

  const actions = useMemo<Action[]>(() => {
    const list: Action[] = [
      {
        id: 'products',
        label: locale === 'fa' ? 'محصولات' : 'Products',
        hint: 'P',
        icon: <ShoppingCart size={17} />,
        run: () => go(routes.products),
      },
      {
        id: 'wishlist',
        label: locale === 'fa' ? 'علاقه‌مندی‌ها' : 'Wishlist',
        hint: 'W',
        icon: <Heart size={17} />,
        run: () => go(routes.wishlist),
      },
      {
        id: 'cart',
        label: locale === 'fa' ? 'سبد خرید' : 'Cart',
        hint: 'C',
        icon: <ShoppingCart size={17} />,
        run: () => go(routes.cart),
      },
      {
        id: 'orders',
        label: locale === 'fa' ? 'سفارش‌ها' : 'Orders',
        hint: 'O',
        icon: <Package size={17} />,
        run: () => go(routes.orders),
      },
      {
        id: 'account',
        label: locale === 'fa' ? 'حساب کاربری' : 'Account',
        hint: 'A',
        icon: <User size={17} />,
        run: () => go(routes.profile),
      },
      {
        id: 'theme-light',
        label: locale === 'fa' ? 'تم روشن' : 'Light theme',
        hint: 'L',
        icon: <Sun size={17} />,
        run: () => {
          setTheme('light');
          close();
        },
      },
      {
        id: 'theme-dark',
        label: locale === 'fa' ? 'تم تاریک' : 'Dark theme',
        hint: 'D',
        icon: <Moon size={17} />,
        run: () => {
          setTheme('dark');
          close();
        },
      },
      {
        id: 'theme-system',
        label: locale === 'fa' ? 'تم سیستم' : 'System theme',
        hint: 'S',
        icon: <Monitor size={17} />,
        run: () => {
          setTheme('system');
          close();
        },
      },
    ];

    if (authenticated && ['admin', 'product_manager', 'warehouse', 'support'].includes(role ?? '')) {
      list.push({
        id: 'admin',
        label: locale === 'fa' ? 'پنل مدیریت' : 'Admin',
        hint: 'M',
        icon: <LayoutDashboard size={17} />,
        run: () => go(routes.admin),
      });
    }

    list.push({
      id: 'ui-lab',
      label: 'UI Laboratory',
      hint: 'U',
      icon: <Settings size={17} />,
      run: () => go(routes.uiLab),
    });

    return list;
  }, [authenticated, locale, role, setTheme, go]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return actions.filter((action) =>
      `${action.label} ${action.hint}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [actions, query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      setActiveIndex((index) => Math.max(index - 1, 0));
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      filtered[activeIndex]?.run();
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (isShortcut) {
        event.preventDefault();
        setOpen((value) => !value);
        setQuery('');
        setActiveIndex(0);
      }

      if (event.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [close]);

  useEffect(() => {
    if (!open) return;

    const input = document.getElementById('mx-command-search') as HTMLInputElement | null;

    input?.focus();
  }, [open]);

  if (!open) return null;

  const activeAction = filtered[activeIndex];

  return (
    <div
      className="mx-command-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          close();
        }
      }}
    >
      <section
        className="mx-command-palette mx-glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mx-command-title"
      >
        <div className="mx-command-head">
          <div className="mx-command-brand">
            <span className="mx-command-icon">
              <Command size={17} />
            </span>

            <div>
              <strong id="mx-command-title">Mobilex Command Center</strong>

              <small>⌘K / Ctrl K</small>
            </div>
          </div>

          <Button
            size="xs"
            variant="ghost"
            aria-label="بستن"
            title="بستن"
            onClick={close}
            icon={<X size={16} />}
          >
            بستن
          </Button>
        </div>

        <label className="mx-command-search">
          <Search size={17} />

          <input
            id="mx-command-search"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={locale === 'fa' ? 'جستجوی فرمان...' : 'Search command...'}
            autoComplete="off"
            aria-controls="mx-command-list"
            aria-activedescendant={activeAction ? `mx-command-option-${activeAction.id}` : undefined}
          />
        </label>

        <div className="mx-command-list" id="mx-command-list" role="listbox" aria-label="فرمان‌های Mobilex">
          {filtered.length ? (
            filtered.map((action, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={action.id}
                  id={`mx-command-option-${action.id}`}
                  type="button"
                  role="option"
                  className={`mx-command-item ${isActive ? 'is-active' : ''} ${
                    theme === 'dark' && action.id.startsWith('theme-') ? 'is-theme-active' : ''
                  }`}
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={action.run}
                >
                  <span className="mx-command-item-icon">{action.icon}</span>

                  <span className="mx-command-item-copy">
                    <strong>{action.label}</strong>
                    <small>{action.id}</small>
                  </span>

                  <kbd>{action.hint}</kbd>
                </button>
              );
            })
          ) : (
            <div className="mx-command-empty">
              {locale === 'fa' ? 'موردی پیدا نشد.' : 'No commands found.'}
            </div>
          )}
        </div>

        <div className="mx-command-foot">
          <span>Enter اجرا</span>
          <span>Esc بستن</span>
          <span>↑↓ حرکت</span>
        </div>
      </section>
    </div>
  );
}
