import { requireSupabase, supabase } from '@/lib/supabase/client';
import { normalizeError } from '@/lib/errors/app-error';
import { demoAudit, demoBanners, demoContent, demoDashboard, demoInventory, demoOrders, demoProducts, demoUsers } from '@/lib/admin/demo';
import type { AdminDashboardData, AdminOrderRow, AdminOrderStatus, AdminProductRow, AdminUserRow, AuditLogRow, ContentBanner, ContentBlock, InventoryRow } from '@/types/admin';
import type { UserRole } from '@/types/core';

const now = () => new Date().toISOString();
const live = Boolean(supabase);

function unwrap<T>(data: T | null, error: unknown): T {
  if (error) throw normalizeError(error);
  return data as T;
}

export async function getDashboardData(): Promise<AdminDashboardData> {
  if (!live) return demoDashboard();
  try {
    const client = requireSupabase();
    const since = new Date(Date.now() - 14 * 86400000).toISOString();
    const [orders, products] = await Promise.all([
      client.from('orders').select('id,order_number,status,payment_status,total_amount,created_at,user_id').gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
      client.from('products').select('id,name_fa,name_en,price,sale_price,stock,is_active,updated_at').order('updated_at', { ascending: false }).limit(5000),
    ]);
    unwrap(null, orders.error);
    unwrap(null, products.error);
    const orderRows = orders.data ?? [];
    const productRows = products.data ?? [];
    const revenueByDate = new Map<string, { revenue:number; orders:number }>();
    for (const o of orderRows) {
      const date = String(o.created_at).slice(0, 10);
      const current = revenueByDate.get(date) ?? { revenue:0, orders:0 };
      if (!['cancelled','returned'].includes(o.status)) current.revenue += Number(o.total_amount || 0);
      current.orders += 1;
      revenueByDate.set(date, current);
    }
    const revenue = Array.from({length:14},(_,i)=>{
      const d = new Date(Date.now() - (13-i)*86400000);
      const key = d.toISOString().slice(0,10);
      const x = revenueByDate.get(key) ?? { revenue:0, orders:0 };
      return {date:key,...x};
    });
    const top = new Map<string,{name:string; units:number; revenue:number; stock:number}>();
    const ids = orderRows.map((o:any)=>o.id);
    if (ids.length) {
      const items = await client.from('order_items').select('product_id,product_name,quantity,line_total').in('order_id', ids);
      if (!items.error) for (const item of items.data ?? []) {
        const key = String(item.product_id); const p = top.get(key) ?? {name:item.product_name || 'Product',units:0,revenue:0,stock:0}; p.units += Number(item.quantity||0); p.revenue += Number(item.line_total||0); top.set(key,p);
      }
    }
    const stockMap = new Map<string, number>(); for (const p of productRows) stockMap.set(String(p.id), Number(p.stock||0));
    const topProducts = [...top.entries()].sort((a,b)=>b[1].revenue-a[1].revenue).slice(0,8).map(([productId,x])=>({...x,productId,stock:stockMap.get(productId) ?? 0}));
    const lowStock = productRows.filter((p:any)=>Number(p.stock||0)<=10).slice(0,12).map((p:any)=>({id:String(p.id),name:p.name_fa || p.name_en || 'Product',stock:Number(p.stock||0),threshold:10}));
    const recentOrders = orderRows.slice(0,8).map((o:any)=>({id:o.id,orderNumber:o.order_number,customerName:o.user_id ? `#${String(o.user_id).slice(0,8)}` : 'Guest',status:o.status,paymentStatus:o.payment_status,totalAmount:Number(o.total_amount||0),createdAt:o.created_at}));
    const countBy = new Map<string,number>(); for (const o of orderRows) countBy.set(o.status,(countBy.get(o.status)??0)+1);
    const ordersByStatus = [...countBy.entries()].map(([status,count])=>({status:status as AdminOrderStatus,count}));
    const revenueTotal = revenue.reduce((s,x)=>s+x.revenue,0);
    const ordersTotal = orderRows.length;
    const activeCustomers = new Set(orderRows.filter((o:any)=>!['cancelled','returned'].includes(o.status)).map((o:any)=>o.user_id)).size;
    const avg = ordersTotal ? revenueTotal/ordersTotal : 0;
    return {
      metrics:[
        {key:'revenue',label:'فروش ۱۴ روز اخیر',value:revenueTotal,tone:'primary',format:'currency'},
        {key:'orders',label:'سفارش‌های ۱۴ روز اخیر',value:ordersTotal,tone:'success',format:'number'},
        {key:'customers',label:'مشتریان فعال',value:activeCustomers,tone:'info',format:'number'},
        {key:'aov',label:'میانگین ارزش سفارش',value:avg,tone:'warning',format:'currency'},
      ],
      revenue,topProducts,lowStock,recentOrders,ordersByStatus,
    };
  } catch (error) {
    if (!live) return demoDashboard();
    throw normalizeError(error);
  }
}

export async function listProducts(filters?: { search?: string; active?: 'all'|'active'|'inactive'; lowStock?: boolean }): Promise<AdminProductRow[]> {
  if (!live) return demoProducts();
  try {
    const client=requireSupabase();
    let q=client.from('products').select('id,name_fa,name_en,sku,price,sale_price,stock,is_active,updated_at,brand:brands(name_fa,name_en),category:categories(name_fa,name_en)').order('updated_at',{ascending:false});
    if (filters?.active==='active') q=q.eq('is_active',true);
    if (filters?.active==='inactive') q=q.eq('is_active',false);
    if (filters?.lowStock) q=q.lte('stock',10);
    const {data,error}=await q.limit(500);
    if(error) throw error;
    const search=(filters?.search||'').trim().toLocaleLowerCase();
    return (data||[]).filter((p:any)=>!search || [p.name_fa,p.name_en,p.sku].filter(Boolean).join(' ').toLocaleLowerCase().includes(search)).map((p:any)=>({id:String(p.id),name:p.name_fa||p.name_en||'Product',sku:p.sku||undefined,price:Number(p.price||0),salePrice:p.sale_price?Number(p.sale_price):undefined,stock:Number(p.stock||0),isActive:Boolean(p.is_active),updatedAt:p.updated_at,brand:p.brand?.name_fa||p.brand?.name_en,category:p.category?.name_fa||p.category?.name_en}));
  } catch (error) { if (!live) return demoProducts(); throw normalizeError(error); }
}

export async function updateProduct(id:string, patch:{price?:number;salePrice?:number|null;stock?:number;isActive?:boolean}):Promise<void>{
  if(!live) return;
  const client=requireSupabase();
  const payload:any={updated_at:now()}; if('price' in patch) payload.price=patch.price; if('salePrice' in patch) payload.sale_price=patch.salePrice ?? null; if('stock' in patch) payload.stock=patch.stock; if('isActive' in patch) payload.is_active=patch.isActive;
  const {error}=await client.from('products').update(payload).eq('id',id); if(error) throw error;
}

export async function listOrders(filters?:{search?:string;status?:string}):Promise<AdminOrderRow[]>{
  if(!live) return demoOrders();
  try{
    const client=requireSupabase(); let q=client.from('orders').select('id,order_number,user_id,status,payment_status,payment_method,shipping_method,total_amount,created_at,updated_at,order_items(quantity)').order('created_at',{ascending:false}).limit(500);
    if(filters?.status && filters.status!=='all') q=q.eq('status',filters.status);
    const {data,error}=await q; if(error) throw error;
    const search=(filters?.search||'').trim().toLocaleLowerCase();
    return (data||[]).map((o:any)=>({id:String(o.id),orderNumber:o.order_number,userId:String(o.user_id),customerName:`#${String(o.user_id).slice(0,8)}`,status:o.status,paymentStatus:o.payment_status,paymentMethod:o.payment_method,shippingMethod:o.shipping_method,totalAmount:Number(o.total_amount||0),itemCount:(o.order_items||[]).reduce((s:any,i:any)=>s+Number(i.quantity||0),0),createdAt:o.created_at,updatedAt:o.updated_at})).filter((o:any)=>!search || [o.orderNumber,o.customerName].join(' ').toLocaleLowerCase().includes(search));
  }catch(error){if(!live)return demoOrders();throw normalizeError(error);}
}

export async function updateOrderStatus(id:string,status:AdminOrderStatus,note?:string):Promise<void>{
  if(!live) return;
  const client=requireSupabase();
  const {data,error}=await client.rpc('mx_admin_update_order_status',{p_order_id:id,p_status:status,p_message:note||null});
  if(error) throw error;
  if(data===false) throw new Error('ORDER_STATUS_UPDATE_FAILED');
}

export async function listUsers(filters?:{search?:string;role?:UserRole|'all'}):Promise<AdminUserRow[]>{
  if(!live) return demoUsers();
  try{
    const client=requireSupabase(); let q=client.from('profiles').select('id,full_name,phone,avatar_url,role,created_at').order('created_at',{ascending:false}).limit(500);
    if(filters?.role && filters.role!=='all') q=q.eq('role',filters.role);
    const {data,error}=await q; if(error) throw error;
    const search=(filters?.search||'').trim().toLocaleLowerCase();
    return (data||[]).map((u:any)=>({id:String(u.id),fullName:u.full_name||undefined,phone:u.phone||undefined,role:(u.role||'customer') as UserRole,createdAt:u.created_at})).filter((u:any)=>!search || [u.fullName,u.phone,u.email,u.id].filter(Boolean).join(' ').toLocaleLowerCase().includes(search));
  }catch(error){if(!live)return demoUsers();throw normalizeError(error);}
}

export async function updateUserRole(userId:string,role:UserRole):Promise<void>{
  if(!live) return;
  const client=requireSupabase(); const {error}=await client.rpc('mx_admin_set_user_role',{p_user_id:userId,p_role:role}); if(error) throw error;
}

export async function listAuditLogs(filters?:{search?:string;severity?:string}):Promise<AuditLogRow[]>{
  if(!live) return demoAudit();
  try{ const client=requireSupabase(); let q=client.from('audit_logs').select('id,actor_id,action,entity_type,entity_id,severity,summary,metadata,created_at,actor:profiles(full_name)').order('created_at',{ascending:false}).limit(500); if(filters?.severity&&filters.severity!=='all') q=q.eq('severity',filters.severity); const {data,error}=await q; if(error) throw error; const search=(filters?.search||'').toLocaleLowerCase(); return (data||[]).map((x:any)=>({id:String(x.id),actorId:x.actor_id||undefined,actorName:x.actor?.full_name||undefined,action:x.action,entityType:x.entity_type,entityId:x.entity_id||undefined,severity:x.severity,summary:x.summary||x.action,metadata:x.metadata||{},createdAt:x.created_at})).filter((x:any)=>!search || [x.action,x.entityType,x.entityId,x.summary,x.actorName].filter(Boolean).join(' ').toLocaleLowerCase().includes(search)); }catch(error){throw normalizeError(error);}
}

export async function listBanners():Promise<ContentBanner[]>{
  if(!live) return demoBanners();
  try{const client=requireSupabase();const {data,error}=await client.from('site_banners').select('*').order('sort_order');if(error)throw error;return (data||[]).map((x:any)=>({id:String(x.id),title:x.title,subtitle:x.subtitle||undefined,imageUrl:x.image_url||undefined,href:x.href||undefined,placement:x.placement,sortOrder:Number(x.sort_order||0),isActive:Boolean(x.is_active),startsAt:x.starts_at||undefined,endsAt:x.ends_at||undefined}));}catch(error){throw normalizeError(error);}
}
export async function upsertBanner(b:Partial<ContentBanner>&{id?:string}):Promise<void>{if(!live)return;const client=requireSupabase();const payload:any={title:b.title,subtitle:b.subtitle||null,image_url:b.imageUrl||null,href:b.href||null,placement:b.placement||'home_hero',sort_order:b.sortOrder||0,is_active:b.isActive??true,starts_at:b.startsAt||null,ends_at:b.endsAt||null,updated_at:now()};const q=b.id?client.from('site_banners').update(payload).eq('id',b.id):client.from('site_banners').insert(payload);const {error}=await q;if(error)throw error;}
export async function deleteBanner(id:string):Promise<void>{if(!live)return;const {error}=await requireSupabase().from('site_banners').delete().eq('id',id);if(error)throw error;}

export async function listContentBlocks():Promise<ContentBlock[]>{if(!live)return demoContent();try{const {data,error}=await requireSupabase().from('content_blocks').select('*').order('updated_at',{ascending:false});if(error)throw error;return (data||[]).map((x:any)=>({id:String(x.id),key:x.key,title:x.title,body:x.body||undefined,kind:x.kind,isActive:Boolean(x.is_active),updatedAt:x.updated_at}));}catch(error){throw normalizeError(error);}}
export async function upsertContentBlock(b:Partial<ContentBlock>&{id?:string}):Promise<void>{if(!live)return;const client=requireSupabase();const payload:any={key:b.key,title:b.title,body:b.body||null,kind:b.kind||'rich_text',is_active:b.isActive??true,updated_at:now()};const q=b.id?client.from('content_blocks').update(payload).eq('id',b.id):client.from('content_blocks').insert(payload);const {error}=await q;if(error)throw error;}
export async function deleteContentBlock(id:string):Promise<void>{if(!live)return;const {error}=await requireSupabase().from('content_blocks').delete().eq('id',id);if(error)throw error;}

export async function listInventory(filters?:{lowOnly?:boolean;search?:string}):Promise<InventoryRow[]>{if(!live)return demoInventory();try{const client=requireSupabase();const {data,error}=await client.from('products').select('id,name_fa,name_en,sku,stock,updated_at,product_variants(id,label,sku,stock,updated_at,is_active)').order('updated_at',{ascending:false}).limit(500);if(error)throw error;const rows:InventoryRow[]=[];for(const p of data||[]){if(!(p.product_variants||[]).length) rows.push({id:String(p.id),productId:String(p.id),productName:p.name_fa||p.name_en||'Product',sku:p.sku||undefined,stock:Number(p.stock||0),threshold:10,updatedAt:p.updated_at});else for(const v of p.product_variants||[]) if(v.is_active!==false) rows.push({id:String(v.id),productId:String(p.id),variantId:String(v.id),productName:p.name_fa||p.name_en||'Product',variantLabel:v.label||undefined,sku:v.sku||p.sku||undefined,stock:Number(v.stock||0),threshold:10,updatedAt:v.updated_at||p.updated_at});}
const search=(filters?.search||'').toLocaleLowerCase();return rows.filter(x=>(!filters?.lowOnly||x.stock<=x.threshold)&&(!search||[x.productName,x.variantLabel,x.sku].filter(Boolean).join(' ').toLocaleLowerCase().includes(search)));}catch(error){throw normalizeError(error);}}
export async function adjustInventory(input:{productId:string;variantId?:string;delta:number;reason:string}):Promise<void>{if(!live)return;const {error}=await requireSupabase().rpc('mx_admin_adjust_inventory',{p_product_id:input.productId,p_variant_id:input.variantId||null,p_delta:input.delta,p_reason:input.reason});if(error)throw error;}
