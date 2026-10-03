-- Mobilex 2.0 Phase 4 commerce core.
-- Apply after the Phase 3 catalog schema. Review existing order tables before running
-- in an already-populated project.

create extension if not exists pgcrypto;

create table if not exists public.product_variants(
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 sku text, label text, color text, color_code text, storage text, ram text,
 price numeric(14,2), sale_price numeric(14,2), stock integer not null default 0,
 is_default boolean not null default false, is_active boolean not null default true,
 metadata jsonb, created_at timestamptz not null default now()
);

create table if not exists public.addresses(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null,
 recipient_name text not null,
 phone text not null,
 province text not null,
 city text not null,
 postal_code text not null,
 address_line text not null,
 plaque text, unit text, notes text,
 is_default boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses(user_id,is_default desc,created_at desc);

create table if not exists public.coupons(
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 type text not null check(type in('percent','fixed')),
 value numeric(14,2) not null check(value>=0),
 min_order_amount numeric(14,2),
 max_discount_amount numeric(14,2),
 starts_at timestamptz, expires_at timestamptz,
 usage_limit bigint, used_count bigint not null default 0,
 is_active boolean not null default true,
 description text, created_at timestamptz not null default now()
);

create table if not exists public.orders(
 id uuid primary key default gen_random_uuid(),
 order_number text not null unique,
 user_id uuid not null references auth.users(id) on delete restrict,
 status text not null default 'processing',
 payment_status text not null default 'pending',
 payment_method text not null,
 shipping_method text not null,
 recipient_name text not null, phone text not null, province text not null, city text not null,
 postal_code text not null, address_line text not null, plaque text, unit text, notes text,
 subtotal numeric(14,2) not null, item_discount numeric(14,2) not null default 0,
 coupon_discount numeric(14,2) not null default 0, shipping_amount numeric(14,2) not null default 0,
 tax_amount numeric(14,2) not null default 0, total_amount numeric(14,2) not null,
 coupon_code text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id,created_at desc);

create table if not exists public.order_items(
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete restrict,
 variant_id uuid references public.product_variants(id) on delete restrict,
 product_name text, variant_label text, sku text,
 quantity integer not null check(quantity>0),
 unit_price numeric(14,2) not null,
 compare_at_price numeric(14,2), line_total numeric(14,2) not null,
 created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);

alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;

drop policy if exists addresses_owner_select on public.addresses;
create policy addresses_owner_select on public.addresses for select using(auth.uid()=user_id);
drop policy if exists addresses_owner_insert on public.addresses;
create policy addresses_owner_insert on public.addresses for insert with check(auth.uid()=user_id);
drop policy if exists addresses_owner_update on public.addresses;
create policy addresses_owner_update on public.addresses for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists addresses_owner_delete on public.addresses;
create policy addresses_owner_delete on public.addresses for delete using(auth.uid()=user_id);

drop policy if exists orders_owner_select on public.orders;
create policy orders_owner_select on public.orders for select using(auth.uid()=user_id);
drop policy if exists order_items_owner_select on public.order_items;
create policy order_items_owner_select on public.order_items for select using(exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

drop policy if exists coupons_active_select on public.coupons;
create policy coupons_active_select on public.coupons for select using(is_active=true);

create or replace function public.mx_create_order(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
 uid uuid:=auth.uid(); it jsonb; p record; v record; q int;
 price numeric(14,2); compare_price numeric(14,2);
 subtotal numeric(14,2):=0; item_discount numeric(14,2):=0;
 coupon_discount numeric(14,2):=0; shipping numeric(14,2):=0;
 total numeric(14,2):=0; code text:=nullif(upper(trim(p_payload->>'coupon_code')),'');
 ship text:=coalesce(p_payload->>'shipping_method','standard');
 pay text:=coalesce(p_payload->>'payment_method','online');
 a jsonb:=coalesce(p_payload->'address','{}'::jsonb);
 oid uuid; onum text; cr record;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if jsonb_array_length(coalesce(p_payload->'items','[]'::jsonb))=0 then raise exception 'CART_EMPTY'; end if;

 for it in select * from jsonb_array_elements(p_payload->'items') loop
   q:=greatest(1,least(99,(it->>'quantity')::int));
   select * into p from public.products where id=(it->>'product_id')::uuid for update;
   if not found or coalesce(p.is_active,true)=false then raise exception 'PRODUCT_UNAVAILABLE:%',it->>'product_id'; end if;
   if it->>'variant_id' is not null then
     select * into v from public.product_variants where id=(it->>'variant_id')::uuid and product_id=p.id for update;
     if not found or coalesce(v.is_active,true)=false then raise exception 'VARIANT_UNAVAILABLE:%',it->>'variant_id'; end if;
     if coalesce(v.stock,0)<q then raise exception 'OUT_OF_STOCK:%',p.id; end if;
     price:=case when coalesce(v.sale_price,0)>0 and v.sale_price<v.price then v.sale_price else v.price end;
     compare_price:=coalesce(v.price,price);
     update public.product_variants set stock=stock-q where id=v.id;
   else
     if coalesce(p.stock,0)<q then raise exception 'OUT_OF_STOCK:%',p.id; end if;
     price:=case when coalesce(p.sale_price,0)>0 and p.sale_price<p.price then p.sale_price else p.price end;
     compare_price:=coalesce(p.price,price);
     update public.products set stock=stock-q where id=p.id;
   end if;
   subtotal:=subtotal+price*q;
   item_discount:=item_discount+greatest(0,compare_price-price)*q;
 end loop;

 if code is not null then
   select c.* into cr from public.coupons c where upper(c.code)=code and c.is_active
     and (starts_at is null or starts_at<=now()) and (expires_at is null or expires_at>=now()) for update;
   if found and (cr.min_order_amount is null or subtotal>=cr.min_order_amount)
      and (cr.usage_limit is null or cr.used_count<cr.usage_limit) then
      coupon_discount:=case when cr.type='percent' then floor(subtotal*cr.value/100) else cr.value end;
      if cr.max_discount_amount is not null then coupon_discount:=least(coupon_discount,cr.max_discount_amount); end if;
      coupon_discount:=least(coupon_discount,subtotal);
      update public.coupons set used_count=used_count+1 where id=cr.id;
   end if;
 end if;

 shipping:=case when ship='pickup' then 0 when ship='express' then 165000 when subtotal-coupon_discount>=5000000 then 0 else 85000 end;
 total:=greatest(0,subtotal-coupon_discount+shipping);

 onum:='MX-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 insert into public.orders(order_number,user_id,status,payment_status,payment_method,shipping_method,
 recipient_name,phone,province,city,postal_code,address_line,plaque,unit,notes,
 subtotal,item_discount,coupon_discount,shipping_amount,tax_amount,total_amount,coupon_code)
 values(onum,uid,case when pay='online' then 'pending_payment' else 'processing' end,
 case when pay='online' then 'pending' else 'unpaid' end,pay,ship,
 a->>'recipientName',a->>'phone',a->>'province',a->>'city',a->>'postalCode',a->>'addressLine',
 nullif(a->>'plaque',''),nullif(a->>'unit',''),nullif(a->>'notes',''),
 subtotal,item_discount,coupon_discount,shipping,0,total,code) returning id into oid;

 for it in select * from jsonb_array_elements(p_payload->'items') loop
   q:=greatest(1,least(99,(it->>'quantity')::int));
   select * into p from public.products where id=(it->>'product_id')::uuid;
   if it->>'variant_id' is not null then
     select * into v from public.product_variants where id=(it->>'variant_id')::uuid;
     price:=case when coalesce(v.sale_price,0)>0 and v.sale_price<v.price then v.sale_price else v.price end;
     insert into public.order_items(order_id,product_id,variant_id,product_name,variant_label,sku,quantity,unit_price,compare_at_price,line_total)
     values(oid,p.id,v.id,p.name_fa,coalesce(v.label,''),coalesce(v.sku,p.sku),q,price,v.price,price*q);
   else
     price:=case when coalesce(p.sale_price,0)>0 and p.sale_price<p.price then p.sale_price else p.price end;
     insert into public.order_items(order_id,product_id,product_name,sku,quantity,unit_price,compare_at_price,line_total)
     values(oid,p.id,p.name_fa,p.sku,q,price,p.price,price*q);
   end if;
 end loop;

 return jsonb_build_object('order_id',oid,'order_number',onum,'total_amount',total,'payment_required',pay='online');
end;
$$;

revoke all on function public.mx_create_order(jsonb) from public;
grant execute on function public.mx_create_order(jsonb) to authenticated;
