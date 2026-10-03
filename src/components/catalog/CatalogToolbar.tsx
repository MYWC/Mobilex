import { LayoutGrid, List, SlidersHorizontal, ArrowDownAZ } from 'lucide-react';
import type { BrandSummary, CategorySummary, ProductSort } from '@/types/catalog';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { useCatalogStore } from '@/features/catalog/catalog.store';
export function CatalogToolbar({brands,categories}:{brands:BrandSummary[];categories:CategorySummary[]}){
 const sort=useCatalogStore(s=>s.filters.sort); const setSort=useCatalogStore(s=>s.setSort); const view=useCatalogStore(s=>s.view); const setView=useCatalogStore(s=>s.setView); const [open,setOpen]=useState(false);
 const options=[{value:'relevance',label:'پیشنهاد شده'},{value:'newest',label:'جدیدترین'},{value:'price_asc',label:'قیمت: کم به زیاد'},{value:'price_desc',label:'قیمت: زیاد به کم'},{value:'rating',label:'بیشترین امتیاز'},{value:'discount',label:'بیشترین تخفیف'}];
 return <><div className="mx-catalog-toolbar"><div className="mx-toolbar-left"><Button variant="outline" size="sm" icon={<SlidersHorizontal size={15}/>} className="mx-filter-mobile-trigger" onClick={()=>setOpen(true)}>فیلترها</Button><span className="mx-result-count">{useCatalogStore(s=>s.total).toLocaleString('fa-IR')} کالا</span></div><div className="mx-toolbar-right"><div className="mx-sort-control"><ArrowDownAZ size={15}/><Select value={sort} onChange={e=>setSort(e.target.value as ProductSort)}><option value="relevance">پیشنهاد شده</option><option value="newest">جدیدترین</option><option value="price_asc">قیمت: کم به زیاد</option><option value="price_desc">قیمت: زیاد به کم</option><option value="rating">بیشترین امتیاز</option><option value="discount">بیشترین تخفیف</option></Select></div><div className="mx-view-toggle"><button type="button" className={view==='grid'?'is-active':''} onClick={()=>setView('grid')} aria-label="Grid"><LayoutGrid size={15}/></button><button type="button" className={view==='list'?'is-active':''} onClick={()=>setView('list')} aria-label="List"><List size={15}/></button></div></div></div><Drawer open={open} onClose={()=>setOpen(false)} title="فیلتر محصولات"><FilterSidebar brands={brands} categories={categories}/></Drawer></>
}
