import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/services/auth/auth.service';

export type GrowthEventName='view_product'|'search'|'add_to_cart'|'wishlist'|'compare'|'promotion_click'|'review_submit'|'support_create';
export async function trackGrowthEvent(name:GrowthEventName,payload:Record<string,unknown>={}):Promise<void>{
  const user=await getCurrentUser().catch(()=>null);
  if(!supabase)return;
  const client = supabase;
if (!client) return;

try {
  await client
    .from('growth_events')
    .insert({
      user_id: user?.id ?? null,
      event_name: name,
      payload,
      created_at: new Date().toISOString(),
    });
} catch {
  // analytics must never block the UI
}
}
