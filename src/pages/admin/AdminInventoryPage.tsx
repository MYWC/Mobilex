import { useEffect, useState } from 'react';
import { ArrowUpToLine, Box, Minus, Plus, RotateCcw } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminDataView, AdminFilters } from '@/components/admin/AdminDataView';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { listInventory, adjustInventory } from '@/services/admin/admin.service';
import type { InventoryRow } from '@/types/admin';
export function AdminInventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [lowOnly, setLow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const load = async () => {
    setError('');
    try {
      setRows(await listInventory({ search, lowOnly }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا');
    }
  };
  useEffect(() => {
    void load();
  }, [lowOnly]);
  const adjust = async (r: InventoryRow, delta: number) => {
    const reason = window.prompt('علت اصلاح موجودی را وارد کنید:', 'تصحیح دستی انبار');
    if (!reason) return;
    setBusy(r.id);
    try {
      await adjustInventory({ productId: r.productId, variantId: r.variantId, delta, reason });
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  };
  return (
    <AdminShell title="انبار و موجودی">
      <AdminDataView
        title="کنترل موجودی"
        subtitle={`${rows.length} قلم در این نما`}
        search={search}
        onSearch={setSearch}
        onRefresh={() => void load()}
        actions={
          <Button size="sm" variant="secondary" icon={<RotateCcw size={13} />}>
            سند ورود/خروج
          </Button>
        }
      >
        {error && <div className="mx-admin-error">{error}</div>}
        <AdminFilters>
          <label className="mx-admin-check">
            <input type="checkbox" checked={lowOnly} onChange={(e) => setLow(e.target.checked)} /> فقط موجودی
            کم
          </label>
        </AdminFilters>
        <AdminTable
          headers={['محصول', 'Variant / SKU', 'موجودی', 'حد هشدار', 'وضعیت', 'آخرین بروزرسانی', 'عملیات']}
        >
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.productName}</strong>
              </td>
              <td>
                {r.variantLabel || 'اصلی'} · {r.sku || '—'}
              </td>
              <td>
                <strong className={r.stock <= r.threshold ? 'mx-stock-critical' : ''}>
                  {r.stock.toLocaleString('fa-IR')}
                </strong>
              </td>
              <td>{r.threshold.toLocaleString('fa-IR')}</td>
              <td>
                <StatusPill tone={r.stock === 0 ? 'danger' : r.stock <= r.threshold ? 'warning' : 'success'}>
                  {r.stock === 0 ? 'تمام شده' : r.stock <= r.threshold ? 'کم' : 'ایمن'}
                </StatusPill>
              </td>
              <td>
                {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(r.updatedAt))}
              </td>
              <td>
                <div className="mx-row-actions">
                  <Button
                    size="xs"
                    variant="danger"
                    loading={busy === r.id}
                    icon={<Minus size={12} />}
                    onClick={() => void adjust(r, -1)}
                  >
                    −۱
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    loading={busy === r.id}
                    icon={<Plus size={12} />}
                    onClick={() => void adjust(r, 1)}
                  >
                    +۱
                  </Button>
                  <Button
                    size="xs"
                    variant="soft"
                    icon={<ArrowUpToLine size={12} />}
                    onClick={() => void adjust(r, 10)}
                  >
                    +۱۰
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminDataView>
    </AdminShell>
  );
}
