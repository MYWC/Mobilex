import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminDataView, AdminFilters } from '@/components/admin/AdminDataView';
import { AdminTable } from '@/components/admin/AdminTable';
import { StatusPill } from '@/components/ui/StatusPill';
import { listAuditLogs } from '@/services/admin/admin.service';
import type { AuditLogRow } from '@/types/admin';
const icons = { success: CheckCircle2, warning: AlertTriangle, danger: ShieldAlert, info: Info };
export function AdminAuditPage() {
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');
  const load = async () => {
    setError('');
    try {
      setRows(await listAuditLogs({ search, severity }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا');
    }
  };
  useEffect(() => {
    void load();
  }, [severity]);
  return (
    <AdminShell title="لاگ فعالیت‌ها">
      <AdminDataView
        title="Audit Log"
        subtitle="ردپای اقدامات مدیریتی و تغییرات حساس"
        search={search}
        onSearch={setSearch}
        onRefresh={() => void load()}
      >
        {error && <div className="mx-admin-error">{error}</div>}
        <AdminFilters>
          <select
            className="mx-admin-filter-select"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="all">همه شدت‌ها</option>
            <option value="success">موفق</option>
            <option value="info">اطلاعاتی</option>
            <option value="warning">هشدار</option>
            <option value="danger">بحرانی</option>
          </select>
        </AdminFilters>
        <AdminTable headers={['اقدام', 'موجودیت', 'اجراکننده', 'شدت', 'شرح', 'زمان']}>
          {rows.map((x) => {
            const Icon = icons[x.severity];
            return (
              <tr key={x.id}>
                <td>
                  <strong>{x.action}</strong>
                </td>
                <td>
                  {x.entityType}
                  {x.entityId && ` · ${x.entityId}`}
                </td>
                <td>{x.actorName || x.actorId || 'system'}</td>
                <td>
                  <StatusPill
                    tone={
                      x.severity === 'danger'
                        ? 'danger'
                        : x.severity === 'warning'
                          ? 'warning'
                          : x.severity === 'success'
                            ? 'success'
                            : 'info'
                    }
                  >
                    <Icon size={11} />
                    {x.severity}
                  </StatusPill>
                </td>
                <td>{x.summary}</td>
                <td>
                  {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'medium' }).format(
                    new Date(x.createdAt),
                  )}
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </AdminDataView>
    </AdminShell>
  );
}
