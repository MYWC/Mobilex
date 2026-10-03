-- Mobilex 2.0 Phase 4 lifecycle hardening.
-- Apply after 0005_commerce_hardening.sql.
-- Adds temporary stock reservations for online payments, coupon usage records,
-- idempotent cancellation and server-side payment result handling.

alter table public.coupons add column if not exists first_order_only boolean not null default false;
create index if not exists coupons_active_lookup_idx on public.coupons(is_active, expires_at);

create table if not exists public.coupon_usages(
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  discount_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists coupon_usage_once_per_user_idx on public.coupon_usages(coupon_id,user_id);
create index if not exists coupon_usage_user_idx on public.coupon_usages(user_id,created_at desc);

create table if not exists public.inventory_reservations(
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  quantity integer not null check(quantity>0),
  expires_at timestamptz,
  committed_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists inventory_reservations_expiry_idx on public.inventory_reservations(expires_at) where released_at is null and committed_at is null;
create index if not exists inventory_reservations_order_idx on public.inventory_reservations(order_id,created_at desc);

alter table public.coupon_usages enable row level security;
alter table public.inventory_reservations enable row level security;

drop policy if exists coupon_usage_owner_select on public.coupon_usages;
create policy coupon_usage_owner_select on public.coupon_usages for select using(auth.uid()=user_id);

drop policy if exists inventory_reservations_owner_select on public.inventory_reservations;
create policy inventory_reservations_owner_select on public.inventory_reservations
  for select using(exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

-- Extend order columns for reservation/payment lifecycle.
alter table public.orders add column if not exists reservation_expires_at timestamptz;
create index if not exists orders_reservation_expiry_idx on public.orders(reservation_expires_at) where reservation_expires_at is not null;

-- Validate a coupon for the current user without spending it.
create or replace function public.mx_coupon_is_eligible(p_coupon_id uuid, p_user_id uuid)
returns boolean language sql security definer set search_path=public as $$
  select not exists(select 1 from public.coupon_usages where coupon_id=p_coupon_id and user_id=p_user_id)
$$;
revoke all on function public.mx_coupon_is_eligible(uuid,uuid) from public;
grant execute on function public.mx_coupon_is_eligible(uuid,uuid) to authenticated;

-- Release one order's uncommitted reservations exactly once.
create or replace function public.mx_release_order_reservations(p_order_id uuid)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare r record; released_count integer:=0;
begin
  for r in select * from public.inventory_reservations
    where order_id=p_order_id and released_at is null and committed_at is null for update loop
    if r.variant_id is not null then
      update public.product_variants set stock=stock+r.quantity where id=r.variant_id;
    else
      update public.products set stock=stock+r.quantity where id=r.product_id;
    end if;
    update public.inventory_reservations set released_at=now() where id=r.id;
    released_count:=released_count+1;
  end loop;
  return released_count;
end;
$$;
revoke all on function public.mx_release_order_reservations(uuid) from public;
grant execute on function public.mx_release_order_reservations(uuid) to service_role;

-- Server authoritative order creation with temporary stock reservation for online payment.
create or replace function public.mx_create_order(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  uid uuid := auth.uid();
  item jsonb;
  p record;
  v record;
  q int;
  price numeric(14,2);
  compare_price numeric(14,2);
  subtotal numeric(14,2):=0;
  item_discount numeric(14,2):=0;
  coupon_discount numeric(14,2):=0;
  shipping numeric(14,2):=0;
  tax numeric(14,2):=0;
  total numeric(14,2):=0;
  code text:=nullif(upper(trim(p_payload->>'coupon_code')),'');
  ship text:=coalesce(p_payload->>'shipping_method','standard');
  pay text:=coalesce(p_payload->>'payment_method','online');
  idem uuid:=nullif(p_payload->>'idempotency_key','')::uuid;
  addr jsonb:=coalesce(p_payload->'address','{}'::jsonb);
  oid uuid;
  onum text;
  coupon_row record;
  existing record;
  coupon_applied boolean:=false;
  reservation_expiry timestamptz:=case when pay='online' then now()+interval '15 minutes' else null end;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if idem is null then raise exception 'IDEMPOTENCY_KEY_REQUIRED'; end if;
  if jsonb_array_length(coalesce(p_payload->'items','[]'::jsonb))=0 then raise exception 'CART_EMPTY'; end if;
  if jsonb_array_length(coalesce(p_payload->'items','[]'::jsonb))>100 then raise exception 'CART_TOO_LARGE'; end if;
  if ship not in ('standard','express','pickup') then raise exception 'INVALID_SHIPPING_METHOD'; end if;
  if pay not in ('online','cod','wallet') then raise exception 'INVALID_PAYMENT_METHOD'; end if;

  select * into existing from public.orders where user_id=uid and idempotency_key=idem limit 1;
  if found then
    return jsonb_build_object('order_id',existing.id,'order_number',existing.order_number,'status',existing.status,'payment_status',existing.payment_status,'payment_required',existing.payment_method='online' and existing.payment_status <> 'paid','total_amount',existing.total_amount,'reservation_expires_at',existing.reservation_expires_at,'idempotent',true);
  end if;

  -- Sort by product id to reduce lock-order deadlocks between concurrent checkouts.
  for item in select value from jsonb_array_elements(p_payload->'items') order by value->>'product_id' loop
    q:=greatest(1,least(99,coalesce(nullif(item->>'quantity','')::int,1)));
    select * into p from public.products where id=(item->>'product_id')::uuid for update;
    if not found or coalesce(p.is_active,true)=false then raise exception 'PRODUCT_UNAVAILABLE:%',item->>'product_id'; end if;
    if nullif(item->>'variant_id','') is not null then
      select * into v from public.product_variants where id=(item->>'variant_id')::uuid and product_id=p.id for update;
      if not found or coalesce(v.is_active,true)=false then raise exception 'VARIANT_UNAVAILABLE:%',item->>'variant_id'; end if;
      if coalesce(v.stock,0)<q then raise exception 'OUT_OF_STOCK:%',p.id; end if;
      price:=case when coalesce(v.sale_price,0)>0 and v.sale_price<v.price then v.sale_price else v.price end;
      compare_price:=coalesce(v.price,price);
    else
      if coalesce(p.stock,0)<q then raise exception 'OUT_OF_STOCK:%',p.id; end if;
      price:=case when coalesce(p.sale_price,0)>0 and p.sale_price<p.price then p.sale_price else p.price end;
      compare_price:=coalesce(p.price,price);
    end if;
    subtotal:=subtotal+price*q;
    item_discount:=item_discount+greatest(0,compare_price-price)*q;
  end loop;

  if code is not null then
    select * into coupon_row from public.coupons where upper(trim(code))=code and is_active
      and (starts_at is null or starts_at<=now()) and (expires_at is null or expires_at>=now()) for update;
    if found and (coupon_row.min_order_amount is null or subtotal>=coupon_row.min_order_amount)
      and (coupon_row.usage_limit is null or coupon_row.used_count<coupon_row.usage_limit)
      and (not coupon_row.first_order_only or public.mx_coupon_is_eligible(coupon_row.id,uid)) then
      coupon_discount:=case when coupon_row.type='percent' then floor(subtotal*coupon_row.value/100) else coupon_row.value end;
      if coupon_row.max_discount_amount is not null then coupon_discount:=least(coupon_discount,coupon_row.max_discount_amount); end if;
      coupon_discount:=least(coupon_discount,subtotal);
      coupon_applied:=true;
      update public.coupons set used_count=used_count+1 where id=coupon_row.id;
    end if;
  end if;

  shipping:=case when ship='pickup' then 0 when ship='express' then 165000 when subtotal-coupon_discount>=5000000 then 0 else 85000 end;
  total:=greatest(0,subtotal-coupon_discount+shipping+tax);
  onum:='MX-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));

  insert into public.orders(order_number,user_id,idempotency_key,currency,status,payment_status,payment_method,shipping_method,
    reservation_expires_at,recipient_name,phone,province,city,postal_code,address_line,plaque,unit,notes,
    subtotal,item_discount,coupon_discount,shipping_amount,tax_amount,total_amount,coupon_code)
  values(onum,uid,idem,'TOMAN',case when pay='online' then 'pending_payment' else 'processing' end,
    case when pay='online' then 'pending' else 'unpaid' end,pay,ship,reservation_expiry,
    nullif(addr->>'recipientName',''),nullif(addr->>'phone',''),nullif(addr->>'province',''),nullif(addr->>'city',''),
    nullif(addr->>'postalCode',''),nullif(addr->>'addressLine',''),nullif(addr->>'plaque',''),nullif(addr->>'unit',''),nullif(addr->>'notes',''),
    subtotal,item_discount,coupon_discount,shipping,tax,total,code) returning id into oid;

  for item in select value from jsonb_array_elements(p_payload->'items') order by value->>'product_id' loop
    q:=greatest(1,least(99,coalesce(nullif(item->>'quantity','')::int,1)));
    select * into p from public.products where id=(item->>'product_id')::uuid for update;
    if nullif(item->>'variant_id','') is not null then
      select * into v from public.product_variants where id=(item->>'variant_id')::uuid and product_id=p.id for update;
      price:=case when coalesce(v.sale_price,0)>0 and v.sale_price<v.price then v.sale_price else v.price end;
      update public.product_variants set stock=stock-q where id=v.id;
      insert into public.order_items(order_id,product_id,variant_id,product_name,variant_label,sku,quantity,unit_price,compare_at_price,line_total)
      values(oid,p.id,v.id,p.name_fa,coalesce(v.label,''),coalesce(v.sku,p.sku),q,price,v.price,price*q);
      insert into public.inventory_reservations(order_id,product_id,variant_id,quantity,expires_at,committed_at)
      values(oid,p.id,v.id,q,reservation_expiry,case when pay='online' then null else now() end);
    else
      price:=case when coalesce(p.sale_price,0)>0 and p.sale_price<p.price then p.sale_price else p.price end;
      update public.products set stock=stock-q where id=p.id;
      insert into public.order_items(order_id,product_id,product_name,sku,quantity,unit_price,compare_at_price,line_total)
      values(oid,p.id,p.name_fa,p.sku,q,price,p.price,price*q);
      insert into public.inventory_reservations(order_id,product_id,variant_id,quantity,expires_at,committed_at)
      values(oid,p.id,null,q,reservation_expiry,case when pay='online' then null else now() end);
    end if;
  end loop;

  if coupon_applied then
    insert into public.coupon_usages(coupon_id,user_id,order_id,discount_amount) values(coupon_row.id,uid,oid,coupon_discount);
  end if;
  insert into public.order_events(order_id,event_type,actor_id,message) values(oid,'order_created',uid,'Order created from checkout');
  if pay='online' then insert into public.payment_transactions(order_id,provider,status,amount,currency) values(oid,'pending','pending',total,'TOMAN'); end if;

  return jsonb_build_object('order_id',oid,'order_number',onum,'status',case when pay='online' then 'pending_payment' else 'processing' end,
    'payment_status',case when pay='online' then 'pending' else 'unpaid' end,'payment_required',pay='online','total_amount',total,
    'reservation_expires_at',reservation_expiry,'idempotent',false);
exception when unique_violation then
  select * into existing from public.orders where user_id=uid and idempotency_key=idem limit 1;
  if found then return jsonb_build_object('order_id',existing.id,'order_number',existing.order_number,'status',existing.status,'payment_status',existing.payment_status,'payment_required',existing.payment_method='online' and existing.payment_status <> 'paid','total_amount',existing.total_amount,'reservation_expires_at',existing.reservation_expires_at,'idempotent',true); end if;
  raise;
end;
$$;
revoke all on function public.mx_create_order(jsonb) from public;
grant execute on function public.mx_create_order(jsonb) to authenticated;

-- Customer cancellation with reservation release.
create or replace function public.mx_cancel_order(p_order_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare o record;
begin
  select * into o from public.orders where id=p_order_id and user_id=auth.uid() for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if o.status not in ('processing','pending_payment') then return false; end if;
  perform public.mx_release_order_reservations(p_order_id);
  update public.orders set status='cancelled',payment_status=case when payment_status='paid' then payment_status else 'cancelled' end,cancelled_at=now(),reservation_expires_at=null where id=p_order_id;
  insert into public.order_events(order_id,event_type,actor_id,message) values(p_order_id,'order_cancelled',auth.uid(),'Cancelled by customer');
  return true;
end;
$$;
revoke all on function public.mx_cancel_order(uuid) from public;
grant execute on function public.mx_cancel_order(uuid) to authenticated;

-- Mark payment result. Only service role may call this function.
create or replace function public.mx_mark_payment_result(p_order_id uuid,p_provider text,p_external_id text,p_status text,p_raw jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o record;
 tid uuid;
begin
  if p_status not in ('paid','failed','cancelled') then raise exception 'INVALID_PAYMENT_STATUS'; end if;
  select * into o from public.orders where id=p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  select id into tid from public.payment_transactions where order_id=p_order_id order by created_at desc limit 1;
  if p_status='paid' then
    if tid is null then insert into public.payment_transactions(order_id,provider,external_payment_id,status,amount,currency,raw_response) values(p_order_id,p_provider,p_external_id,'paid',o.total_amount,'TOMAN',p_raw) returning id into tid;
    else update public.payment_transactions set provider=p_provider,external_payment_id=p_external_id,status='paid',raw_response=p_raw,updated_at=now() where id=tid; end if;
    update public.inventory_reservations set committed_at=now(),expires_at=null where order_id=p_order_id and released_at is null and committed_at is null;
    update public.orders set status='paid',payment_status='paid',paid_at=coalesce(paid_at,now()),reservation_expires_at=null where id=p_order_id;
    insert into public.order_events(order_id,event_type,message,metadata) values(p_order_id,'payment_paid','Payment verified',jsonb_build_object('provider',p_provider,'external_id',p_external_id));
  else
    if tid is not null then update public.payment_transactions set provider=p_provider,external_payment_id=p_external_id,status=p_status,raw_response=p_raw,updated_at=now() where id=tid; end if;
    perform public.mx_release_order_reservations(p_order_id);
    update public.orders set status='cancelled',payment_status=case when p_status='failed' then 'failed' else 'cancelled' end,reservation_expires_at=null where id=p_order_id;
    insert into public.order_events(order_id,event_type,message,metadata) values(p_order_id,'payment_failed','Payment not completed',jsonb_build_object('provider',p_provider,'external_id',p_external_id,'status',p_status));
  end if;
  return jsonb_build_object('order_id',p_order_id,'payment_status',(select payment_status from public.orders where id=p_order_id),'order_status',(select status from public.orders where id=p_order_id));
end;
$$;
revoke all on function public.mx_mark_payment_result(uuid,text,text,text,jsonb) from public;
grant execute on function public.mx_mark_payment_result(uuid,text,text,text,jsonb) to service_role;

-- Expire pending reservations; safe to run from a scheduled Edge Function or cron.
create or replace function public.mx_expire_inventory_reservations()
returns integer language plpgsql security definer set search_path=public as $$
declare r record; n integer:=0;
begin
  for r in select distinct order_id from public.inventory_reservations where released_at is null and committed_at is null and expires_at is not null and expires_at<=now() loop
    perform public.mx_release_order_reservations(r.order_id);
    update public.orders set status='cancelled',payment_status=case when payment_status='pending' then 'cancelled' else payment_status end,reservation_expires_at=null where id=r.order_id and status='pending_payment';
    insert into public.order_events(order_id,event_type,message) values(r.order_id,'reservation_expired','Online payment window expired');
    n:=n+1;
  end loop;
  return n;
end;
$$;
revoke all on function public.mx_expire_inventory_reservations() from public;
grant execute on function public.mx_expire_inventory_reservations() to service_role;
