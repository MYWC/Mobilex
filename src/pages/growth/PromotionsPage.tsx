import { useEffect, useState } from 'react';
import { ArrowUpLeft, CalendarClock, Copy, Percent, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/stores/useAppStore';
import { listActivePromotions } from '@/features/promotions/promotions.service';
import type { PromotionCampaign } from '@/features/promotions/promotions.types';
import { trackGrowthEvent } from '@/features/recommendations/growth.events';

export function PromotionsPage(){const fa=useAppStore(s=>s.locale==='fa');const [items,setItems]=useState<PromotionCampaign[]>([]);useEffect(()=>{void listActivePromotions().then(setItems)},[]);return <div className="mx-page"><div className="mx-shell"><div className="mx-page-heading-row"><div><div className="mx-kicker">MOBILEX PROMOTIONS</div><h1>{fa?'باشگاه پیشنهادها و تخفیف‌ها':'Promotions & Deals'}</h1><p>{fa?'کمپین‌های فعال را ببین و سریع‌تر پیشنهاد مناسب را پیدا کن.':'Discover active campaigns and limited-time offers.'}</p></div><Link to="/products"><Button iconAfter={<ArrowUpLeft size={15}/>}>{fa?'همه محصولات':'All products'}</Button></Link></div><div className="mx-promo-grid">{items.map(p=><Card key={p.id} interactive className="mx-promo-card"><div className="mx-promo-glow"><Sparkles size={18}/><span>{p.badge||'MOBILEX'}</span></div><div className="mx-promo-top"><Badge tone="danger" dot>{p.discountPercent?`${p.discountPercent}%`:fa?'پیشنهاد ویژه':'Special offer'}</Badge><span><CalendarClock size={14}/>{new Date(p.endsAt).toLocaleDateString(fa?'fa-IR':'en-US')}</span></div><h2>{fa?p.titleFa:p.titleEn||p.titleFa}</h2><p>{fa?p.descriptionFa||'پیشنهاد محدود زمانی Mobilex.':p.descriptionEn||p.descriptionFa||'Limited-time Mobilex offer.'}</p>{p.couponCode&&<div className="mx-promo-code"><code>{p.couponCode}</code><button onClick={()=>void navigator.clipboard?.writeText(p.couponCode||'')} aria-label="copy"><Copy size={14}/></button></div>}<Link to="/products" onClick={()=>void trackGrowthEvent('promotion_click',{promotionId:p.id,slug:p.slug})} className="mx-promo-cta"><span>{fa?'مشاهده محصولات':'Explore products'}</span><Percent size={15}/></Link></Card>)}</div></div></div>}
