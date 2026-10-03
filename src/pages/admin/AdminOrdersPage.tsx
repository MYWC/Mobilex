import { useEffect, useState } from 'react';
import { CheckCircle2, Eye, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminDataView, AdminFilters } from '@/components/admin/AdminDataView';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { listOrders, updateOrderStatus } from '@/services/admin/admin.service';
import { orderStatusLabel, statusTone } from '@/lib/admin/status';
import type { AdminOrderRow, AdminOrderStatus } from '@/types/admin';
import { formatToman } from '@/lib/format/number';

const statuses: AdminOrderStatus[]=['pending_payment','processing','paid','packed','shipped','delivered','cancelled','returned'];
export function AdminOrdersPage(){
 const [rows,setRows]=useState<AdminOrderRow[]>([]);const [error,setError]=useState('');const [search,setSearch]=useState('');const [status,setStatus]=useState('all');const [busy,setBusy]=useState<string|null>(null);
 const load=async()=>{setError('');try{setRows(await listOrders({search,status}))}catch(e){setError(e instanceof Error?e.message:'خطا')}}; useEffect(()=>{void load()},[status]);
 const change=async(id:string,s:AdminOrderStatus)=>{setBusy(id);try{await updateOrderStatus(id,s,'Updated from admin panel');await load()}catch(e){console.error(e)}finally{setBusy(null)}};
 return <AdminShell title="مدیریت سفارش‌ها"><AdminDataView title="مرکز عملیات سفارش‌ها" subtitle="پیگیری، پردازش و تغییر وضعیت" search={search} onSearch={setSearch} onRefresh={()=>void load()} actions={<Button variant="secondary" size="sm" icon={<RefreshCw size={13}/>} onClick={()=>void load()}>Sync</Button>}>{error&&<div className="mx-admin-error">{error}</div>}<AdminFilters><select className="mx-admin-filter-select" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">همه وضعیت‌ها</option>{statuses.map(s=><option value={s} key={s}>{orderStatusLabel(s,'fa')}</option>)}</select></AdminFilters><AdminTable headers={['شماره سفارش','مشتری','آیتم','مبلغ','پرداخت','وضعیت','تاریخ','عملیات']}>
 {rows.map(o=><tr key={o.id}><td><strong>{o.orderNumber}</strong></td><td>{o.customerName}</td><td>{o.itemCount}</td><td>{formatToman(o.totalAmount,'fa')}</td><td><StatusPill tone={o.paymentStatus==='paid'?'success':o.paymentStatus==='failed'?'danger':'warning'}>{o.paymentStatus==='paid'?'موفق':o.paymentStatus==='failed'?'ناموفق':'در انتظار'}</StatusPill></td><td><select className="mx-status-select" value={o.status} disabled={busy===o.id} onChange={e=>void change(o.id,e.target.value as AdminOrderStatus)}>{statuses.map(s=><option key={s} value={s}>{orderStatusLabel(s,'fa')}</option>)}</select></td><td>{new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(o.createdAt))}</td><td><Link className="mx-button mx-button-ghost mx-button-xs" to={`/orders/${o.id}`}><Eye size={13}/> جزئیات</Link></td></tr>)}
 </AdminTable></AdminDataView></AdminShell>
}
