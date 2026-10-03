import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { appEnv } from '@/app/config/env';

export const supabase: SupabaseClient | null = appEnv.isSupabaseConfigured
  ? createClient(appEnv.supabaseUrl, appEnv.supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': `mobilex/${import.meta.env.VITE_APP_VERSION ?? '2.0'}`,
        },
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }
  return supabase;
}
