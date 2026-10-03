import type { ReactNode } from 'react';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function AdminDataView({title,subtitle,children,search,onSearch,actions,onRefresh}:{title:string;subtitle?:string;children:ReactNode;search?:string;onSearch?:(v:string)=>void;actions?:ReactNode;onRefresh?:()=>void}){
 const [value,setValue]=useState(search||'');
 return <section className="mx-admin-panel"><div className="mx-admin-panel-head"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><div className="mx-admin-actions">{onSearch&&<label className="mx-admin-inline-search"><Search size={15}/><input value={value} onChange={e=>{setValue(e.target.value);onSearch(e.target.value)}} placeholder="جستجو..."/></label>}{onRefresh&&<button className="mx-button mx-button-secondary" onClick={onRefresh}><RefreshCw size={14}/> بروزرسانی</button>}{actions}</div></div>{children}</section>;
}

export function AdminFilters({children}:{children:ReactNode}){return <div className="mx-admin-filters"><SlidersHorizontal size={14}/>{children}</div>}
