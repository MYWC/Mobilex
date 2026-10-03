-- Mobilex 2.0 Phase 4 hardening. Apply after 0004_commerce_core.sql.
-- This migration is additive and makes checkout/order creation safer for retries and concurrency.

create extension if not exists pgcrypto;

alter table public.addresses add column if not exists updated_at timestamptz not null default now();
create unique index if not exists addresses_one_default_per_user_idx
  on public.addresses(user_id) where is_default = true;
create index if not exists addresses_user_created_idx on public.addresses(user_id, created_at desc);

alter table public.orders add column if not exists idempotency_key uuid;
alter table public.orders add column if not exists currency text not null default 'TOMAN';
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists shipped_at timestamptz;
alter table public.orders add column if not exists delivered_at timestamptz;
create unique index if not exists orders_user_idempotency_uidx on public.orders(user_id,idempotency_key) where idempotency_key is not null;
create index if not exists orders_status_idx on public.orders(status, created_at desc);

-- Keep order state constrained even when staff/admin writes occur outside the client.
do $$ begin
  alter table public.orders add constraint orders_status_check
    check (status in ('processing','pending_payment','paid','shipped','delivered','cancelled','returned'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.orders add constraint orders_payment_status_check
    check (payment_status in ('pending','unpaid','paid','failed','refunded','cancelled'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.orders add constraint orders_payment_method_check
    check (payment_method in ('online','cod','wallet'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.orders add constraint orders_shipping_method_check
    check (shipping_method in ('standard','express','pickup'));
exception when duplicate_object then null; end $$;

create table if not exists public.payment_transactions(
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  external_payment_id text,
  status text not null default 'pending' check(status in ('pending','redirected','paid','failed','cancelled','refunded')),
  amount numeric(14,2) not null check(amount>=0),
  currency text not null default 'TOMAN',
  checkout_url text,
  expires_at timestamptz,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists payment_transactions_external_uidx on public.payment_transactions(provider,external_payment_id) where external_payment_id is not null;
create index if not exists payment_transactions_order_idx on public.payment_transactions(order_id,created_at desc);

create table if not exists public.order_events(
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  actor_id uuid references auth.users(id) on delete set null,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events(order_id,created_at desc);

alter table public.payment_transactions enable row level security;
alter table public.order_events enable row level security;

drop policy if exists payment_transactions_owner_select on public.payment_transactions;
create policy payment_transactions_owner_select on public.payment_transactions
  for select using (exists (select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

drop policy if exists order_events_owner_select on public.order_events;
create policy order_events_owner_select on public.order_events
  for select using (exists (select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists addresses_touch_updated_at on public.addresses;
create trigger addresses_touch_updated_at before update on public.addresses for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders for each row execute function public.touch_updated_at();
drop trigger if exists payment_transactions_touch_updated_at on public.payment_transactions;
create trigger payment_transactions_touch_updated_at before update on public.payment_transactions for each row execute function public.touch_updated_at();

-- Normalize coupon codes going forward.
create or replace function public.normalize_coupon_code() returns trigger
language plpgsql as $$ begin new.code = upper(trim(new.code)); return new; end; $$;
drop trigger if exists coupons_normalize_code on public.coupons;
create trigger coupons_normalize_code before insert or update on public.coupons for each row execute function public.normalize_coupon_code();
create unique index if not exists coupons_code_normalized_uidx on public.coupons(upper(trim(code)));

-- Server authoritative order creation with idempotency.
create or replace function public.mx_create_order(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  item jsonb;
  p record;
  v record;
  q int;
  price numeric(14,2);
  compare_price numeric(14,2);
  subtotal numeric(14,2) := 0;
  item_discount numeric(14,2) := 0;
  coupon_discount numeric(14,2) := 0;
  shipping numeric(14,2) := 0;
  tax numeric(14,2) := 0;
  total numeric(14,2) := 0;
  code text := nullif(upper(trim(p_payload->>'coupon_code')), '');
  ship text := coalesce(p_payload->>'shipping_method', 'standard');
  pay text := coalesce(p_payload->>'payment_method', 'online');
  idem uuid := nullif(p_payload->>'idempotency_key','')::uuid;
  addr jsonb := coalesce(p_payload->'address','{}'::jsonb);
  oid uuid;
  onum text;
  coupon_row record;
  existing record;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if idem is null then raise exception 'IDEMPOTENCY_KEY_REQUIRED'; end if;
  if jsonb_array_length(coalesce(p_payload->'items','[]'::jsonb)) = 0 then raise exception 'CART_EMPTY'; end if;
  if ship not in ('standard','express','pickup') then raise exception 'INVALID_SHIPPING_METHOD'; end if;
  if pay not in ('online','cod','wallet') then raise exception 'INVALID_PAYMENT_METHOD'; end if;

  select * into existing from public.orders where user_id=uid and idempotency_key=idem limit 1;
  if found then
    return jsonb_build_object(
      'order_id', existing.id,
      'order_number', existing.order_number,
      'status', existing.status,
      'payment_status', existing.payment_status,
      'payment_required', existing.payment_method='online' and existing.payment_status <> 'paid',
      'total_amount', existing.total_amount,
      'idempotent', true
    );
  end if;

  for item in select * from jsonb_array_elements(p_payload->'items') loop
    q := greatest(1, least(99, coalesce(nullif(item->>'quantity','')::int,1)));
    select * into p from public.products where id=(item->>'product_id')::uuid for update;
    if not found or coalesce(p.is_active,true)=false then raise exception 'PRODUCT_UNAVAILABLE:%',item->>'product_id'; end if;

    if nullif(item->>'variant_id','') is not null then
      select * into v from public.product_variants where id=(item->>'variant_id')::uuid and product_id=p.id for update;
      if not found or coalesce(v.is_active,true)=false then raise exception 'VARIANT_UNAVAILABLE:%',item->>'variant_id'; end if;
      if coalesce(v.stock,0) < q then raise exception 'OUT_OF_STOCK:%',p.id; end if;
      price := case when coalesce(v.sale_price,0)>0 and v.sale_price<v.price then v.sale_price else v.price end;
      compare_price := coalesce(v.price,price);
    else
      if coalesce(p.stock,0) < q then raise exception 'OUT_OF_STOCK:%',p.id; end if;
      price := case when coalesce(p.sale_price,0)>0 and p.sale_price<p.price then p.sale_price else p.price end;
      compare_price := coalesce(p.price,price);
    end if;

    subtotal := subtotal + price*q;
    item_discount := item_discount + greatest(0,compare_price-price)*q;
  end loop;

  if code is not null then
    select * into coupon_row from public.coupons
      where upper(trim(code))=code and is_active
        and (starts_at is null or starts_at<=now())
        and (expires_at is null or expires_at>=now())
      for update;
    if found and (coupon_row.min_order_amount is null or subtotal>=coupon_row.min_order_amount)
       and (coupon_row.usage_limit is null or coupon_row.used_count<coupon_row.usage_limit) then
      coupon_discount := case when coupon_row.type='percent' then floor(subtotal*coupon_row.value/100) else coupon_row.value end;
      if coupon_row.max_discount_amount is not null then coupon_discount := least(coupon_discount,coupon_row.max_discount_amount); end if;
      coupon_discount := least(coupon_discount,subtotal);
      update public.coupons set used_count=used_count+1 where id=coupon_row.id;
    end if;
  end if;

  shipping := case
    when ship='pickup' then 0
    when ship='express' then 165000
    when subtotal-coupon_discount>=5000000 then 0
    else 85000
  end;
  total := greatest(0,subtotal-coupon_discount+shipping+tax);
  onum := 'MX-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));

  insert into public.orders(
    order_number,user_id,idempotency_key,currency,status,payment_status,payment_method,shipping_method,
    recipient_name,phone,province,city,postal_code,address_line,plaque,unit,notes,
    subtotal,item_discount,coupon_discount,shipping_amount,tax_amount,total_amount,coupon_code
  ) values (
    onum,uid,idem,'TOMAN',case when pay='online' then 'pending_payment' else 'processing' end,
    case when pay='online' then 'pending' else 'unpaid' end,pay,ship,
    nullif(addr->>'recipientName',''),nullif(addr->>'phone',''),nullif(addr->>'province',''),nullif(addr->>'city',''),
    nullif(addr->>'postalCode',''),nullif(addr->>'addressLine',''),nullif(addr->>'plaque',''),nullif(addr->>'unit',''),nullif(addr->>'notes',''),
    subtotal,item_discount,coupon_discount,shipping,tax,total,code
  ) returning id into oid;

  for item in select * from jsonb_array_elements(p_payload->'items') loop
    q := greatest(1, least(99, coalesce(nullif(item->>'quantity','')::int,1)));
    select * into p from public.products where id=(item->>'product_id')::uuid for update;
    if nullif(item->>'variant_id','') is not null then
      select * into v from public.product_variants where id=(item->>'variant_id')::uuid and product_id=p.id for update;
      price := case when coalesce(v.sale_price,0)>0 and v.sale_price<v.price then v.sale_price else v.price end;
      insert into public.order_items(order_id,product_id,variant_id,product_name,variant_label,sku,quantity,unit_price,compare_at_price,line_total)
      values(oid,p.id,v.id,p.name_fa,coalesce(v.label,''),coalesce(v.sku,p.sku),q,price,v.price,price*q);
      update public.product_variants set stock=stock-q where id=v.id;
    else
      price := case when coalesce(p.sale_price,0)>0 and p.sale_price<p.price then p.sale_price else p.price end;
      insert into public.order_items(order_id,product_id,product_name,sku,quantity,unit_price,compare_at_price,line_total)
      values(oid,p.id,p.name_fa,p.sku,q,price,p.price,price*q);
      update public.products set stock=stock-q where id=p.id;
    end if;
  end loop;

  insert into public.order_events(order_id,event_type,actor_id,message)
  values(oid,'order_created',uid,'Order created from checkout');

  if pay='online' then
    insert into public.payment_transactions(order_id,provider,status,amount,currency)
    values(oid,'pending','pending',total,'TOMAN');
  end if;

  return jsonb_build_object(
    'order_id',oid,
    'order_number',onum,
    'status',case when pay='online' then 'pending_payment' else 'processing' end,
    'payment_status',case when pay='online' then 'pending' else 'unpaid' end,
    'payment_required',pay='online',
    'total_amount',total,
    'idempotent',false
  );
exception
  when unique_violation then
    select * into existing from public.orders where user_id=uid and idempotency_key=idem limit 1;
    if found then
      return jsonb_build_object('order_id',existing.id,'order_number',existing.order_number,'status',existing.status,'payment_status',existing.payment_status,'payment_required',existing.payment_method='online' and existing.payment_status <> 'paid','total_amount',existing.total_amount,'idempotent',true);
    end if;
    raise;
end;
$$;

revoke all on function public.mx_create_order(jsonb) from public;
grant execute on function public.mx_create_order(jsonb) to authenticated;
