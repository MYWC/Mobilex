import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const authorization = req.headers.get('Authorization') ?? '';
  const expected = Deno.env.get('CRON_SECRET');
  if (!expected || authorization !== `Bearer ${expected}`) return new Response('Unauthorized', { status: 401 });

  try {
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data, error } = await client.rpc('mx_expire_inventory_reservations');
    if (error) throw error;
    return Response.json({ releasedOrders: Number(data || 0) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'unexpected' }, { status: 500 });
  }
});
