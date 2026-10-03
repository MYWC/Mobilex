import type { CatalogProduct } from '@/types/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { useCatalogStore } from '@/features/catalog/catalog.store';
export function ProductGrid({products,compact=false}:{products:CatalogProduct[];compact?:boolean}){const view=useCatalogStore(s=>s.view);return <div className={view==='list'?'mx-product-grid mx-product-grid-list':'mx-product-grid'}>{products.map(p=><ProductCard key={p.id} product={p} compact={compact}/>)}</div>}
