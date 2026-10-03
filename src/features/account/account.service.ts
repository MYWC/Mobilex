import { supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import { getCurrentUser } from '@/services/auth/auth.service';
import type { AccountPreferences, AccountStats, UserProfileSnapshot } from './account.types';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';
import { useNotificationStore } from '@/features/notifications/notification.store';
import { useAppStore } from '@/stores/useAppStore';

export async function getMyProfile():Promise<UserProfileSnapshot|null>{
  const user=await getCurrentUser();if(!user)return null;
  if(!supabase)return{id:user.id,email:user.email,fullName:user.user_metadata?.full_name??user.email??'',avatarUrl:user.user_metadata?.avatar_url};
  const {data,error}=await supabase.from('profiles').select('id,full_name,phone,avatar_url,role,created_at').eq('id',user.id).maybeSingle();if(error)throw normalizeError(error);
  return {id:user.id,email:user.email,fullName:data?.full_name??user.user_metadata?.full_name??user.email??'',phone:data?.phone??undefined,avatarUrl:data?.avatar_url??undefined,role:data?.role??'customer',createdAt:data?.created_at??undefined};
}

export async function getAccountStats():Promise<AccountStats>{
  const user=await getCurrentUser();
  const fallback:AccountStats={totalOrders:0,activeOrders:0,deliveredOrders:0,wishlistCount:useWishlistStore.getState().ids.length,unreadNotifications:useNotificationStore.getState().items.filter(x=>!x.read).length,lifetimeSpend:0};
  if(!user||!supabase)return fallback;
  try{
    const [ordersTotal,ordersActive,ordersDelivered,spend,wish,unread]=await Promise.allSettled([
      supabase.from('orders').select('*',{count:'exact',head:true}).eq('user_id',user.id),
      supabase.from('orders').select('*',{count:'exact',head:true}).eq('user_id',user.id).in('status',['processing','pending_payment','paid','shipped']),
      supabase.from('orders').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('status','delivered'),
      supabase.from('orders').select('total_amount').eq('user_id',user.id).not('status','in','(cancelled,returned)'),
      supabase.from('wishlist_items').select('*',{count:'exact',head:true}).eq('user_id',user.id),
      supabase.from('notifications').select('*',{count:'exact',head:true}).eq('user_id',user.id).is('read_at',null),
    ]);
    const value=(x:any)=>x.status==='fulfilled'?x.value:null;
    const total=value(ordersTotal),active=value(ordersActive),delivered=value(ordersDelivered),sp=value(spend),wi=value(wish),un=value(unread);
    return{
      totalOrders:total?.count??0,
      activeOrders:active?.count??0,
      deliveredOrders:delivered?.count??0,
      wishlistCount:wi?.count??fallback.wishlistCount,
      unreadNotifications:un?.count??fallback.unreadNotifications,
      lifetimeSpend:(sp?.data??[]).reduce((sum:number,row:any)=>sum+Number(row.total_amount||0),0),
    };
  }catch{return fallback}
}

const prefKey='mobilex.account.preferences.v1';
const defaults:AccountPreferences={marketingEmail:true,orderEmail:true,pushNotifications:true,priceDropAlerts:true,restockAlerts:true};
export function getLocalPreferences():AccountPreferences{try{return {...defaults,...JSON.parse(localStorage.getItem(prefKey)||'{}')}}catch{return defaults}}
export function saveLocalPreferences(prefs:AccountPreferences){localStorage.setItem(prefKey,JSON.stringify(prefs));}
export async function getPreferences():Promise<AccountPreferences>{const user=await getCurrentUser();if(!user||!supabase)return getLocalPreferences();const {data}=await supabase.from('notification_preferences').select('marketing_email,order_email,push_notifications,price_drop_alerts,restock_alerts').eq('user_id',user.id).maybeSingle();const prefs={marketingEmail:data?.marketing_email??defaults.marketingEmail,orderEmail:data?.order_email??defaults.orderEmail,pushNotifications:data?.push_notifications??defaults.pushNotifications,priceDropAlerts:data?.price_drop_alerts??defaults.priceDropAlerts,restockAlerts:data?.restock_alerts??defaults.restockAlerts};saveLocalPreferences(prefs);return prefs}
export async function savePreferences(prefs:AccountPreferences):Promise<void>{saveLocalPreferences(prefs);const user=await getCurrentUser();if(!user||!supabase)return;const {error}=await supabase.from('notification_preferences').upsert({user_id:user.id,marketing_email:prefs.marketingEmail,order_email:prefs.orderEmail,push_notifications:prefs.pushNotifications,price_drop_alerts:prefs.priceDropAlerts,restock_alerts:prefs.restockAlerts},{onConflict:'user_id'});if(error)throw normalizeError(error)}

export async function updateProfile(input:{fullName:string;phone?:string;avatarUrl?:string}):Promise<void>{const user=await getCurrentUser();if(!user)throw new Error('AUTH_REQUIRED');if(!supabase){return;}const {error}=await supabase.from('profiles').update({full_name:input.fullName,phone:input.phone||null,avatar_url:input.avatarUrl||null,updated_at:new Date().toISOString()}).eq('id',user.id);if(error)throw normalizeError(error)}
