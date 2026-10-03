import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import '@/styles/admin.css';

export function AdminShell({children,title}:{children:PropsWithChildren['children'];title?:string}){
  const [open,setOpen]=useState(false);
  return <div className="mx-admin-shell"><AdminSidebar open={open} onClose={()=>setOpen(false)}/><div className="mx-admin-main"><AdminTopbar onMenu={()=>setOpen(true)}/><main className="mx-admin-content"><div className="mx-shell">{title&&<div className="mx-admin-page-head"><div><div className="mx-kicker">MOBILEX CONTROL CENTER</div><h1>{title}</h1></div></div>}{children}</div></main></div></div>;
}
