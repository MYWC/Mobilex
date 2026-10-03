import { supabase } from '@/lib/supabase/client';
import { AppError, normalizeError } from '@/lib/errors/app-error';
import { couponSchema } from './commerce.schema';
import { COMMERCE } from './commerce.constants';
import type { CouponState } from './commerce.types';

export interface CouponResult extends CouponState {
  minOrderAmount?: number;
  maxDiscountAmount?: number;
}

const demoCoupons: Record<string, { type: 'percent' | 'fixed'; value: number; minOrderAmount?: number; maxDiscountAmount?: number; description: string }> = {
  WELCOME10: { type: 'percent', value: 10, minOrderAmount: 1_000_000, maxDiscountAmount: 500_000, description: '۱۰٪ تخفیف برای اولین خرید' },
  MOBILEX: { type: 'fixed', value: 250_000, minOrderAmount: 2_000_000, description: '۲۵۰ هزار تومان تخفیف' },
};

function calculateLocalCoupon(code: string, subtotal: number): CouponResult {
  const item = demoCoupons[code];
  if (!item) return { valid: false, code, discount: 0, type: 'fixed', applied: false, validatedSubtotal: subtotal, validatedAt: new Date().toISOString() };
  if (item.minOrderAmount && subtotal < item.minOrderAmount) {
    return { valid: false, code, discount: 0, type: item.type, applied: false, validatedSubtotal: subtotal, validatedAt: new Date().toISOString(), minOrderAmount: item.minOrderAmount };
  }
  const raw = item.type === 'percent' ? Math.floor(subtotal * item.value / 100) : item.value;
  const discount = Math.min(subtotal, COMMERCE.maxCouponDiscount, item.maxDiscountAmount ? Math.min(raw, item.maxDiscountAmount) : raw);
  return { valid: true, code, type: item.type, discount, description: item.description, applied: true, validatedSubtotal: subtotal, validatedAt: new Date().toISOString(), maxDiscountAmount: item.maxDiscountAmount };
}

export async function validateCoupon(codeInput: string, subtotal: number, userId?: string): Promise<CouponResult> {
  const parsed = couponSchema.safeParse(codeInput.toUpperCase());
  if (!parsed.success) throw new AppError('VALIDATION', 'کد تخفیف نامعتبر است.');
  const code = parsed.data;

  if (!supabase) return calculateLocalCoupon(code, subtotal);

  try {
    const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('validate-coupon', {
      body: { code, subtotal, userId },
    });
    if (!edgeError && edgeResult && typeof edgeResult === 'object' && 'valid' in edgeResult) {
      const valid = Boolean((edgeResult as { valid?: boolean }).valid);
      return {
        valid,
        code,
        type: (edgeResult.type === 'percent' ? 'percent' : 'fixed'),
        discount: valid ? Math.min(subtotal, COMMERCE.maxCouponDiscount, Number(edgeResult.discount || 0)) : 0,
        description: typeof edgeResult.description === 'string' ? edgeResult.description : undefined,
        applied: valid,
        validatedSubtotal: subtotal,
        validatedAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('id,code,type,value,min_order_amount,max_discount_amount,starts_at,expires_at,is_active,usage_limit,used_count,description,first_order_only')
      .ilike('code', code)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { valid: false, code, type: 'fixed', discount: 0, applied: false, validatedSubtotal: subtotal, validatedAt: new Date().toISOString() };

    const now = Date.now();
    if (data.starts_at && Date.parse(data.starts_at) > now) return { valid: false, code, type: data.type, discount: 0, applied: false, validatedSubtotal: subtotal, validatedAt: new Date().toISOString() };
    if (data.expires_at && Date.parse(data.expires_at) < now) return { valid: false, code, type: data.type, discount: 0, applied: false, validatedSubtotal: subtotal, validatedAt: new Date().toISOString() };
    if (data.usage_limit != null && Number(data.used_count || 0) >= Number(data.usage_limit)) return { valid: false, code, type: data.type, discount: 0, applied: false, validatedSubtotal: subtotal, validatedAt: new Date().toISOString() };
    if (data.min_order_amount != null && subtotal < Number(data.min_order_amount)) return { valid: false, code, type: data.type, discount: 0, applied: false, validatedSubtotal: subtotal, validatedAt: new Date().toISOString(), minOrderAmount: Number(data.min_order_amount) };
    if (data.first_order_only && userId) {
      const { data: usage, error: usageError } = await supabase.from('coupon_usages').select('id').eq('coupon_id', data.id).eq('user_id', userId).maybeSingle();
      if (usageError) throw usageError;
      if (usage) return { valid: false, code, type: data.type, discount: 0, applied: false, validatedSubtotal: subtotal, validatedAt: new Date().toISOString() };
    }

    const raw = data.type === 'percent' ? Math.floor(subtotal * Number(data.value) / 100) : Number(data.value);
    const discount = Math.min(subtotal, COMMERCE.maxCouponDiscount, data.max_discount_amount == null ? raw : Math.min(raw, Number(data.max_discount_amount)));
    return {
      valid: true,
      code,
      type: data.type,
      discount,
      description: data.description ?? undefined,
      applied: true,
      validatedSubtotal: subtotal,
      validatedAt: new Date().toISOString(),
      minOrderAmount: data.min_order_amount == null ? undefined : Number(data.min_order_amount),
      maxDiscountAmount: data.max_discount_amount == null ? undefined : Number(data.max_discount_amount),
    };
  } catch (error) {
    throw normalizeError(error);
  }
}
