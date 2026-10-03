import { useEffect, useState } from 'react';
import { Check, Edit3, MoreHorizontal, PackageOpen, X } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminDataView, AdminFilters } from '@/components/admin/AdminDataView';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { Input } from '@/components/ui/Input';
import { listProducts, updateProduct } from '@/services/admin/admin.service';
import type { AdminProductRow } from '@/types/admin';
import { formatToman } from '@/lib/format/number';
import { useAppStore } from '@/stores/useAppStore';

export function AdminProductsPage() {
  const locale = useAppStore((s) => s.locale);
  const [rows, setRows] = useState<AdminProductRow[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [low, setLow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const load = async () => {
    setError('');
    try {
      setRows(await listProducts({ search, active, lowStock: low }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا');
    }
  };
  useEffect(() => {
    void load();
  }, [active, low]);
  const toggle = async (r: AdminProductRow) => {
    setBusy(r.id);
    try {
      await updateProduct(r.id, { isActive: !r.isActive });
      await load();
    } finally {
      setBusy(null);
    }
  };
  return (
    <AdminShell title="مدیریت محصولات">
      <AdminDataView
        title="کاتالوگ محصولات"
        subtitle={`${rows.length.toLocaleString('fa-IR')} محصول`}
        search={search}
        onSearch={setSearch}
        onRefresh={() => void load()}
        actions={
          <Button icon={<PackageOpen size={14} />} size="sm">
            افزودن محصول
          </Button>
        }
      >
        {error && <div className="mx-admin-error">{error}</div>}
        <AdminFilters>
          <select
            className="mx-admin-filter-select"
            value={active}
            onChange={(e) => setActive(e.target.value as any)}
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
          <label className="mx-admin-check">
            <input type="checkbox" checked={low} onChange={(e) => setLow(e.target.checked)} /> فقط موجودی کم
          </label>
        </AdminFilters>
        <AdminTable
          headers={['محصول', 'SKU', 'برند / دسته', 'قیمت', 'موجودی', 'وضعیت', 'بروزرسانی', 'عملیات']}
        >
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.name}</strong>
              </td>
              <td>{r.sku || '—'}</td>
              <td>
                {r.brand || '—'}
                {r.category && ` · ${r.category}`}
              </td>
              <td>
                {formatToman(r.salePrice && r.salePrice < r.price ? r.salePrice : r.price, locale)}
                {r.salePrice && r.salePrice < r.price && (
                  <small className="mx-old-price">{formatToman(r.price, locale)}</small>
                )}
              </td>
              <td>
                <span className={r.stock <= 3 ? 'mx-stock-critical' : r.stock <= 10 ? 'mx-stock-warn' : ''}>
                  {r.stock.toLocaleString('fa-IR')}
                </span>
              </td>
              <td>
                <StatusPill tone={r.isActive ? 'success' : 'neutral'}>
                  {r.isActive ? 'فعال' : 'غیرفعال'}
                </StatusPill>
              </td>
              <td>
                {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(r.updatedAt))}
              </td>
              <td>
                <div className="mx-row-actions">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => void toggle(r)}
                    loading={busy === r.id}
                    icon={r.isActive ? <X size={13} /> : <Check size={13} />}
                  >
                    {r.isActive ? 'خاموش' : 'فعال'}
                  </Button>
                  <Button size="xs" variant="secondary" icon={<Edit3 size={13} />}>
                    ویرایش
                  </Button>
                  <Button size="xs" variant="ghost" icon={<MoreHorizontal size={13} />} aria-label="بیشتر" />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminDataView>
    </AdminShell>
  );
}
