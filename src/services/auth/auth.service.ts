import type { Session, User } from '@supabase/supabase-js';
import { supabase, requireSupabase } from '@/lib/supabase/client';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

export interface AuthSnapshot {
  user: User | null;
  session: Session | null;
}

export async function getAuthSnapshot(): Promise<AuthSnapshot> {
  if (!supabase) return { user: null, session: null };
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new AppError('DATABASE', error.message, { cause: error, retryable: true });
  return { user: data.session?.user ?? null, session: data.session ?? null };
}
export async function getCurrentUser(): Promise<User | null> {
  const snapshot = await getAuthSnapshot();
  return snapshot.user;
}
export function subscribeToAuth(callback: (snapshot: AuthSnapshot) => void): () => void {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback({ user: session?.user ?? null, session: session ?? null });
  });
  logger.debug('Auth listener attached');
  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSnapshot> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new AppError('AUTH_REQUIRED', error.message, { cause: error });
  return { user: data.user, session: data.session };
}

export async function registerWithPassword(email: string, password: string, data?: Record<string, unknown>): Promise<AuthSnapshot> {
  const client = requireSupabase();
  const { data: result, error } = await client.auth.signUp({ email, password, options: { data } });
  if (error) throw new AppError('AUTH_REQUIRED', error.message, { cause: error });
  return { user: result.user, session: result.session };
}
export async function signOut(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw new AppError('AUTH_REQUIRED', error.message, { cause: error });
}

export async function logout(): Promise<void> {
  await signOut();
}

export async function sendPasswordReset(email: string, redirectTo?: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.resetPasswordForEmail(
    email,
    redirectTo ? { redirectTo } : undefined
  );
  if (error) throw new AppError('AUTH_REQUIRED', error.message, { cause: error });
}