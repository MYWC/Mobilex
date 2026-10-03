-- Mobilex 2.0 Final Release payment reconciliation hardening.
-- Apply after 0009_growth_engine.sql.

create table if not exists public.payment_webhook_events(
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  provider text not null,
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_id text not null,
  status text not null check(status in ('paid','failed','cancelled')),
  amount numeric(14,2) not null default 0 check(amount>=0),
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists payment_webhook_event_unique_idx on public.payment_webhook_events(provider,event_id);
create index if not exists payment_webhook_order_idx on public.payment_webhook_events(order_id,created_at desc);

alter table public.payment_webhook_events enable row level security;
drop policy if exists payment_webhook_owner_select on public.payment_webhook_events;
create policy payment_webhook_owner_select on public.payment_webhook_events
  for select using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

-- Only server-side service_role writes webhook events.
revoke all on public.payment_webhook_events from anon, authenticated;
grant select on public.payment_webhook_events to authenticated;

create index if not exists payment_webhook_pending_idx on public.payment_webhook_events(provider,event_id) where processed_at is null;
