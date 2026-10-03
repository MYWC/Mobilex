import { AppError, normalizeError } from '@/lib/errors/app-error';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/services/auth/auth.service';
import type { CheckoutSnapshot, CreateOrderResult } from './commerce.types';
import { calculatePricing } from './pricing';
import { getShippingOption } from './shipping.service';
import { createPaymentSession } from './payment.provider';
import { COMMERCE } from './commerce.constants';
import { addressSchema } from './commerce.schema';
import { resolveAppUrl } from '@/lib/ux/paths';

export async function buildCheckoutSnapshot(input: {
  items: CheckoutSnapshot['items'];
  address: CheckoutSnapshot['address'];
  shippingMethod: CheckoutSnapshot['shippingMethod'];
  paymentMethod: CheckoutSnapshot['paymentMethod'];
  coupon?: { discount: number; code: string } | null;
  idempotencyKey: string;
}): Promise<CheckoutSnapshot> {
  if (!input.items.length) throw new AppError('VALIDATION', 'سبد خرید خالی است.');
  if (!input.address) throw new AppError('VALIDATION', 'آدرس دریافت انتخاب نشده است.');
  if (!addressSchema.safeParse(input.address).success)
    throw new AppError('VALIDATION', 'اطلاعات آدرس معتبر نیست.');
  if (!input.idempotencyKey) throw new AppError('VALIDATION', 'شناسه تلاش برای سفارش وجود ندارد.');
  const pricing = calculatePricing({
    lines: input.items,
    couponDiscount: input.coupon?.discount,
    shipping: getShippingOption(input.shippingMethod),
  });
  return {
    items: input.items,
    address: input.address,
    shippingMethod: input.shippingMethod,
    paymentMethod: input.paymentMethod,
    couponCode: input.coupon?.code,
    pricing,
    idempotencyKey: input.idempotencyKey,
  };
}

export async function createOrder(snapshot: CheckoutSnapshot): Promise<CreateOrderResult> {
  if (!snapshot.items.length || !snapshot.address)
    throw new AppError('VALIDATION', 'اطلاعات سفارش کامل نیست.');

  if (!supabase) {
    const orderId = crypto.randomUUID();
    const orderNumber = `MX-${Date.now().toString().slice(-8)}`;
    const createdAt = new Date().toISOString();
    localStorage.setItem(
      COMMERCE.lastOrderKey,
      JSON.stringify({ orderId, orderNumber, createdAt, snapshot }),
    );
    return {
      orderId,
      orderNumber,
      status: snapshot.paymentMethod === 'online' ? 'pending_payment' : 'processing',
      paymentRequired: snapshot.paymentMethod === 'online',
      paymentStatus: snapshot.paymentMethod === 'online' ? 'pending' : 'unpaid',
      totalAmount: snapshot.pricing.payableTotal,
    };
  }

  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError('AUTH_REQUIRED', 'برای ثبت سفارش باید وارد حساب شوید.', { status: 401 });

    const payload = {
      idempotency_key: snapshot.idempotencyKey,
      items: snapshot.items.map((item) => ({
        cart_key: item.cartKey,
        product_id: item.id,
        variant_id: item.variantId ?? null,
        quantity: item.quantity,
      })),
      address: snapshot.address,
      shipping_method: snapshot.shippingMethod,
      payment_method: snapshot.paymentMethod,
      coupon_code: snapshot.couponCode ?? null,
    };

    const { data, error } = await supabase.rpc('mx_create_order', { p_payload: payload });
    if (error) throw error;
    const result = data as Record<string, unknown>;

    const base: CreateOrderResult = {
      orderId: String(result.order_id),
      orderNumber: String(result.order_number),
      status: String(result.status) as CreateOrderResult['status'],
      paymentRequired: Boolean(result.payment_required),
      paymentStatus: String(
        result.payment_status || (snapshot.paymentMethod === 'online' ? 'pending' : 'unpaid'),
      ) as CreateOrderResult['paymentStatus'],
      totalAmount: Number(result.total_amount || snapshot.pricing.payableTotal),
      idempotent: Boolean(result.idempotent),
      reservationExpiresAt:
        typeof result.reservation_expires_at === 'string' ? result.reservation_expires_at : undefined,
    };

    if (base.paymentRequired) {
      const session = await createPaymentSession({
        orderId: base.orderId,
        orderNumber: base.orderNumber,
        amount: base.totalAmount,
        callbackUrl: `${resolveAppUrl('/order-confirmation')}?order=${encodeURIComponent(base.orderId)}`,
      });
      return { ...base, paymentId: session.paymentId, redirectUrl: session.redirectUrl };
    }

    return base;
  } catch (error) {
    throw normalizeError(error);
  }
}
