import { Bell, Menu, Search, Sun, Moon, Monitor, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useNotificationStore } from '@/features/notifications/notification.store';
import { routes } from '@/app/routes/routeConfig';

export function AdminTopbar({onMenu}:{onMenu:()=>void}){
  const [query,setQuery]=useState('');
  const theme=useAppStore(s=>s.theme); const setTheme=useAppStore(s=>s.setTheme); const unread=useNotificationStore(s=>s.items.filter(item=>!item.read).length);
  return <header className="mx-admin-topbar">
    <button className="mx-admin-menu" aria-label="باز کردن منوی مدیریت" onClick={onMenu}><Menu size={20}/></button>
    <div className="mx-admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو در پنل مدیریت..."/></div>
    <div className="mx-admin-top-actions">
      <Link to={routes.notifications} className="mx-icon-anchor" aria-label="اعلان‌ها"><Bell size={17}/>{unread>0&&<span className="mx-badge mx-badge-danger">{unread>99?'99+':unread}</span>}</Link>
      <div className="mx-theme-switcher"><button className={theme==='light'?'is-active':''} onClick={()=>setTheme('light')} aria-label="روشن"><Sun size={13}/></button><button className={theme==='dark'?'is-active':''} onClick={()=>setTheme('dark')} aria-label="تیره"><Moon size={13}/></button><button className={theme==='system'?'is-active':''} onClick={()=>setTheme('system')} aria-label="سیستم"><Monitor size={13}/></button></div>
      <Link to="/" target="_blank" rel="noreferrer" className="mx-button mx-button-secondary mx-admin-view"><ExternalLink size={13}/> فروشگاه</Link>
    </div>
  </header>
}
