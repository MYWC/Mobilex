import { create } from 'zustand';
import type {
  BrandSummary,
  CatalogFilters,
  CatalogProduct,
  CategorySummary,
  ProductSort,
} from '@/types/catalog';
import { listProducts, getCatalogFacets } from '@/services/catalog/catalog.service';
import { useAppStore } from '@/stores/useAppStore';

const defaults: CatalogFilters = {
  query: '',
  brandIds: [],
  categoryIds: [],
  ratings: [],
  onlyInStock: false,
  onlyDiscounted: false,
  onlyNew: false,
  sort: 'relevance',
  page: 1,
  pageSize: 12,
};
interface CatalogState {
  filters: CatalogFilters;
  products: CatalogProduct[];
  total: number;
  availableMinPrice: number;
  availableMaxPrice: number;
  brands: BrandSummary[];
  categories: CategorySummary[];
  loading: boolean;
  facetsLoading: boolean;
  error: string | null;
  hydrated: boolean;
  setQuery: (query: string) => void;
  setSort: (sort: ProductSort) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setPriceRange: (minPrice?: number, maxPrice?: number) => void;
  toggleBrand: (id: string) => void;
  toggleCategory: (id: string) => void;
  toggleRating: (rating: number) => void;
  setBooleanFilter: (key: 'onlyInStock' | 'onlyDiscounted' | 'onlyNew', value: boolean) => void;
  clearFilters: () => void;
  hydrateFromUrl: (params: URLSearchParams) => void;
  load: () => Promise<void>;
  view: 'grid' | 'list';
  setView: (view: 'grid' | 'list') => void;
  loadFacets: () => Promise<void>;
}
const hasId = <T>(arr: T[], id: T): T[] => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
export const useCatalogStore = create<CatalogState>((set, get) => ({
  filters: { ...defaults },
  view: 'grid',
  products: [],
  total: 0,
  availableMinPrice: 0,
  availableMaxPrice: 0,
  brands: [],
  categories: [],
  loading: false,
  facetsLoading: false,
  error: null,
  hydrated: false,
  setQuery: (query) => set({ filters: { ...get().filters, query, page: 1 } }),
  setSort: (sort) => set({ filters: { ...get().filters, sort, page: 1 } }),
  setPage: (page) => set({ filters: { ...get().filters, page: Math.max(1, page) } }),
  setPageSize: (pageSize) =>
    set({ filters: { ...get().filters, pageSize: Math.max(6, Math.min(48, pageSize)), page: 1 } }),
  setPriceRange: (minPrice, maxPrice) => set({ filters: { ...get().filters, minPrice, maxPrice, page: 1 } }),
  toggleBrand: (id) =>
    set({ filters: { ...get().filters, brandIds: hasId(get().filters.brandIds, id), page: 1 } }),
  toggleCategory: (id) =>
    set({ filters: { ...get().filters, categoryIds: hasId(get().filters.categoryIds, id), page: 1 } }),
  toggleRating: (rating) =>
    set({ filters: { ...get().filters, ratings: hasId(get().filters.ratings, rating), page: 1 } }),
  setBooleanFilter: (key, value) => set({ filters: { ...get().filters, [key]: value, page: 1 } }),
  clearFilters: () => set({ filters: { ...defaults, pageSize: get().filters.pageSize } }),
  setView: (view) => set({ view }),
  hydrateFromUrl: (params) => {
    const current = { ...get().filters };
    const csv = (key: string) => params.get(key)?.split(',').filter(Boolean) || [];
    const next: CatalogFilters = {
      ...current,
      query: params.get('q') || '',
      brandIds: csv('brand'),
      categoryIds: csv('category'),
      ratings: csv('rating').map(Number).filter(Number.isFinite),
      onlyInStock: params.get('stock') === '1',
      onlyDiscounted: params.get('sale') === '1',
      onlyNew: params.get('new') === '1',
      sort: (params.get('sort') as ProductSort) || 'relevance',
      page: Number(params.get('page') || 1) || 1,
    };
    const min = params.get('min');
    const max = params.get('max');
    if (min) next.minPrice = Number(min);
    if (max) next.maxPrice = Number(max);
    set({ filters: next, hydrated: true });
  },
  load: async () => {
    const locale = useAppStore.getState().locale;
    void locale;
    set({ loading: true, error: null });
    try {
      const f = get().filters;
      const result = await listProducts(f);
      set({
        products: result.products,
        total: result.total,
        availableMinPrice: result.availableMinPrice,
        availableMaxPrice: result.availableMaxPrice,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'خطا در دریافت محصولات' });
    }
  },
  loadFacets: async () => {
    set({ facetsLoading: true });
    try {
      const facets = await getCatalogFacets();
      set({ ...facets, facetsLoading: false });
    } catch {
      set({ facetsLoading: false });
    }
  },
}));
