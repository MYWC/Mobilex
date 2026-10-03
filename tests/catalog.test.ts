import { describe, expect, it } from 'vitest';
import { getDemoProducts, listProducts } from '@/services/catalog/catalog.service';
import type { CatalogFilters } from '@/types/catalog';
const base:CatalogFilters={query:'',brandIds:[],categoryIds:[],ratings:[],onlyInStock:false,onlyDiscounted:false,onlyNew:false,sort:'relevance',page:1,pageSize:12};
describe('catalog',()=>{
 it('has a rich demo catalog',()=>expect(getDemoProducts().length).toBeGreaterThanOrEqual(10));
 it('filters by query',async()=>{const r=await listProducts({...base,query:'iphone'});expect(r.products.some(p=>p.slug==='iphone-17-pro')).toBe(true)});
 it('filters by availability',async()=>{const r=await listProducts({...base,onlyInStock:true});expect(r.products.every(p=>p.stock>0)).toBe(true)});
 it('filters discounts',async()=>{const r=await listProducts({...base,onlyDiscounted:true});expect(r.products.every(p=>Boolean(p.salePrice&&p.salePrice<p.price))).toBe(true)});
});
