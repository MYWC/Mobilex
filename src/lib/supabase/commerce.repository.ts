import { requireSupabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import type { CommerceAddress, OrderSnapshot } from '@/features/commerce/commerce.types';

const mapAddress = (row: any): CommerceAddress => ({
  id: String(row.id), title: row.title, recipientName: row.recipient_name, phone: row.phone,
  province: row.province, city: row.city, postalCode: row.postal_code, addressLine: row.address_line,
  plaque: row.plaque ?? undefined, unit: row.unit ?? undefined, notes: row.notes ?? undefined,
  isDefault: Boolean(row.is_default),
});

export async function listUserAddresses(userId: string): Promise<CommerceAddress[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.from('addresses')
      .select('id,title,recipient_name,phone,province,city,postal_code,address_line,plaque,unit,notes,is_default')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapAddress);
  } catch (error) { throw normalizeError(error); }
}

export async function saveUserAddress(userId: string, address: CommerceAddress): Promise<CommerceAddress> {
  try {
    const client = requireSupabase();
    if (address.isDefault) await client.from('addresses').update({ is_default: false }).eq('user_id', userId);
    const payload = {
      user_id: userId, title: address.title, recipient_name: address.recipientName, phone: address.phone,
      province: address.province, city: address.city, postal_code: address.postalCode, address_line: address.addressLine,
      plaque: address.plaque ?? null, unit: address.unit ?? null, notes: address.notes ?? null,
      is_default: Boolean(address.isDefault), updated_at: new Date().toISOString(),
    };
    const query = address.id
      ? await client.from('addresses').update(payload).eq('id', address.id).eq('user_id', userId).select('*').single()
      : await client.from('addresses').insert(payload).select('*').single();
    if (query.error) throw query.error;
    return mapAddress(query.data);
  } catch (error) { throw normalizeError(error); }
}

export async function deleteUserAddress(userId: string, addressId: string): Promise<void> {
  try {
    const client = requireSupabase();
    const { error } = await client.from('addresses').delete().eq('id', addressId).eq('user_id', userId);
    if (error) throw error;
  } catch (error) { throw normalizeError(error); }
}

export async function getUserOrder(orderId: string): Promise<OrderSnapshot | null> {
  try {
    const client = requireSupabase();
    const { data: order, error } = await client.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (error) throw error;
    if (!order) return null;
    const { data: items, error: itemError } = await client.from('order_items').select('*').eq('order_id', orderId).order('created_at');
    if (itemError) throw itemError;
    return {
      id: String(order.id), orderNumber: order.order_number, status: order.status, paymentStatus: order.payment_status,
      paymentMethod: order.payment_method, shippingMethod: order.shipping_method, recipientName: order.recipient_name,
      phone: order.phone, province: order.province, city: order.city, postalCode: order.postal_code,
      addressLine: order.address_line, plaque: order.plaque ?? undefined, unit: order.unit ?? undefined,
      notes: order.notes ?? undefined, subtotal: Number(order.subtotal), itemDiscount: Number(order.item_discount),
      couponDiscount: Number(order.coupon_discount), shippingAmount: Number(order.shipping_amount), taxAmount: Number(order.tax_amount),
      totalAmount: Number(order.total_amount), couponCode: order.coupon_code ?? undefined,
      createdAt: order.created_at, updatedAt: order.updated_at,
      items: (items ?? []).map((item: any) => ({
        id: String(item.id), productId: String(item.product_id), variantId: item.variant_id ? String(item.variant_id) : null,
        productName: item.product_name ?? '', variantLabel: item.variant_label ?? undefined, sku: item.sku ?? undefined,
        quantity: Number(item.quantity), unitPrice: Number(item.unit_price), compareAtPrice: item.compare_at_price == null ? undefined : Number(item.compare_at_price),
        lineTotal: Number(item.line_total),
      })),
    };
  } catch (error) { throw normalizeError(error); }
}
