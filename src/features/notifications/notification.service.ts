import { supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import type { NotificationItem } from './notification.types';

function mapRow(row: any): NotificationItem {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    body: row.body == null ? undefined : String(row.body),
    tone: row.tone === 'success' || row.tone === 'warning' || row.tone === 'danger' ? row.tone : 'info',
    createdAt: new Date(row.created_at ?? Date.now()).getTime(),
    read: Boolean(row.read_at),
    href: row.href ?? undefined,
  };
}

export async function listRemoteNotifications(userId: string, limit = 100): Promise<NotificationItem[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id,title,body,tone,created_at,read_at,href')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function markRemoteNotificationRead(userId: string, notificationId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', notificationId).eq('user_id', userId);
  if (error) throw normalizeError(error);
}

export async function markAllRemoteNotificationsRead(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null);
  if (error) throw normalizeError(error);
}

export async function deleteRemoteNotification(userId: string, notificationId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('notifications').delete().eq('id', notificationId).eq('user_id', userId);
  if (error) throw normalizeError(error);
}

export async function subscribeNotifications(userId: string, onChange: () => void): Promise<() => void> {
  if (!supabase) return () => undefined;
  const channel = supabase.channel(`mobilex-notifications:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}
