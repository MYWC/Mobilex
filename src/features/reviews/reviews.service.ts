import { supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import { getCurrentUser } from '@/services/auth/auth.service';
import type { ProductReview, ReviewSummary } from './reviews.types';

const demoReviews: ProductReview[] = [
  { id:'demo-r1', productId:'demo', userName:'کاربر Mobilex', rating:5, title:'انتخاب عالی', body:'کیفیت و تجربه خرید خیلی خوب بود.', verifiedPurchase:true, helpfulCount:14, createdAt:new Date(Date.now()-86400000*3).toISOString() },
  { id:'demo-r2', productId:'demo', userName:'Mobilex User', rating:4, title:'خوب و سریع', body:'بسته‌بندی مرتب و ارسال سریع.', verifiedPurchase:true, helpfulCount:8, createdAt:new Date(Date.now()-86400000*8).toISOString() },
];

const mapRow = (row:any): ProductReview => ({ id:String(row.id), productId:String(row.product_id), userId:row.user_id ? String(row.user_id) : undefined, userName:row.profile?.full_name || row.profile?.name || undefined, rating:Number(row.rating), title:row.title ?? undefined, body:String(row.body ?? ''), verifiedPurchase:Boolean(row.is_verified_purchase), helpfulCount:Number(row.helpful_count ?? 0), createdAt:String(row.created_at) });

export async function listProductReviews(productId:string):Promise<{reviews:ProductReview[];summary:ReviewSummary}> {
  if(!supabase) return {reviews:demoReviews.map(x=>({...x,productId})), summary:{average:4.6,count:2,distribution:{1:0,2:0,3:0,4:1,5:1}}};
  try {
    const {data,error}=await supabase.from('product_reviews').select('id,product_id,user_id,rating,title,body,is_verified_purchase,helpful_count,created_at,profile:profiles(full_name)').eq('product_id',productId).eq('status','approved').order('created_at',{ascending:false}).limit(100);
    if(error) throw error;
    const reviews=(data??[]).map(mapRow);
    const distribution={1:0,2:0,3:0,4:0,5:0} as Record<1|2|3|4|5,number>;
    reviews.forEach(r=>{const n=Math.max(1,Math.min(5,Math.round(r.rating))) as 1|2|3|4|5;distribution[n]++;});
    return {reviews,summary:{average:reviews.length?reviews.reduce((s,r)=>s+r.rating,0)/reviews.length:0,count:reviews.length,distribution}};
  } catch(error){ throw normalizeError(error); }
}

export async function createProductReview(input:{productId:string;rating:number;title?:string;body:string}):Promise<ProductReview> {
  const user=await getCurrentUser(); if(!user) throw new Error('AUTH_REQUIRED');
  if(!supabase) return {id:`local-${Date.now()}`,productId:input.productId,userId:user.id,userName:user.email,rating:input.rating,title:input.title,body:input.body,verifiedPurchase:false,helpfulCount:0,createdAt:new Date().toISOString()};
  const {data,error}=await supabase.from('product_reviews').insert({product_id:input.productId,user_id:user.id,rating:input.rating,title:input.title?.trim()||null,body:input.body.trim(),status:'pending'}).select('id,product_id,user_id,rating,title,body,is_verified_purchase,helpful_count,created_at').single();
  if(error) throw normalizeError(error);
  return mapRow(data);
}

export async function markReviewHelpful(reviewId:string):Promise<void> {
  if(!supabase) return;
  const {error}=await supabase.rpc('mx_mark_review_helpful',{p_review_id:reviewId});
  if(error) throw normalizeError(error);
}
