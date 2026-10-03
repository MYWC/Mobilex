import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret: string, raw: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw))));
}

function secureEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const secret = Deno.env.get('PAYMENT_WEBHOOK_SECRET') || '';
  if (!secret) return Response.json({ error: 'webhook_not_configured' }, { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get('x-payment-signature') || '';
  const expected = await hmacHex(secret, raw);
  const provided = signature.replace(/^sha256=/i, '').trim().toLowerCase();
  if (!provided || !secureEqual(provided, expected)) return Response.json({ error: 'invalid_signature' }, { status: 401 });

  try {
    const payload = JSON.parse(raw) as Record<string, unknown>;
    const orderId = String(payload.orderId || payload.order_id || '');
    const paymentId = String(payload.paymentId || payload.payment_id || payload.authority || '');
    const status = String(payload.status || '').toLowerCase();
    const provider = String(payload.provider || Deno.env.get('PAYMENT_PROVIDER') || 'gateway');
    const eventId = String(payload.eventId || payload.event_id || paymentId || crypto.randomUUID());
    const amount = Number(payload.amount || 0);
    if (!orderId || !paymentId || !['paid', 'failed', 'cancelled'].includes(status)) return Response.json({ error: 'invalid_payload' }, { status: 400 });

    const serviceClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: existing } = await serviceClient.from('payment_webhook_events').select('id,processed_at').eq('provider', provider).eq('event_id', eventId).maybeSingle();
    if (existing?.processed_at) return Response.json({ ok: true, duplicate: true });

    const { data: order, error: orderError } = await serviceClient.from('orders').select('id,total_amount,currency,status,payment_status').eq('id', orderId).maybeSingle();
    if (orderError) throw orderError;
    if (!order) return Response.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    if (Number.isFinite(amount) && amount > 0 && Math.abs(Number(order.total_amount) - amount) > 0.001) return Response.json({ error: 'AMOUNT_MISMATCH' }, { status: 409 });

    if (!existing) {
      const { error: insertError } = await serviceClient.from('payment_webhook_events').insert({
        event_id: eventId, provider, order_id: orderId, payment_id: paymentId, status, amount: Number.isFinite(amount) ? amount : Number(order.total_amount), payload,
      });
      if (insertError && !String(insertError.message || '').toLowerCase().includes('duplicate')) throw insertError;
    }

    const { error } = await serviceClient.rpc('mx_mark_payment_result', {
      p_order_id: orderId,
      p_provider: provider,
      p_external_id: paymentId,
      p_status: status,
      p_raw: payload,
    });
    if (error) throw error;

    const { error: markProcessedError } = await serviceClient.from('payment_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('provider', provider).eq('event_id', eventId);
    if (markProcessedError) throw markProcessedError;

    return Response.json({ ok: true, orderId, paymentId, status });
  } catch (error) {
    console.error('[Mobilex payment webhook]', error);
    return Response.json({ error: error instanceof Error ? error.message : 'unexpected' }, { status: 500 });
  }
});
