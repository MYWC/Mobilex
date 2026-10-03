import { supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import { getCurrentUser } from '@/services/auth/auth.service';
import type { LoyaltyAccount, LoyaltyTier, LoyaltyTransaction } from './loyalty.types';

function tierFor(points:number):{tier:LoyaltyTier;next:number;progress:number}{
  const tiers:[LoyaltyTier,number][]=[['starter',0],['silver',1000],['gold',5000],['platinum',15000]];
  let current=tiers[0]; let next=Infinity;
  for(let i=0;i<tiers.length;i++){if(points>=tiers[i][1])current=tiers[i]; if(points<tiers[i][1]){next=tiers[i][1];break;}}
  const base=current[1]; const progress=next===Infinity?100:Math.min(100,Math.max(0,((points-base)/(next-base))*100));
  return {tier:current[0],next,progress};
}

export async function getLoyaltyAccount():Promise<LoyaltyAccount|null>{
  const user=await getCurrentUser(); if(!user) return null;
  if(!supabase){const points=750;const meta=tierFor(points);return {userId:user.id,points,lifetimePoints:points,tier:meta.tier,nextTierPoints:meta.next,progress:meta.progress};}
  try{const {data,error}=await supabase.from('loyalty_accounts').select('user_id,points,lifetime_points').eq('user_id',user.id).maybeSingle();if(error)throw error;const points=Number(data?.points??0), lifetime=Number(data?.lifetime_points??points),meta=tierFor(lifetime);return {userId:user.id,points,lifetimePoints:lifetime,tier:meta.tier,nextTierPoints:meta.next,progress:meta.progress};}catch(error){throw normalizeError(error)}
}

export async function listLoyaltyTransactions(limit=30):Promise<LoyaltyTransaction[]>{
  const user=await getCurrentUser(); if(!user) return [];
  if(!supabase) return [{id:'demo-l1',type:'earn',points:500,description:'امتیاز ثبت‌نام',createdAt:new Date(Date.now()-86400000*12).toISOString()},{id:'demo-l2',type:'earn',points:250,description:'خرید موفق',createdAt:new Date(Date.now()-86400000*3).toISOString()}];
  const {data,error}=await supabase.from('loyalty_transactions').select('id,type,points,description,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(limit);if(error)throw normalizeError(error);return (data??[]).map((r:any)=>({id:String(r.id),type:r.type==='redeem'?'redeem':r.type==='adjust'?'adjust':'earn',points:Number(r.points),description:String(r.description||''),createdAt:String(r.created_at)}));
}
