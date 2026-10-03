import { NavLink } from 'react-router-dom';
import { BarChart3, Box, ClipboardList, FileText, LayoutDashboard, Package, Settings, ShieldCheck, Users, Layers3, ScrollText, Megaphone, Rocket } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { hasPermission, type Permission } from '@/lib/auth/permissions';
import { routes } from '@/app/routes/routeConfig';

interface Item { to:string; label:string; icon: typeof LayoutDashboard; permission?: Permission; }
const items: Item[] = [
  {to:routes.adminDashboard,label:'داشبورد',icon:LayoutDashboard},
  {to:routes.adminProducts,label:'محصولات',icon:Package,permission:'catalog.read'},
  {to:routes.adminInventory,label:'انبار و موجودی',icon:Box,permission:'inventory.read'},
  {to:routes.adminOrders,label:'سفارش‌ها',icon:ClipboardList,permission:'orders.read'},
  {to:routes.adminUsers,label:'مشتریان',icon:Users,permission:'users.read'},
  {to:routes.adminContent,label:'محتوا و بنرها',icon:Megaphone,permission:'content.read'},
  {to:routes.adminAnalytics,label:'تحلیل و گزارش',icon:BarChart3,permission:'analytics.read'},
  {to:routes.adminAudit,label:'لاگ فعالیت‌ها',icon:ScrollText,permission:'audit.read'},
  {to:routes.adminRoles,label:'نقش‌ها و دسترسی',icon:ShieldCheck,permission:'roles.read'},
  {to:routes.adminSettings,label:'تنظیمات',icon:Settings,permission:'settings.read'},
  {to:routes.adminRelease,label:'انتشار نهایی',icon:Rocket,permission:'settings.read'},
];

export function AdminSidebar({open,onClose}:{open:boolean;onClose:()=>void}){
  const appUser=useAuthStore(s=>s.appUser); const role=appUser?.role;
  return <>
    {open && <button aria-label="بستن منوی مدیریت" className="mx-admin-overlay" onClick={onClose}/>} 
    <aside className={`mx-admin-sidebar ${open?'is-open':''}`}>
      <div className="mx-admin-brand">
        <div className="mx-brand-mark"><span>MX</span></div>
        <div><strong>Mobilex</strong><small>ADMIN CONTROL</small></div>
      </div>
      <div className="mx-admin-profile-mini">
        <div className="mx-admin-avatar">{(appUser?.fullName||role||'A').slice(0,1).toUpperCase()}</div>
        <div><strong>{appUser?.fullName || 'مدیر Mobilex'}</strong><span>{role||'admin'}</span></div>
      </div>
      <nav className="mx-admin-nav" aria-label="ناوبری مدیریت">
        {items.filter(i=>!i.permission || hasPermission(role,i.permission)).map(i=><NavLink key={i.to} to={i.to} onClick={onClose} className={({isActive})=>`mx-admin-nav-item ${isActive?'is-active':''}`}><i.icon size={16}/><span>{i.label}</span></NavLink>)}
      </nav>
      <div className="mx-admin-sidebar-footer"><NavLink to="/"><Layers3 size={15}/> مشاهده فروشگاه</NavLink><NavLink to="/ui-lab"><FileText size={15}/> UI Lab</NavLink></div>
    </aside>
  </>;
}
