import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  // Compatibility with the legacy Mobilex project.
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
  VITE_PUBLIC_APP_URL: z.string().url().optional(),
  VITE_OBSERVABILITY_ENDPOINT: z.string().url().optional(),
  VITE_PAYMENT_MODE: z.enum(['disabled','sandbox','live']).optional(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success && import.meta.env.DEV) {
  console.error('[Mobilex] Invalid environment configuration', parsed.error.flatten().fieldErrors);
}

const env = parsed.success ? parsed.data : {};
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? '';

export const appEnv = {
  supabaseUrl: env.VITE_SUPABASE_URL ?? '',
  supabasePublishableKey: publishableKey,
  appEnv: env.VITE_APP_ENV ?? (import.meta.env.PROD ? 'production' : 'development'),
  version: '2.0.0',
  publicUrl: env.VITE_PUBLIC_APP_URL ?? '',
  observabilityEndpoint: env.VITE_OBSERVABILITY_ENDPOINT ?? '',
  isSupabaseConfigured: Boolean(env.VITE_SUPABASE_URL && publishableKey),
  allowDemoMode: !import.meta.env.PROD && !Boolean(env.VITE_SUPABASE_URL && publishableKey),
  isProduction: import.meta.env.PROD,
  paymentMode: env.VITE_PAYMENT_MODE ?? 'disabled',
} as const;

export function requireSupabaseEnv(): { url: string; key: string } {
  if (!appEnv.isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }
  return { url: appEnv.supabaseUrl, key: appEnv.supabasePublishableKey };
}
