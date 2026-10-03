import { supabase } from '@/lib/supabase/client';
import type { BrandSummary, CatalogFilters, CatalogOptions, CatalogProduct, CatalogResult, CategorySummary, ProductImage, ProductVariant } from '@/types/catalog';
import { demoProducts } from '@/features/catalog/demo-products';
import { AppError, normalizeError } from '@/lib/errors/app-error';
import { MemoryCache } from '@/lib/cache/memory-cache';
import { appEnv } from '@/app/config/env';

const num = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const productCache = new MemoryCache<CatalogProduct[]>(4);
const facetsCache = new MemoryCache<{brands:BrandSummary[];categories:CategorySummary[]}>(2);
const productCacheKey = (includeInactive?: boolean) => `products:${Boolean(includeInactive)}`;

function mapBrand(raw: any): BrandSummary | undefined {
  if (!raw) return undefined;
  return { id:String(raw.id), nameFa:raw.name_fa, nameEn:raw.name_en, slug:raw.slug, logoUrl:raw.logo_url };
}
function mapCategory(raw: any): CategorySummary | undefined {
  if (!raw) return undefined;
  return { id:String(raw.id), nameFa:raw.name_fa, nameEn:raw.name_en, slug:raw.slug, imageUrl:raw.image_url };
}
function mapProduct(raw: any): CatalogProduct {
  const images = Array.isArray(raw.product_images) ? [...raw.product_images].sort((a,b)=>num(a.sort_order)-num(b.sort_order)).map((i:any):ProductImage=>({id:i.id,url:i.url,altFa:i.alt_fa,altEn:i.alt_en,isMain:Boolean(i.is_main),sortOrder:num(i.sort_order)})) : [];
  const variants = Array.isArray(raw.product_variants) ? raw.product_variants.map((v:any):ProductVariant=>({id:String(v.id),sku:v.sku,label:v.label,color:v.color,colorCode:v.color_code,storage:v.storage,ram:v.ram,price:v.price==null?undefined:num(v.price),salePrice:v.sale_price==null?undefined:num(v.sale_price),stock:num(v.stock),isDefault:Boolean(v.is_default),metadata:v.metadata})):[];
  return {
    id:String(raw.id), slug:String(raw.slug || raw.id), sku:raw.sku, nameFa:raw.name_fa || raw.name || 'محصول', nameEn:raw.name_en,
    descriptionFa:raw.description_fa, descriptionEn:raw.description_en, price:num(raw.price), salePrice:raw.sale_price==null?undefined:num(raw.sale_price), stock:num(raw.stock),
    isActive:raw.is_active !== false, featured:Boolean(raw.featured), isNew:Boolean(raw.is_new), isBestSeller:Boolean(raw.is_best_seller), createdAt:raw.created_at,
    brand:mapBrand(raw.brand || raw.brands), category:mapCategory(raw.category || raw.categories), images, variants,
    review:{rating:num(raw.rating,4.5),count:num(raw.review_count)}, specs:raw.specs && typeof raw.specs==='object' ? raw.specs : undefined,
    tags:Array.isArray(raw.tags)?raw.tags:[],
  };
}

function applyFilters(products: CatalogProduct[], filters: CatalogFilters): CatalogProduct[] {
  const q = filters.query.trim().toLocaleLowerCase();
  return products.filter((p) => {
    if (!p.isActive) return false;
    if (q) {
      const hay = [p.nameFa,p.nameEn,p.slug,p.sku,p.brand?.nameFa,p.brand?.nameEn,p.category?.nameFa,p.category?.nameEn,...(p.tags||[])].filter(Boolean).join(' ').toLocaleLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.brandIds.length && !filters.brandIds.includes(p.brand?.id || '')) return false;
    if (filters.categoryIds.length && !filters.categoryIds.includes(p.category?.id || '')) return false;
    const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;
    if (filters.minPrice != null && price < filters.minPrice) return false;
    if (filters.maxPrice != null && price > filters.maxPrice) return false;
    if (filters.ratings.length && !filters.ratings.some(r => p.review.rating >= r)) return false;
    if (filters.onlyInStock && p.stock <= 0) return false;
    if (filters.onlyDiscounted && !(p.salePrice && p.salePrice < p.price)) return false;
    if (filters.onlyNew && !p.isNew) return false;
    return true;
  });
}

function sortProducts(products: CatalogProduct[], filters: CatalogFilters): CatalogProduct[] {
  const copy = [...products];
  const price = (p:CatalogProduct) => p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
  switch (filters.sort) {
    case 'newest': return copy.sort((a,b)=>(Date.parse(b.createdAt||'0')||0)-(Date.parse(a.createdAt||'0')||0));
    case 'price_asc': return copy.sort((a,b)=>price(a)-price(b));
    case 'price_desc': return copy.sort((a,b)=>price(b)-price(a));
    case 'rating': return copy.sort((a,b)=>b.review.rating-a.review.rating);
    case 'discount': return copy.sort((a,b)=>((b.price-(b.salePrice||b.price))/b.price)-((a.price-(a.salePrice||a.price))/a.price));
    case 'relevance':
    default: return copy.sort((a,b)=>Number(b.featured)-Number(a.featured) || Number(b.isBestSeller)-Number(a.isBestSeller) || b.review.rating-a.review.rating);
  }
}

async function fetchSupabaseProducts(options?: CatalogOptions): Promise<CatalogProduct[]> {
  if (!supabase) {
    if (appEnv.allowDemoMode) return demoProducts;
    throw new AppError('CONFIGURATION', 'Supabase is required in production.', { status: 503 });
  }
  const query = supabase.from('products').select(`
    id, slug, sku, name_fa, name_en, description_fa, description_en, price, sale_price, stock, is_active, featured, is_new, is_best_seller, created_at, rating, review_count, specs, tags,
    brand:brands(id,name_fa,name_en,slug,logo_url),
    category:categories(id,name_fa,name_en,slug,image_url),
    product_images(id,url,is_main,sort_order,alt_fa,alt_en),
    product_variants(id,sku,label,color,color_code,storage,ram,price,sale_price,stock,is_default,metadata)
  `);
  const { data, error } = options?.includeInactive ? await query : await query.eq('is_active', true);
  if (error) throw new AppError('DATABASE', error.message, { cause:error, retryable:true, details:{code:error.code} });
  return (data || []).map(mapProduct);
}

export async function listProducts(filters: CatalogFilters, options?: CatalogOptions): Promise<CatalogResult> {
  try {
    const key = productCacheKey(options?.includeInactive);
    let products = productCache.get(key);
    if (!products) {
      products = await fetchSupabaseProducts(options);
      if (supabase) productCache.set(key, products, { ttlMs: 60_000 });
    }
    const filtered = sortProducts(applyFilters(products, filters), filters);
    const page = Math.max(1, filters.page);
    const start = (page - 1) * filters.pageSize;
    return { products: filtered.slice(start, start + filters.pageSize), total:filtered.length, availableMinPrice:Math.min(...products.map(p => p.salePrice && p.salePrice<p.price ? p.salePrice:p.price)), availableMaxPrice:Math.max(...products.map(p => p.price)) };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getProductBySlug(slug: string, options?: CatalogOptions): Promise<CatalogProduct | null> {
  try {
    if (supabase) {
      const cached = productCache.get(`product:${slug}`);
      if (cached) return cached.find((p) => p.slug === slug) ?? null;
      const { data, error } = await supabase.from('products').select(`
        id, slug, sku, name_fa, name_en, description_fa, description_en, price, sale_price, stock, is_active, featured, is_new, is_best_seller, created_at, rating, review_count, specs, tags,
        brand:brands(id,name_fa,name_en,slug,logo_url), category:categories(id,name_fa,name_en,slug,image_url),
        product_images(id,url,is_main,sort_order,alt_fa,alt_en), product_variants(id,sku,label,color,color_code,storage,ram,price,sale_price,stock,is_default,metadata)
      `).eq('slug', slug).maybeSingle();
      if (error) throw normalizeError(error);
      if (data) { const mapped = mapProduct(data); productCache.set(`product:${slug}`, [mapped], { ttlMs: 300_000 }); return mapped; }
      return null;
    }
    if (!appEnv.allowDemoMode) throw new AppError('CONFIGURATION', 'Supabase is required in production.', { status: 503 });
    return demoProducts.find(p => p.slug === slug) || null;
  } catch (error) { throw normalizeError(error); }
}


export async function getProductById(id: string): Promise<CatalogProduct | null> {
  const key = `product:id:${id}`;
  if (supabase) {
    const cached = productCache.get(key);
    if (cached) return cached[0] ?? null;
    try {
      const { data, error } = await supabase.from('products').select(`
        id, slug, sku, name_fa, name_en, description_fa, description_en, price, sale_price, stock, is_active, featured, is_new, is_best_seller, created_at, rating, review_count, specs, tags,
        brand:brands(id,name_fa,name_en,slug,logo_url), category:categories(id,name_fa,name_en,slug,image_url),
        product_images(id,url,is_main,sort_order,alt_fa,alt_en), product_variants(id,sku,label,color,color_code,storage,ram,price,sale_price,stock,is_default,metadata)
      `).eq('id', id).maybeSingle();
      if (error) throw normalizeError(error);
      if (!data) return null;
      const product = mapProduct(data);
      productCache.set(key, [product], { ttlMs: 300_000 });
      return product;
    } catch (error) { throw normalizeError(error); }
  }
  if (!appEnv.allowDemoMode) throw new AppError('CONFIGURATION', 'Supabase is required in production.', { status: 503 });
  return demoProducts.find((p) => p.id === id) ?? null;
}

export async function getCatalogFacets(): Promise<{brands:BrandSummary[];categories:CategorySummary[]}> {
  const cached = facetsCache.get('all'); if (cached) return cached;
  if (!supabase) {
    if (!appEnv.allowDemoMode) throw new AppError('CONFIGURATION', 'Supabase is required in production.', { status: 503 });
    const brands = Array.from(new Map(demoProducts.filter(p=>p.brand).map(p=>[p.brand!.id,p.brand!])).values());
    const categories = Array.from(new Map(demoProducts.filter(p=>p.category).map(p=>[p.category!.id,p.category!])).values());
    const value = { brands, categories }; facetsCache.set('all', value, { ttlMs: 600_000 }); return value;
  }
  const [brandsRes, categoriesRes] = await Promise.all([
    supabase.from('brands').select('id,name_fa,name_en,slug,logo_url').order('name_fa'),
    supabase.from('categories').select('id,name_fa,name_en,slug,image_url').order('name_fa'),
  ]);
  if (brandsRes.error) throw normalizeError(brandsRes.error);
  if (categoriesRes.error) throw normalizeError(categoriesRes.error);
  const value = { brands:(brandsRes.data||[]).map(mapBrand).filter(Boolean) as BrandSummary[], categories:(categoriesRes.data||[]).map(mapCategory).filter(Boolean) as CategorySummary[] };
  facetsCache.set('all', value, { ttlMs: 600_000 });
  return value;
}

export async function getFeaturedProducts(): Promise<CatalogProduct[]> {
  if (!supabase) {
    if (appEnv.allowDemoMode) return demoProducts.filter(p=>p.featured);
    throw new AppError('CONFIGURATION', 'Supabase is required in production.', { status: 503 });
  }
  const result = await listProducts({query:'',brandIds:[],categoryIds:[],ratings:[],onlyInStock:false,onlyDiscounted:false,onlyNew:false,sort:'relevance',page:1,pageSize:12});
  return result.products.filter(p=>p.featured || p.isBestSeller);
}

export function getDemoProducts(): CatalogProduct[] { return demoProducts; }
