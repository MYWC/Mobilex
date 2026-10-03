import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json();
    const code = String(body.code || '').trim().toUpperCase();
    const subtotal = Math.max(0, Number(body.subtotal || 0));
    if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
      return new Response(JSON.stringify({ valid: false, reason: 'invalid' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const auth = req.headers.get('Authorization') ?? '';
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await client.auth.getUser();

    const { data, error } = await client.from('coupons')
      .select('id,code,type,value,min_order_amount,max_discount_amount,starts_at,expires_at,is_active,usage_limit,used_count,description,first_order_only')
      .ilike('code', code)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return new Response(JSON.stringify({ valid: false, reason: 'not_found' }), { headers: { ...cors, 'Content-Type': 'application/json' } });

    const now = Date.now();
    if (data.starts_at && Date.parse(data.starts_at) > now) return new Response(JSON.stringify({ valid: false, reason: 'not_started' }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    if (data.expires_at && Date.parse(data.expires_at) < now) return new Response(JSON.stringify({ valid: false, reason: 'expired' }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    if (data.usage_limit != null && Number(data.used_count || 0) >= Number(data.usage_limit)) return new Response(JSON.stringify({ valid: false, reason: 'limit' }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    if (data.min_order_amount != null && subtotal < Number(data.min_order_amount)) return new Response(JSON.stringify({ valid: false, reason: 'minimum_order', minOrderAmount: Number(data.min_order_amount) }), { headers: { ...cors, 'Content-Type': 'application/json' } });

    if (data.first_order_only && user) {
      const { data: priorUsage, error: priorUsageError } = await client.from('coupon_usages').select('id').eq('coupon_id', data.id).eq('user_id', user.id).maybeSingle();
      if (priorUsageError) throw priorUsageError;
      if (priorUsage) return new Response(JSON.stringify({ valid: false, reason: 'already_used' }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const raw = data.type === 'percent' ? Math.floor(subtotal * Number(data.value) / 100) : Number(data.value);
    const discount = Math.min(subtotal, data.max_discount_amount == null ? raw : Math.min(raw, Number(data.max_discount_amount)));
    return new Response(JSON.stringify({
      valid: true,
      code: data.code,
      type: data.type,
      value: Number(data.value),
      discount,
      description: data.description,
      userId: user?.id ?? null,
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'unexpected' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
