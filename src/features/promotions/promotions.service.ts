import { supabase } from '@/lib/supabase/client';
import type { PromotionCampaign } from './promotions.types';

const demo:PromotionCampaign[]=[
 {id:'demo-p1',slug:'flash-mobile',titleFa:'فروش ویژه موبایل',titleEn:'Mobile Flash Sale',descriptionFa:'انتخابی از گوشی‌های محبوب با تخفیف‌های ویژه.',descriptionEn:'Selected popular phones with limited-time offers.',badge:'FLASH',startsAt:new Date(Date.now()-86400000).toISOString(),endsAt:new Date(Date.now()+86400000*3).toISOString(),discountPercent:25,active:true},
 {id:'demo-p2',slug:'accessories-week',titleFa:'هفته لوازم جانبی',titleEn:'Accessories Week',descriptionFa:'برای خرید لوازم جانبی، تخفیف‌های دوره‌ای فعال است.',descriptionEn:'Limited-time accessory offers are live.',badge:'WEEKLY',startsAt:new Date().toISOString(),endsAt:new Date(Date.now()+86400000*7).toISOString(),discountPercent:15,active:true}
];
export async function listActivePromotions():Promise<PromotionCampaign[]>{
  if(!supabase)return demo;
  const {data,error}=await supabase.from('promotions').select('id,slug,title_fa,title_en,description_fa,description_en,badge,starts_at,ends_at,discount_percent,coupon_code,image_url,active').eq('active',true).lte('starts_at',new Date().toISOString()).gte('ends_at',new Date().toISOString()).order('starts_at',{ascending:false});
  if(error)return demo;
  return (data??[]).map((r:any)=>({id:String(r.id),slug:String(r.slug),titleFa:String(r.title_fa),titleEn:r.title_en||undefined,descriptionFa:r.description_fa||undefined,descriptionEn:r.description_en||undefined,badge:r.badge||undefined,startsAt:String(r.starts_at),endsAt:String(r.ends_at),discountPercent:r.discount_percent?Number(r.discount_percent):undefined,couponCode:r.coupon_code||undefined,imageUrl:r.image_url||undefined,active:Boolean(r.active)}));
}
