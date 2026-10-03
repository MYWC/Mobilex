import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useAppStore } from '@/stores/useAppStore';
import { getPersonalizedRecommendations } from '@/features/recommendations/recommendations.service';
import type { CatalogProduct } from '@/types/catalog';
export function RecommendationsPage(){const fa=useAppStore(s=>s.locale==='fa');const [products,setProducts]=useState<CatalogProduct[]>([]);useEffect(()=>{void getPersonalizedRecommendations(16).then(setProducts)},[]);return <div className="mx-page"><div className="mx-shell"><div className="mx-page-heading-row"><div><div className="mx-kicker">SMART DISCOVERY</div><h1>{fa?'پیشنهادهای شخصی':'Personalized recommendations'}</h1><p>{fa?'محصولات بر اساس علاقه‌مندی‌ها، مشاهده‌ها و نشانه‌های محبوبیت مرتب شده‌اند.':'Recommendations weighted by your interests, recently viewed items, and popularity.'}</p></div><Sparkles size={30}/></div>{products.length?<ProductGrid products={products}/>:<div className="mx-growth-empty"><p>{fa?'هنوز سیگنال کافی برای شخصی‌سازی نداریم. چند محصول را ببین و دوباره امتحان کن.':'We need a few more signals. Browse some products and come back.'}</p></div>}</div></div>}
