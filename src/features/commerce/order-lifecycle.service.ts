import { supabase } from '@/lib/supabase/client';
import { AppError, normalizeError } from '@/lib/errors/app-error';

export async function cancelOrder(orderId: string): Promise<boolean> {
  if (!supabase) {
    const raw = localStorage.getItem('mobilex.last-order.v2');
    if (!raw) return false;
    try {
      const data = JSON.parse(raw) as { orderId?: string };
      return data.orderId === orderId;
    } catch {
      return false;
    }
  }
  try {
    const { data, error } = await supabase.rpc('mx_cancel_order', { p_order_id: orderId });
    if (error) throw error;
    return Boolean(data);
  } catch (error) {
    throw normalizeError(error);
  }
}

export function assertOnlineForPayment(online: boolean): void {
  if (!online) throw new AppError('NETWORK', 'برای پرداخت آنلاین اتصال اینترنت لازم است.');
}
