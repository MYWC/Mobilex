import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import type { BrandSummary, CategorySummary } from '@/types/catalog';
import { useCatalogStore } from '@/features/catalog/catalog.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/ui/cn';
export function FilterSidebar({brands,categories}:{brands:BrandSummary[];categories:CategorySummary[]}){
 const f=useCatalogStore(s=>s.filters); const setRange=useCatalogStore(s=>s.setPriceRange); const toggleBrand=useCatalogStore(s=>s.toggleBrand); const toggleCategory=useCatalogStore(s=>s.toggleCategory); const toggleRating=useCatalogStore(s=>s.toggleRating); const setBool=useCatalogStore(s=>s.setBooleanFilter); const clear=useCatalogStore(s=>s.clearFilters);
 return <aside className="mx-filter-sidebar"><div className="mx-filter-header"><div><span className="mx-eyebrow">FILTERS</span><h3><SlidersHorizontal size={17}/> فیلترها</h3></div><Button variant="ghost" size="xs" onClick={clear} icon={<RotateCcw size={13}/>}>پاک‌سازی</Button></div>
  <div className="mx-filter-group"><strong>قیمت</strong><div className="mx-filter-price-grid"><Input type="number" value={f.minPrice??''} onChange={e=>setRange(e.target.value?Number(e.target.value):undefined,f.maxPrice)} placeholder="حداقل"/><Input type="number" value={f.maxPrice??''} onChange={e=>setRange(f.minPrice,e.target.value?Number(e.target.value):undefined)} placeholder="حداکثر"/></div></div>
  <div className="mx-filter-group"><strong>دسته‌بندی</strong>{categories.map(c=><label key={c.id} className="mx-check-row"><input type="checkbox" checked={f.categoryIds.includes(c.id)} onChange={()=>toggleCategory(c.id)}/><span>{c.nameFa||c.nameEn}</span><small>{c.id}</small></label>)}</div>
  <div className="mx-filter-group"><strong>برند</strong>{brands.map(b=><label key={b.id} className="mx-check-row"><input type="checkbox" checked={f.brandIds.includes(b.id)} onChange={()=>toggleBrand(b.id)}/><span>{b.nameFa||b.nameEn}</span></label>)}</div>
  <div className="mx-filter-group"><strong>امتیاز</strong>{[4,3,2].map(r=><label key={r} className="mx-check-row"><input type="checkbox" checked={f.ratings.includes(r)} onChange={()=>toggleRating(r)}/><span>{r}+ ستاره</span></label>)}</div>
  <div className="mx-filter-group"><strong>ویژگی‌ها</strong><label className={cn('mx-switch-row',f.onlyInStock&&'is-on')}><span>فقط موجودها</span><input type="checkbox" checked={f.onlyInStock} onChange={e=>setBool('onlyInStock',e.target.checked)}/><i><Check size={11}/></i></label><label className={cn('mx-switch-row',f.onlyDiscounted&&'is-on')}><span>فقط تخفیف‌دار</span><input type="checkbox" checked={f.onlyDiscounted} onChange={e=>setBool('onlyDiscounted',e.target.checked)}/><i><Check size={11}/></i></label><label className={cn('mx-switch-row',f.onlyNew&&'is-on')}><span>فقط جدیدها</span><input type="checkbox" checked={f.onlyNew} onChange={e=>setBool('onlyNew',e.target.checked)}/><i><Check size={11}/></i></label></div>
 </aside>
}
