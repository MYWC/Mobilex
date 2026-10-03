-- Mobilex 2.0 Phase 5: account, cloud wishlist, notifications and preferences.
create extension if not exists pgcrypto;

create table if not exists public.wishlist_items(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id,product_id)
);
create index if not exists wishlist_user_idx on public.wishlist_items(user_id,created_at desc);
create index if not exists wishlist_product_idx on public.wishlist_items(product_id);
alter table public.wishlist_items enable row level security;
drop policy if exists wishlist_owner_select on public.wishlist_items;
create policy wishlist_owner_select on public.wishlist_items for select using(auth.uid()=user_id);
drop policy if exists wishlist_owner_insert on public.wishlist_items;
create policy wishlist_owner_insert on public.wishlist_items for insert with check(auth.uid()=user_id);
drop policy if exists wishlist_owner_delete on public.wishlist_items;
create policy wishlist_owner_delete on public.wishlist_items for delete using(auth.uid()=user_id);

create table if not exists public.notifications(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  tone text not null default 'info' check(tone in('info','success','warning','danger')),
  href text,
  read_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id,created_at desc);
create index if not exists notifications_unread_idx on public.notifications(user_id) where read_at is null;
alter table public.notifications enable row level security;
drop policy if exists notifications_owner_select on public.notifications;
create policy notifications_owner_select on public.notifications for select using(auth.uid()=user_id);
drop policy if exists notifications_owner_update on public.notifications;
create policy notifications_owner_update on public.notifications for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists notifications_owner_delete on public.notifications;
create policy notifications_owner_delete on public.notifications for delete using(auth.uid()=user_id);

create table if not exists public.notification_preferences(
  user_id uuid primary key references auth.users(id) on delete cascade,
  marketing_email boolean not null default true,
  order_email boolean not null default true,
  push_notifications boolean not null default true,
  price_drop_alerts boolean not null default true,
  restock_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
drop policy if exists notification_preferences_owner_select on public.notification_preferences;
create policy notification_preferences_owner_select on public.notification_preferences for select using(auth.uid()=user_id);
drop policy if exists notification_preferences_owner_insert on public.notification_preferences;
create policy notification_preferences_owner_insert on public.notification_preferences for insert with check(auth.uid()=user_id);
drop policy if exists notification_preferences_owner_update on public.notification_preferences;
create policy notification_preferences_owner_update on public.notification_preferences for update using(auth.uid()=user_id) with check(auth.uid()=user_id);

-- Realtime publication is safe to execute repeatedly with a DO block.
do $$
begin
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
end $$;
