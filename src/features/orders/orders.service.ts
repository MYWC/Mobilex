import { supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import type { CartLine } from '@/features/cart/cart.types';
import type { OrderSnapshot } from '@/features/commerce/commerce.types';
import type { OrderDetailResult, OrderEventItem, OrderListItem, OrdersPageResult } from './orders.types';
import { getUserOrder } from '@/lib/supabase/commerce.repository';
import { getCurrentUser } from '@/services/auth/auth.service';
import { useCartStore } from '@/features/cart/cart.store';

const mapOrder = (row: any, itemCount: number): OrderListItem => ({
  id: String(row.id),
  orderNumber: String(row.order_number),
  status: row.status,
  paymentStatus: row.payment_status,
  totalAmount: Number(row.total_amount),
  itemCount,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  shippingMethod: row.shipping_method,
  paymentMethod: row.payment_method,
});

export async function listMyOrders(
  input: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    from?: string;
    to?: string;
  } = {},
): Promise<OrdersPageResult> {
  const user = await getCurrentUser();
  if (!user) return { items: [], total: 0, page: 1, pageSize: 20 };
  if (!supabase) return { items: [], total: 0, page: 1, pageSize: 20 };
  try {
    const page = Math.max(1, input.page ?? 1),
      pageSize = Math.min(50, Math.max(5, input.pageSize ?? 12));
    const from = (page - 1) * pageSize,
      to = from + pageSize - 1;
    let q = supabase
      .from('orders')
      .select(
        'id,order_number,status,payment_status,total_amount,created_at,updated_at,shipping_method,payment_method,order_items(count)',
        { count: 'exact' },
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (input.status) q = q.eq('status', input.status);
    if (input.from) q = q.gte('created_at', input.from);
    if (input.to) q = q.lte('created_at', input.to);
    if (input.search) q = q.ilike('order_number', `%${input.search.replace(/[%_]/g, '')}%`);
    const { data, error, count } = await q;
    if (error) throw error;
    const items = (data ?? []).map((row: any) => mapOrder(row, Number(row.order_items?.[0]?.count ?? 0)));
    return { items, total: count ?? items.length, page, pageSize };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getOrderDetail(orderId: string): Promise<OrderDetailResult | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const order = (await getUserOrder(orderId)) as OrderSnapshot | null;
  if (!order) return null;
  let events: OrderEventItem[] = [];
  if (supabase) {
    const { data, error } = await supabase
      .from('order_events')
      .select('id,order_id,event_type,message,created_at,metadata')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    if (!error)
      events = (data ?? []).map((r: any) => ({
        id: String(r.id),
        orderId: String(r.order_id),
        eventType: String(r.event_type),
        message: r.message ?? undefined,
        createdAt: String(r.created_at),
        metadata: r.metadata ?? undefined,
      }));
  }
  return { order, events };
}

export async function cancelMyOrder(orderId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('mx_cancel_order', { p_order_id: orderId });
  if (error) throw normalizeError(error);
  return Boolean(data);
}

export async function reorderOrder(
  order: OrderSnapshot,
): Promise<{ added: number; skipped: number; unavailable: number }> {
  const cart = useCartStore.getState();
  let added = 0,
    skipped = 0,
    unavailable = 0;
  if (!supabase) return { added: 0, skipped: order.items.length, unavailable: 0 };
  const productIds = [...new Set(order.items.map((x) => x.productId))];
  const { data: products, error } = await supabase
    .from('products')
    .select(
      'id,name_fa,name_en,slug,price,sale_price,stock,product_images(id,url,is_main,sort_order),product_variants(id,product_id,label,price,sale_price,stock,is_active,sku)',
    )
    .in('id', productIds);
  if (error) throw normalizeError(error);
  for (const item of order.items) {
    const p = (products ?? []).find((x: any) => String(x.id) === String(item.productId)) as any;
    if (!p) {
      unavailable++;
      continue;
    }
    const v = item.variantId
      ? (p.product_variants ?? []).find((x: any) => String(x.id) === String(item.variantId))
      : null;
    const stock = Number(v?.stock ?? p.stock ?? 0);
    if (stock <= 0) {
      unavailable++;
      continue;
    }
    const basePrice = Number(v?.price ?? p.price ?? 0);
    const salePrice = Number(v?.sale_price ?? p.sale_price ?? 0);
    const price = salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
    const image = (p.product_images ?? []).sort(
      (a: any, b: any) =>
        Number(Boolean(b.is_main)) - Number(Boolean(a.is_main)) ||
        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
    )[0]?.url;
    const line: CartLine = {
      cartKey: `${p.id}:${v?.id ?? 'default'}`,
      id: String(p.id),
      variantId: v ? String(v.id) : null,
      variantLabel: v?.label ?? '',
      name_fa: p.name_fa,
      name_en: p.name_en,
      slug: p.slug,
      price,
      compareAtPrice: Number(v?.price ?? p.price ?? price),
      quantity: Math.min(item.quantity, stock),
      image,
      maxQuantity: Math.min(99, stock),
    };
    const before = cart.items.length;
    cart.add(line);
    if (cart.items.length > before || cart.items.some((x) => x.cartKey === line.cartKey)) {
      added++;
    } else {
      skipped++;
    }
  }
  return { added, skipped, unavailable };
}
