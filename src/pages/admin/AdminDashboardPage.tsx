import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Boxes,
  ClipboardList,
  ExternalLink,
  PackageSearch,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminMetricCard } from '@/components/admin/AdminMetricCard';
import { AdminRevenueChart, AdminBars } from '@/components/admin/AdminChart';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { getDashboardData } from '@/services/admin/admin.service';
import { orderStatusLabel, statusTone } from '@/lib/admin/status';
import type { AdminDashboardData } from '@/types/admin';
import { formatToman } from '@/lib/format/number';

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await getDashboardData());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در دریافت داشبورد');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  return (
    <AdminShell title="داشبورد مدیریتی">
      <div className="mx-admin-page-grid">
        {error && !data ? (
          <div className="mx-card p-8">
            <strong>خطا در بارگذاری داشبورد</strong>
            <div className="mt-2 text-sm opacity-70">{error}</div>
            <div className="mt-4">
              <Button onClick={() => void load()}>تلاش مجدد</Button>
            </div>
          </div>
        ) : loading && !data ? (
          <div className="mx-card p-8">در حال آماده‌سازی مرکز کنترل...</div>
        ) : (
          data && (
            <>
              <div className="mx-admin-grid">
                {data.metrics.map((m) => (
                  <AdminMetricCard key={m.key} metric={m} />
                ))}
              </div>
              <div className="mx-admin-layout">
                <div className="mx-admin-stack">
                  <section className="mx-admin-panel">
                    <div className="mx-admin-panel-head">
                      <div>
                        <h2>روند فروش</h2>
                        <p>۱۴ روز اخیر · تومان</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void load()}
                        icon={<TrendingUp size={13} />}
                      >
                        به‌روزرسانی
                      </Button>
                    </div>
                    <AdminRevenueChart data={data.revenue} />
                  </section>
                  <section className="mx-admin-panel">
                    <div className="mx-admin-panel-head">
                      <div>
                        <h2>سفارش‌های اخیر</h2>
                        <p>آخرین فعالیت‌های ثبت‌شده</p>
                      </div>
                      <Link className="mx-button mx-button-ghost" to="/admin/orders">
                        مشاهده همه <ArrowLeft size={13} />
                      </Link>
                    </div>
                    <div className="mx-mini-list">
                      {data.recentOrders.map((o) => (
                        <div className="mx-mini-row" key={o.id}>
                          <div>
                            <strong>{o.orderNumber}</strong>
                            <small>
                              {o.customerName} ·{' '}
                              {new Intl.DateTimeFormat('fa-IR', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              }).format(new Date(o.createdAt))}
                            </small>
                          </div>
                          <div>
                            <div className="mx-mini-value">{formatToman(o.totalAmount, 'fa')}</div>
                            <StatusPill tone={statusTone(o.status) as any}>
                              {orderStatusLabel(o.status, 'fa')}
                            </StatusPill>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
                <div className="mx-admin-stack">
                  <section className="mx-admin-panel">
                    <div className="mx-admin-panel-head">
                      <div>
                        <h2>محصولات پرفروش</h2>
                        <p>بر اساس مبلغ فروش</p>
                      </div>
                    </div>
                    <AdminBars items={data.topProducts.map((x) => ({ label: x.name, value: x.revenue }))} />
                  </section>
                  <section className="mx-admin-panel">
                    <div className="mx-admin-panel-head">
                      <div>
                        <h2>هشدار موجودی</h2>
                        <p>محصولات نزدیک به اتمام</p>
                      </div>
                      <Link className="mx-button mx-button-ghost" to="/admin/inventory">
                        انبار <Boxes size={13} />
                      </Link>
                    </div>
                    <div className="mx-mini-list">
                      {data.lowStock.map((x) => (
                        <div className="mx-mini-row" key={x.id}>
                          <div>
                            <strong>{x.name}</strong>
                            <small>حد هشدار: {x.threshold}</small>
                          </div>
                          <StatusPill tone={x.stock <= 3 ? 'danger' : 'warning'}>{x.stock} عدد</StatusPill>
                        </div>
                      ))}
                      {!data.lowStock.length && <div className="mx-empty-inline">موجودی بحرانی ندارید.</div>}
                    </div>
                  </section>
                  <section className="mx-admin-panel">
                    <div className="mx-admin-panel-head">
                      <div>
                        <h2>قیف وضعیت سفارش‌ها</h2>
                        <p>توزیع فعلی</p>
                      </div>
                    </div>
                    <AdminBars
                      items={data.ordersByStatus.map((x) => ({
                        label: orderStatusLabel(x.status, 'fa'),
                        value: x.count,
                      }))}
                    />
                  </section>
                </div>
              </div>
              <div className="mx-admin-quick-links">
                <Card interactive>
                  <div className="mx-quick-icon">
                    <PackageSearch />
                  </div>
                  <div>
                    <strong>کاتالوگ</strong>
                    <span>مدیریت محصولات و وضعیت انتشار</span>
                  </div>
                  <Link to="/admin/products">
                    <ExternalLink size={15} />
                  </Link>
                </Card>
                <Card interactive>
                  <div className="mx-quick-icon">
                    <ClipboardList />
                  </div>
                  <div>
                    <strong>عملیات سفارش</strong>
                    <span>پردازش و تغییر وضعیت سفارش‌ها</span>
                  </div>
                  <Link to="/admin/orders">
                    <ExternalLink size={15} />
                  </Link>
                </Card>
                <Card interactive>
                  <div className="mx-quick-icon">
                    <Users />
                  </div>
                  <div>
                    <strong>مشتریان</strong>
                    <span>نقش‌ها و حساب‌های کاربری</span>
                  </div>
                  <Link to="/admin/users">
                    <ExternalLink size={15} />
                  </Link>
                </Card>
              </div>
            </>
          )
        )}
      </div>
    </AdminShell>
  );
}
