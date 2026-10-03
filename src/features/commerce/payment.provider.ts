import type { PaymentProvider, PaymentSession } from './payment.types';
import { AppError } from '@/lib/errors/app-error';
import { supabase } from '@/lib/supabase/client';

export const demoPaymentProvider: PaymentProvider = {
  async createSession(input): Promise<PaymentSession> {
    if (import.meta.env.PROD) {
      throw new AppError('CONFIGURATION', 'درگاه پرداخت آنلاین هنوز به provider واقعی متصل نشده است.');
    }
    return {
      provider: 'demo',
      paymentId: `demo_${crypto.randomUUID()}`,
      amount: input.amount,
      redirectUrl: `/order-confirmation?payment=demo&order=${encodeURIComponent(input.orderId)}`,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    };
  },
};

export async function createPaymentSession(input: Parameters<PaymentProvider['createSession']>[0]): Promise<PaymentSession> {
  if (!supabase) return demoPaymentProvider.createSession(input);

  const { data, error } = await supabase.functions.invoke('create-payment-session', {
    body: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      amount: input.amount,
      callbackUrl: input.callbackUrl,
    },
  });

  if (!error && data && typeof data === 'object' && typeof data.paymentId === 'string') {
    return {
      provider: String(data.provider || 'gateway'),
      paymentId: data.paymentId,
      amount: Number(data.amount || input.amount),
      redirectUrl: typeof data.redirectUrl === 'string' ? data.redirectUrl : undefined,
      expiresAt: typeof data.expiresAt === 'string' ? data.expiresAt : undefined,
    };
  }

  if (import.meta.env.PROD) {
    throw new AppError('CONFIGURATION', 'درگاه پرداخت سرور هنوز پیکربندی نشده است.');
  }
  return demoPaymentProvider.createSession(input);
}
