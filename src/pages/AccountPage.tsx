import {
  Bell,
  ChevronLeft,
  Heart,
  KeyRound,
  MapPin,
  PackageCheck,
  ShieldCheck,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  getAccountStats,
  getMyProfile,
  getPreferences,
  savePreferences,
  updateProfile,
} from '@/features/account/account.service';
import type { AccountPreferences, AccountStats, UserProfileSnapshot } from '@/features/account/account.types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { formatCurrency, formatNumber } from '@/lib/format/number';

export function AccountPage() {
  const fa = useAppStore((s) => s.locale) === 'fa';
  const appUser = useAuthStore((s) => s.appUser);
  const [profile, setProfile] = useState<UserProfileSnapshot | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [prefs, setPrefs] = useState<AccountPreferences | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    void Promise.all([getMyProfile(), getAccountStats(), getPreferences()]).then(([p, s, pr]) => {
      setProfile(p);
      setStats(s);
      setPrefs(pr);
      setName(p?.fullName ?? '');
      setPhone(p?.phone ?? '');
    });
  }, []);
  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ fullName: name, phone });
      setProfile((p) => (p ? { ...p, fullName: name, phone } : p));
    } finally {
      setSaving(false);
    }
  };
  const togglePref = async (k: keyof AccountPreferences, v: boolean) => {
    if (!prefs) return;
    const n = { ...prefs, [k]: v };
    setPrefs(n);
    await savePreferences(n);
  };
  return (
    <div className="mx-page">
      <div className="mx-shell mx-account-page">
        <div className="mx-breadcrumb">
          <Link to="/">{fa ? 'خانه' : 'Home'}</Link>
          <span>›</span>
          <strong>{fa ? 'حساب کاربری' : 'Account'}</strong>
        </div>
        <div className="mx-account-hero">
          <div className="mx-account-profile">
            <Avatar
              src={profile?.avatarUrl}
              name={profile?.fullName || appUser?.email || 'Mobilex'}
              size="lg"
            />
            <div>
              <span className="mx-section-kicker">ACCOUNT CENTER</span>
              <h1>{profile?.fullName || appUser?.email || 'Mobilex user'}</h1>
              <p>{profile?.email || appUser?.email}</p>
            </div>
          </div>
          <div className="mx-account-actions">
            <Link to="/orders">
              <Button icon={<PackageCheck size={15} />}>{fa ? 'سفارش‌ها' : 'Orders'}</Button>
            </Link>
            <Link to="/notifications">
              <Button variant="outline" icon={<Bell size={15} />}>
                {fa ? 'اعلان‌ها' : 'Notifications'}
              </Button>
            </Link>
          </div>
        </div>
        {stats && (
          <div className="mx-account-stat-grid">
            {[
              [PackageCheck, stats.totalOrders, fa ? 'همه سفارش‌ها' : 'Total orders'],
              [WalletCards, stats.activeOrders, fa ? 'فعال' : 'Active'],
              [Heart, stats.wishlistCount, fa ? 'علاقه‌مندی' : 'Wishlist'],
              [Bell, stats.unreadNotifications, fa ? 'خوانده‌نشده' : 'Unread'],
            ].map(([I, val, label]) => {
              const Icon = I as any;
              return (
                <Card key={String(label)} className="mx-account-stat">
                  <Icon size={19} />
                  <div>
                    <strong>{formatNumber(Number(val), fa ? 'fa' : 'en')}</strong>
                    <span>{String(label)}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        <div className="mx-account-main-grid">
          <section className="mx-account-stack">
            <Card>
              <div className="mx-card-title">
                <UserRound size={16} />
                <h2>{fa ? 'اطلاعات شخصی' : 'Personal information'}</h2>
              </div>
              <div className="mx-form-grid">
                <Input
                  label={fa ? 'نام و نام خانوادگی' : 'Full name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label={fa ? 'شماره موبایل' : 'Phone'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                />
                <Input label="Email" value={profile?.email || ''} disabled dir="ltr" />
              </div>
              <div className="mx-form-actions">
                <Button onClick={() => void save()} loading={saving}>
                  {fa ? 'ذخیره تغییرات' : 'Save changes'}
                </Button>
              </div>
            </Card>
            <Card>
              <div className="mx-card-title">
                <MapPin size={16} />
                <h2>{fa ? 'آدرس‌ها' : 'Addresses'}</h2>
              </div>
              <p className="mx-muted">
                {fa
                  ? 'آدرس‌های ذخیره‌شده برای Checkout از این بخش مدیریت می‌شوند.'
                  : 'Saved addresses are used throughout checkout.'}
              </p>
              <Link to="/account/addresses">
                <Button variant="outline" icon={<ChevronLeft size={14} />}>
                  {fa ? 'مدیریت آدرس‌ها' : 'Manage addresses'}
                </Button>
              </Link>
            </Card>
            <Card>
              <div className="mx-card-title">
                <ShieldCheck size={16} />
                <h2>{fa ? 'امنیت حساب' : 'Account security'}</h2>
              </div>
              <div className="mx-security-links">
                <Link to="/account/security">
                  <KeyRound size={15} />
                  <span>{fa ? 'رمز عبور و نشست‌ها' : 'Password & sessions'}</span>
                  <ChevronLeft size={14} />
                </Link>
              </div>
            </Card>
          </section>
          <aside className="mx-account-stack">
            <Card>
              <span className="mx-section-kicker">QUICK ACCESS</span>
              <h2>{fa ? 'دسترسی سریع' : 'Quick access'}</h2>
              {[
                [Heart, '/wishlist', fa ? 'علاقه‌مندی‌ها' : 'Wishlist'],
                [PackageCheck, '/orders', fa ? 'سفارش‌ها' : 'Orders'],
                [Bell, '/notifications', fa ? 'اعلان‌ها' : 'Notifications'],
                [MapPin, '/account/addresses', fa ? 'آدرس‌ها' : 'Addresses'],
              ].map(([I, to, label]) => {
                const Icon = I as any;
                return (
                  <Link to={String(to)} className="mx-account-quick-link" key={String(to)}>
                    <Icon size={16} />
                    <span>{String(label)}</span>
                    <ChevronLeft size={14} />
                  </Link>
                );
              })}
            </Card>
            {stats && (
              <Card className="mx-spend-card">
                <span className="mx-section-kicker">LIFETIME</span>
                <h2>{fa ? 'ارزش خرید شما' : 'Lifetime spend'}</h2>
                <strong>{formatCurrency(stats.lifetimeSpend, fa ? 'fa' : 'en')}</strong>
                <p>{fa ? 'مجموع پرداخت‌های ثبت‌شده در حساب' : 'Total recorded account spend'}</p>
              </Card>
            )}
            <Card>
              <span className="mx-section-kicker">PREFERENCES</span>
              <h2>{fa ? 'اعلان‌ها' : 'Preferences'}</h2>
              {prefs &&
                [
                  ['priceDropAlerts', fa ? 'هشدار کاهش قیمت' : 'Price drop alerts'],
                  ['restockAlerts', fa ? 'هشدار موجودی' : 'Restock alerts'],
                  ['marketingEmail', fa ? 'پیشنهادهای فروش' : 'Marketing'],
                ].map(([k, label]) => (
                  <label className="mx-inline-toggle" key={String(k)}>
                    <span>{String(label)}</span>
                    <input
                      type="checkbox"
                      checked={prefs[k as keyof AccountPreferences]}
                      onChange={(e) => void togglePref(k as keyof AccountPreferences, e.target.checked)}
                    />
                  </label>
                ))}
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
