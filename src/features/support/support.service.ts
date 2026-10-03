import { supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import { getCurrentUser } from '@/services/auth/auth.service';
import type { SupportMessage, SupportTicket, TicketPriority, TicketStatus } from './support.types';

const mapTicket = (r: any): SupportTicket => ({
  id: String(r.id),
  ticketNumber: String(r.ticket_number || r.id)
    .slice(0, 12)
    .toUpperCase(),
  subject: String(r.subject || ''),
  category: String(r.category || 'general'),
  priority: r.priority === 'urgent' || r.priority === 'high' || r.priority === 'low' ? r.priority : 'normal',
  status: r.status === 'pending' || r.status === 'resolved' || r.status === 'closed' ? r.status : 'open',
  createdAt: String(r.created_at),
  updatedAt: String(r.updated_at ?? r.created_at),
});
const mapMessage = (r: any): SupportMessage => ({
  id: String(r.id),
  ticketId: String(r.ticket_id),
  body: String(r.body || ''),
  senderType: r.sender_type === 'agent' ? 'agent' : 'customer',
  createdAt: String(r.created_at),
});

export async function listMyTickets(): Promise<SupportTicket[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  if (!supabase)
    return [
      {
        id: 'demo-ticket',
        ticketNumber: 'MX-DEMO01',
        subject: 'راهنمای انتخاب گوشی',
        category: 'product',
        priority: 'normal',
        status: 'open',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  const { data, error } = await supabase
    .from('support_tickets')
    .select('id,ticket_number,subject,category,priority,status,created_at,updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw normalizeError(error);
  return (data ?? []).map(mapTicket);
}
export async function getTicket(
  ticketId: string,
): Promise<{ ticket: SupportTicket; messages: SupportMessage[] } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('support_tickets')
    .select('id,ticket_number,subject,category,priority,status,created_at,updated_at')
    .eq('id', ticketId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw normalizeError(error);
  if (!data) return null;
  const { data: messages, error: msgErr } = await supabase
    .from('support_messages')
    .select('id,ticket_id,body,sender_type,created_at')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
  if (msgErr) throw normalizeError(msgErr);
  return { ticket: mapTicket(data), messages: (messages ?? []).map(mapMessage) };
}
export async function createTicket(input: {
  subject: string;
  category: string;
  priority: TicketPriority;
  body: string;
}): Promise<SupportTicket> {
  const user = await getCurrentUser();
  if (!user) throw new Error('AUTH_REQUIRED');
  if (!supabase)
    return {
      id: `local-ticket-${Date.now()}`,
      ticketNumber: `MX-${Date.now().toString().slice(-6)}`,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  const { data, error } = await supabase.rpc('mx_create_support_ticket', {
    p_subject: input.subject.trim(),
    p_category: input.category,
    p_priority: input.priority,
    p_body: input.body.trim(),
  });
  if (error) throw normalizeError(error);
  return mapTicket(Array.isArray(data) ? data[0] : data);
}
export async function sendTicketMessage(ticketId: string, body: string): Promise<SupportMessage> {
  const user = await getCurrentUser();
  if (!user) throw new Error('AUTH_REQUIRED');
  if (!supabase)
    return {
      id: `local-msg-${Date.now()}`,
      ticketId,
      body,
      senderType: 'customer',
      createdAt: new Date().toISOString(),
    };
  const { data, error } = await supabase
    .from('support_messages')
    .insert({ ticket_id: ticketId, user_id: user.id, sender_type: 'customer', body: body.trim() })
    .select('id,ticket_id,body,sender_type,created_at')
    .single();
  if (error) throw normalizeError(error);
  return mapMessage(data);
}
export const supportStatusLabel = (status: TicketStatus, fa: boolean) =>
  status === 'open'
    ? fa
      ? 'باز'
      : 'Open'
    : status === 'pending'
      ? fa
        ? 'در انتظار پاسخ'
        : 'Pending'
      : status === 'resolved'
        ? fa
          ? 'حل‌شده'
          : 'Resolved'
        : fa
          ? 'بسته'
          : 'Closed';
