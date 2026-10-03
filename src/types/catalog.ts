export type ProductStockState = 'in_stock' | 'low_stock' | 'out_of_stock' | 'inactive';
export type ProductSort = 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'discount';

export interface BrandSummary {
  id: string;
  nameFa?: string;
  nameEn?: string;
  slug?: string;
  logoUrl?: string;
}

export interface CategorySummary {
  id: string;
  nameFa?: string;
  nameEn?: string;
  slug?: string;
  imageUrl?: string;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  label?: string;
  color?: string;
  colorCode?: string;
  storage?: string;
  ram?: string;
  price?: number;
  salePrice?: number;
  stock: number;
  isDefault?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ProductImage {
  id?: string;
  url: string;
  altFa?: string;
  altEn?: string;
  isMain?: boolean;
  sortOrder?: number;
}

export interface ProductReviewSummary {
  rating: number;
  count: number;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  sku?: string;
  nameFa: string;
  nameEn?: string;
  descriptionFa?: string;
  descriptionEn?: string;
  price: number;
  salePrice?: number;
  stock: number;
  isActive: boolean;
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  createdAt?: string;
  brand?: BrandSummary;
  category?: CategorySummary;
  images: ProductImage[];
  variants: ProductVariant[];
  review: ProductReviewSummary;
  specs?: Record<string, string>;
  tags?: string[];
}

export interface CatalogFilters {
  query: string;
  brandIds: string[];
  categoryIds: string[];
  minPrice?: number;
  maxPrice?: number;
  ratings: number[];
  onlyInStock: boolean;
  onlyDiscounted: boolean;
  onlyNew: boolean;
  sort: ProductSort;
  page: number;
  pageSize: number;
}

export interface CatalogResult {
  products: CatalogProduct[];
  total: number;
  availableMinPrice: number;
  availableMaxPrice: number;
}

export interface CatalogOptions {
  includeInactive?: boolean;
  signal?: AbortSignal;
}
