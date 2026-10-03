import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigin = Deno.env.get('PAYMENT_ALLOWED_ORIGIN') || '';
const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': allowedOrigin && origin === allowedOrigin ? origin : allowedOrigin || 'null',
  'Vary': 'Origin',
  'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
});

serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }), { status: 405, headers: corsHeaders(origin) });

  try {
    const body = await req.json();
    const orderId = String(body.orderId || '');
    const callbackUrl = String(body.callbackUrl || '');
    if (!orderId || !callbackUrl) return new Response(JSON.stringify({ error: 'invalid_request' }), { status: 400, headers: corsHeaders(origin) });

    const gatewayUrl = Deno.env.get('PAYMENT_GATEWAY_URL') || '';
    const gatewaySecret = Deno.env.get('PAYMENT_GATEWAY_SECRET') || '';
    const provider = Deno.env.get('PAYMENT_PROVIDER') || 'gateway';
    if (!gatewayUrl || !gatewaySecret) {
      return new Response(JSON.stringify({ error: 'payment_provider_not_configured' }), { status: 503, headers: corsHeaders(origin) });
    }

    const auth = req.headers.get('Authorization') ?? '';
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'AUTH_REQUIRED' }), { status: 401, headers: corsHeaders(origin) });

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .select('id,order_number,user_id,total_amount,currency,status,payment_status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) return new Response(JSON.stringify({ error: 'ORDER_NOT_FOUND' }), { status: 404, headers: corsHeaders(origin) });
    if (order.status !== 'pending_payment' || order.payment_status === 'paid') {
      return new Response(JSON.stringify({ error: 'ORDER_NOT_PAYABLE' }), { status: 409, headers: corsHeaders(origin) });
    }

    const gatewayResponse = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gatewaySecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Mobilex-Request': crypto.randomUUID(),
      },
      body: JSON.stringify({
        provider,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: Number(order.total_amount),
        currency: order.currency || 'TOMAN',
        callbackUrl,
      }),
    });

    const gatewayJson = await gatewayResponse.json().catch(() => ({}));
    if (!gatewayResponse.ok) {
      throw new Error(`Gateway rejected request (${gatewayResponse.status})`);
    }

    const paymentId = String(gatewayJson.paymentId || gatewayJson.payment_id || gatewayJson.authority || '');
    const redirectUrl = String(gatewayJson.redirectUrl || gatewayJson.redirect_url || gatewayJson.url || '');
    const amount = Number(gatewayJson.amount || order.total_amount);
    const expiresAt = typeof gatewayJson.expiresAt === 'string' ? gatewayJson.expiresAt : (typeof gatewayJson.expires_at === 'string' ? gatewayJson.expires_at : undefined);
    if (!paymentId || !redirectUrl || !Number.isFinite(amount) || amount !== Number(order.total_amount)) {
      throw new Error('Gateway response contract is invalid');
    }

    const { error: txError } = await serviceClient.from('payment_transactions').insert({
      order_id: order.id,
      provider,
      external_payment_id: paymentId,
      status: 'redirected',
      amount,
      currency: order.currency || 'TOMAN',
      checkout_url: redirectUrl,
      expires_at: expiresAt || null,
      raw_response: gatewayJson,
    });
    if (txError) throw txError;

    return new Response(JSON.stringify({ provider, paymentId, amount, redirectUrl, expiresAt }), { headers: corsHeaders(origin) });
  } catch (error) {
    console.error('[Mobilex payment session]', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'unexpected' }), { status: 500, headers: corsHeaders(origin) });
  }
});
