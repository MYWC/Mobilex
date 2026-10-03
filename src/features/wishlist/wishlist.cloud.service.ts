import { supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import type { WishlistItemRecord } from './wishlist.types';

export async function listCloudWishlist(userId: string): Promise<WishlistItemRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('id,product_id,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw normalizeError(error);
  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    productId: String(row.product_id),
    createdAt: String(row.created_at),
  }));
}

export async function addCloudWishlist(userId: string, productId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('wishlist_items')
    .upsert(
      { user_id: userId, product_id: productId },
      { onConflict: 'user_id,product_id', ignoreDuplicates: true },
    );
  if (error) throw normalizeError(error);
}

export async function removeCloudWishlist(userId: string, productId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw normalizeError(error);
}

export async function clearCloudWishlist(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('wishlist_items').delete().eq('user_id', userId);
  if (error) throw normalizeError(error);
}
