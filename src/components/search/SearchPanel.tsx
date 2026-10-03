import { Search, X, Clock3, Sparkles, ArrowUpLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '@/features/search/search.store';
import { demoProducts } from '@/features/catalog/demo-products';
import { trackGrowthEvent } from '@/features/recommendations/growth.events';
export function SearchPanel(){
 const recent=useSearchStore(s=>s.recent);const remove=useSearchStore(s=>s.remove);const clear=useSearchStore(s=>s.clear);const add=useSearchStore(s=>s.add);const [q,setQ]=useState('');const nav=useNavigate();
 const suggestions=q.trim().length<1?demoProducts.slice(0,6):demoProducts.filter(p=>[p.nameFa,p.nameEn,p.brand?.nameFa,p.brand?.nameEn].join(' ').toLocaleLowerCase().includes(q.toLocaleLowerCase())).slice(0,6);
 const submit=(value:string)=>{const v=value.trim();if(v.length<2)return;void trackGrowthEvent('search',{query:v});add(v);nav(`/products?q=${encodeURIComponent(v)}`)};
 return <div className="mx-search-panel"><div className="mx-search-panel-head"><div className="mx-search-input-wrap"><Search size={18}/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit(q)} placeholder="محصول، برند، دسته‌بندی…"/><button type="button" onClick={()=>setQ('')} aria-label="پاک کردن"><X size={15}/></button></div></div>{recent.length>0&&<div className="mx-search-section"><div className="mx-search-section-head"><span><Clock3 size={14}/> جستجوهای اخیر</span><button type="button" onClick={clear}>پاک کردن</button></div><div className="mx-search-chip-list">{recent.map(item=><button key={item} type="button" onClick={()=>submit(item)}>{item}<X size={11} onClick={e=>{e.stopPropagation();remove(item)}}/></button>)}</div></div>}<div className="mx-search-section"><div className="mx-search-section-head"><span><Sparkles size={14}/> پیشنهادهای هوشمند</span></div>{suggestions.map(p=><button key={p.id} type="button" className="mx-search-result" onClick={()=>nav(`/products/${p.slug}`)}><div className="mx-search-result-thumb">{p.images[0]?.url&&<img src={p.images[0].url} alt=""/>}</div><div><strong>{p.nameFa}</strong><small>{p.brand?.nameFa||'Mobilex'}</small></div><ArrowUpLeft size={15}/></button>)}</div></div>
}
