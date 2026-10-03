import type { CatalogProduct } from '@/types/catalog';
import { getDemoProducts, listProducts } from '@/services/catalog/catalog.service';
import { useRecentStore } from '@/features/catalog/recent.store';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';

function score(base: CatalogProduct, candidate: CatalogProduct, affinityIds: Set<string>): number {
  if (base.id === candidate.id) return -999;
  let value = 0;
  if (base.category?.id && base.category.id === candidate.category?.id) value += 40;
  if (base.brand?.id && base.brand.id === candidate.brand?.id) value += 25;
  if (candidate.isBestSeller) value += 12;
  if (candidate.isNew) value += 8;
  if (candidate.featured) value += 7;
  value += Math.min(10, Math.max(0, candidate.review.rating * 2));
  if (candidate.stock > 0) value += 5;
  if (affinityIds.has(candidate.id)) value += 30;
  return value;
}

export async function getRecommendations(
  input: { base?: CatalogProduct; limit?: number; excludeIds?: string[] } = {},
): Promise<CatalogProduct[]> {
  const limit = Math.min(16, Math.max(4, input.limit ?? 8));
  const exclude = new Set(input.excludeIds ?? []);
  const affinityIds = new Set([...useRecentStore.getState().ids, ...useWishlistStore.getState().ids]);
  let pool: CatalogProduct[] = [];
  try {
    if (input.base) {
      const result = await listProducts({
        query: '',
        brandIds: input.base.brand?.id ? [input.base.brand.id] : [],
        categoryIds: input.base.category?.id ? [input.base.category.id] : [],
        ratings: [],
        onlyInStock: true,
        onlyDiscounted: false,
        onlyNew: false,
        sort: 'relevance',
        page: 1,
        pageSize: 48,
      });
      pool = result.products;
    }
  } catch {
    /* fallback below */
  }
  if (!pool.length) pool = getDemoProducts();
  return pool
    .filter((p) => !exclude.has(p.id))
    .sort((a, b) => {
      const sa = input.base
        ? score(input.base, a, affinityIds)
        : (Number(b.isBestSeller) - Number(a.isBestSeller)) * 10 + b.review.rating - a.review.rating;
      const sb = input.base
        ? score(input.base, b, affinityIds)
        : (Number(a.isBestSeller) - Number(b.isBestSeller)) * 10 + a.review.rating - b.review.rating;
      return sb - sa;
    })
    .slice(0, limit);
}

export async function getPersonalizedRecommendations(limit = 8): Promise<CatalogProduct[]> {
  const recent = useRecentStore.getState().ids;
  const wishlist = useWishlistStore.getState().ids;
  const seeds = [...new Set([...recent, ...wishlist])];
  const products = getDemoProducts();
  const seed = products.find((p) => p.id === seeds[0]);
  return getRecommendations({ base: seed, limit, excludeIds: seeds });
}
