import type { AdminOrderStatus, AdminPaymentStatus } from '@/types/admin';

export function orderStatusLabel(status: AdminOrderStatus, locale: 'fa' | 'en' = 'fa'): string {
  const fa: Record<AdminOrderStatus, string> = {
    pending_payment: 'در انتظار پرداخت',
    processing: 'در حال پردازش',
    paid: 'پرداخت‌شده',
    packed: 'بسته‌بندی‌شده',
    shipped: 'ارسال‌شده',
    delivered: 'تحویل‌شده',
    cancelled: 'لغوشده',
    returned: 'مرجوع‌شده',
  };
  const en: Record<AdminOrderStatus, string> = {
    pending_payment: 'Pending payment',
    processing: 'Processing',
    paid: 'Paid',
    packed: 'Packed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };
  return (locale === 'en' ? en : fa)[status];
}

export function paymentStatusLabel(status: AdminPaymentStatus, locale: 'fa' | 'en' = 'fa'): string {
  const fa: Record<AdminPaymentStatus, string> = {
    pending: 'در انتظار',
    unpaid: 'پرداخت‌نشده',
    paid: 'پرداخت موفق',
    failed: 'ناموفق',
    cancelled: 'لغوشده',
    refunded: 'بازپرداخت‌شده',
  };
  const en: Record<AdminPaymentStatus, string> = {
    pending: 'Pending',
    unpaid: 'Unpaid',
    paid: 'Paid',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return (locale === 'en' ? en : fa)[status];
}

export function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (['paid', 'delivered', 'success'].includes(status)) return 'success';
  if (['cancelled', 'returned', 'failed', 'danger'].includes(status)) return 'danger';
  if (['pending_payment', 'processing', 'pending', 'unpaid', 'warning'].includes(status)) return 'warning';
  return 'info';
}
