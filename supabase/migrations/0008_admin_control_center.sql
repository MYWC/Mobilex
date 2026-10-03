-- Mobilex 2.0 Phase 6: Admin Control Center, RBAC, audit trail, content and inventory ops.
create extension if not exists pgcrypto;

-- Ensure the account profile contract exists for installations that started from the Phase 5 package.
create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check(role in('admin','product_manager','warehouse','support','customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
create index if not exists profiles_role_idx on public.profiles(role);
alter table public.profiles enable row level security;

create or replace function public.mx_current_role()
returns text language sql stable security definer set search_path=public as $$
  select coalesce((select p.role from public.profiles p where p.id=auth.uid()), 'customer');
$$;
revoke all on function public.mx_current_role() from public;
grant execute on function public.mx_current_role() to authenticated;

create or replace function public.mx_is_staff()
returns boolean language sql stable security definer set search_path=public as $$
  select public.mx_current_role() in('admin','product_manager','warehouse','support');
$$;
revoke all on function public.mx_is_staff() from public;
grant execute on function public.mx_is_staff() to authenticated;


drop policy if exists profiles_owner_select on public.profiles;
create policy profiles_owner_select on public.profiles for select using(auth.uid()=id or public.mx_current_role() in('admin','support'));
drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);


create table if not exists public.audit_logs(
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  severity text not null default 'info' check(severity in('info','success','warning','danger')),
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type,entity_id,created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id,created_at desc);
alter table public.audit_logs enable row level security;

create table if not exists public.inventory_adjustments(
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  delta integer not null,
  resulting_stock integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index if not exists inventory_adjustments_product_idx on public.inventory_adjustments(product_id,created_at desc);
create index if not exists inventory_adjustments_actor_idx on public.inventory_adjustments(actor_id,created_at desc);
alter table public.inventory_adjustments enable row level security;

create table if not exists public.site_banners(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  href text,
  placement text not null default 'home_hero',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists site_banners_placement_idx on public.site_banners(placement,sort_order);
alter table public.site_banners enable row level security;

create table if not exists public.content_blocks(
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  body text,
  kind text not null default 'rich_text' check(kind in('announcement','rich_text','feature','faq')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_blocks_active_idx on public.content_blocks(is_active,updated_at desc);
alter table public.content_blocks enable row level security;

create table if not exists public.system_settings(
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.system_settings enable row level security;

-- Read policies: staff only for admin datasets, active content public.
drop policy if exists audit_staff_select on public.audit_logs;
create policy audit_staff_select on public.audit_logs for select using(public.mx_current_role()='admin');
drop policy if exists inventory_adjustments_staff_select on public.inventory_adjustments;
create policy inventory_adjustments_staff_select on public.inventory_adjustments for select using(public.mx_current_role() in('admin','product_manager','warehouse'));
drop policy if exists site_banners_public_select on public.site_banners;
create policy site_banners_public_select on public.site_banners for select using(is_active=true and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now()));
drop policy if exists site_banners_admin_all on public.site_banners;
create policy site_banners_admin_all on public.site_banners for all using(public.mx_current_role()='admin') with check(public.mx_current_role()='admin');
drop policy if exists content_blocks_public_select on public.content_blocks;
create policy content_blocks_public_select on public.content_blocks for select using(is_active=true);
drop policy if exists content_blocks_admin_all on public.content_blocks;
create policy content_blocks_admin_all on public.content_blocks for all using(public.mx_current_role()='admin') with check(public.mx_current_role()='admin');
drop policy if exists system_settings_public_select on public.system_settings;
create policy system_settings_public_select on public.system_settings for select using(is_public=true);
drop policy if exists system_settings_admin_all on public.system_settings;
create policy system_settings_admin_all on public.system_settings for all using(public.mx_current_role()='admin') with check(public.mx_current_role()='admin');

create or replace function public.mx_admin_update_order_status(p_order_id uuid,p_status text,p_message text default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare r record; old_status text;
  valid boolean := p_status in('pending_payment','processing','paid','packed','shipped','delivered','cancelled','returned');
  staff boolean := public.mx_current_role() in('admin','warehouse','support');
begin
  if not staff then raise exception 'FORBIDDEN'; end if;
  if not valid then raise exception 'INVALID_ORDER_STATUS'; end if;
  select * into r from public.orders where id=p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  old_status:=r.status;
  if old_status=p_status then return true; end if;
  if p_status='delivered' and r.payment_method='online' and r.payment_status<>'paid' then raise exception 'PAYMENT_REQUIRED'; end if;
  update public.orders set status=p_status,updated_at=now(),cancelled_at=case when p_status='cancelled' then coalesce(cancelled_at,now()) else cancelled_at end where id=p_order_id;
  insert into public.order_events(order_id,event_type,actor_id,message,metadata) values(p_order_id,'admin_status_changed',auth.uid(),coalesce(p_message,'Admin status update'),jsonb_build_object('from',old_status,'to',p_status));
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,severity,summary,metadata) values(auth.uid(),'update_order_status','order',p_order_id::text,'success','وضعیت سفارش تغییر کرد',jsonb_build_object('from',old_status,'to',p_status));
  return true;
end;
$$;
revoke all on function public.mx_admin_update_order_status(uuid,text,text) from public;
grant execute on function public.mx_admin_update_order_status(uuid,text,text) to authenticated;

create or replace function public.mx_admin_set_user_role(p_user_id uuid,p_role text)
returns boolean language plpgsql security definer set search_path=public as $$
declare old_role text;
begin
  if public.mx_current_role()<>'admin' then raise exception 'FORBIDDEN'; end if;
  if p_role not in('admin','product_manager','warehouse','support','customer') then raise exception 'INVALID_ROLE'; end if;
  select role into old_role from public.profiles where id=p_user_id for update;
  if old_role is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  update public.profiles set role=p_role,updated_at=now() where id=p_user_id;
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,severity,summary,metadata) values(auth.uid(),'update_user_role','user',p_user_id::text,'success','نقش کاربر تغییر کرد',jsonb_build_object('from',old_role,'to',p_role));
  return true;
end;
$$;
revoke all on function public.mx_admin_set_user_role(uuid,text) from public;
grant execute on function public.mx_admin_set_user_role(uuid,text) to authenticated;

create or replace function public.mx_admin_adjust_inventory(p_product_id uuid,p_variant_id uuid,p_delta integer,p_reason text)
returns integer language plpgsql security definer set search_path=public as $$
declare result_stock integer; product_name text;
begin
  if public.mx_current_role() not in('admin','product_manager','warehouse') then raise exception 'FORBIDDEN'; end if;
  if p_delta=0 then raise exception 'NO_CHANGE'; end if;
  if p_variant_id is not null then
    select stock into result_stock from public.product_variants where id=p_variant_id and product_id=p_product_id for update;
    if result_stock is null then raise exception 'VARIANT_NOT_FOUND'; end if;
    result_stock:=result_stock+p_delta; if result_stock<0 then raise exception 'NEGATIVE_STOCK'; end if;
    update public.product_variants set stock=result_stock where id=p_variant_id;
  else
    select stock into result_stock from public.products where id=p_product_id for update;
    if result_stock is null then raise exception 'PRODUCT_NOT_FOUND'; end if;
    result_stock:=result_stock+p_delta; if result_stock<0 then raise exception 'NEGATIVE_STOCK'; end if;
    update public.products set stock=result_stock,updated_at=now() where id=p_product_id;
  end if;
  insert into public.inventory_adjustments(actor_id,product_id,variant_id,delta,resulting_stock,reason) values(auth.uid(),p_product_id,p_variant_id,p_delta,result_stock,p_reason);
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,severity,summary,metadata) values(auth.uid(),'adjust_inventory','inventory',coalesce(p_variant_id,p_product_id)::text,'success','موجودی اصلاح شد',jsonb_build_object('delta',p_delta,'resulting_stock',result_stock,'reason',p_reason));
  return result_stock;
end;
$$;
revoke all on function public.mx_admin_adjust_inventory(uuid,uuid,integer,text) from public;
grant execute on function public.mx_admin_adjust_inventory(uuid,uuid,integer,text) to authenticated;

-- Keep updated_at fresh for admin-managed content and settings.
create or replace function public.mx_touch_admin_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists site_banners_touch_updated on public.site_banners;
create trigger site_banners_touch_updated before update on public.site_banners for each row execute function public.mx_touch_admin_updated_at();
drop trigger if exists content_blocks_touch_updated on public.content_blocks;
create trigger content_blocks_touch_updated before update on public.content_blocks for each row execute function public.mx_touch_admin_updated_at();
drop trigger if exists system_settings_touch_updated on public.system_settings;
create trigger system_settings_touch_updated before update on public.system_settings for each row execute function public.mx_touch_admin_updated_at();
