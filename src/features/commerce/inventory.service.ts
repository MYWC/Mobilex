import { supabase } from '@/lib/supabase/client';
import type { CartLine } from '@/features/cart/cart.types';
import type { InventoryValidationResult } from './commerce.types';
import { normalizeError } from '@/lib/errors/app-error';

const livePrice = (base: number, sale: number | null | undefined): number =>
  Number(sale) > 0 && Number(sale) < Number(base) ? Number(sale) : Number(base);

export async function validateInventory(lines: CartLine[]): Promise<InventoryValidationResult> {
  if (!lines.length) return { ok: false, items: [], errors: ['سبد خرید خالی است.'] };
  if (!supabase) {
    return {
      ok: lines.every((line) => line.quantity > 0),
      items: lines.map((line) => ({
        cartKey: line.cartKey,
        productId: line.id,
        variantId: line.variantId ?? null,
        requested: line.quantity,
        available: 99,
        unitPrice: line.price,
        isActive: true,
        priceChanged: false,
      })),
      errors: [],
    };
  }

  try {
    const ids = [...new Set(lines.map((line) => line.id))];
    const variantIds = [...new Set(lines.map((line) => line.variantId).filter((x): x is string => Boolean(x)))];
    const [products, variants] = await Promise.all([
      supabase.from('products').select('id,price,sale_price,stock,is_active').in('id', ids),
      variantIds.length
        ? supabase.from('product_variants').select('id,product_id,price,sale_price,stock,is_active').in('id', variantIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (products.error) throw products.error;
    if (variants.error) throw variants.error;

    const productMap = new Map((products.data ?? []).map((row) => [String(row.id), row]));
    const variantMap = new Map((variants.data ?? []).map((row) => [String(row.id), row]));

    const items = lines.map((line) => {
      const product = productMap.get(line.id);
      const variant = line.variantId ? variantMap.get(line.variantId) : null;
      const stock = Number(variant?.stock ?? product?.stock ?? 0);
      const isActive = Boolean((variant ? variant.is_active : product?.is_active) !== false);
      const base = Number(variant?.price ?? product?.price ?? line.price);
      const unitPrice = livePrice(base, variant?.sale_price ?? product?.sale_price);
      return {
        cartKey: line.cartKey,
        productId: line.id,
        variantId: line.variantId ?? null,
        requested: line.quantity,
        available: stock,
        unitPrice,
        isActive,
        priceChanged: Math.abs(unitPrice - Number(line.price)) > 0,
      };
    });

    const errors = items.flatMap((item) => {
      if (!item.isActive) return [`محصول ${item.productId} دیگر فعال نیست.`];
      if (item.available <= 0) return [`محصول ${item.productId} ناموجود است.`];
      if (item.requested > item.available) return [`موجودی محصول ${item.productId} فقط ${item.available} عدد است.`];
      if (item.priceChanged) return [`قیمت محصول ${item.productId} تغییر کرده است.`];
      return [];
    });

    return { ok: errors.length === 0, items, errors };
  } catch (error) {
    const normalized = normalizeError(error);
    return { ok: false, items: [], errors: [normalized.message] };
  }
}
