-- Mobilex 2.0 Phase 9: Growth / community / support foundation
create extension if not exists pgcrypto;

create table if not exists public.growth_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  event_name text not null check (char_length(event_name) <= 80),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists growth_events_user_idx on public.growth_events(user_id, created_at desc);
create index if not exists growth_events_name_idx on public.growth_events(event_name, created_at desc);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null check (char_length(body) between 8 and 5000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_verified_purchase boolean not null default false,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_reviews_product_idx on public.product_reviews(product_id, status, created_at desc);
create unique index if not exists product_reviews_user_product_ux on public.product_reviews(product_id, user_id) where status <> 'rejected';

create table if not exists public.product_questions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null check (char_length(question) between 8 and 2000),
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  answer_count integer not null default 0 check (answer_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_questions_product_idx on public.product_questions(product_id, status, created_at desc);

create table if not exists public.product_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.product_questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 4000),
  is_official boolean not null default false,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists product_answers_question_idx on public.product_answers(question_id, status, created_at asc);

create table if not exists public.loyalty_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  lifetime_points integer not null default 0 check (lifetime_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('earn','redeem','adjust')),
  points integer not null check (points <> 0),
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists loyalty_transactions_user_idx on public.loyalty_transactions(user_id, created_at desc);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticket_number text not null unique default ('MX-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  subject text not null check (char_length(subject) between 3 and 180),
  category text not null default 'general',
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','pending','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on public.support_tickets(user_id, created_at desc);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  sender_type text not null check (sender_type in ('customer','agent')),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index if not exists support_messages_ticket_idx on public.support_messages(ticket_id, created_at asc);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fa text not null,
  title_en text,
  description_fa text,
  description_en text,
  badge text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  discount_percent numeric(5,2),
  coupon_code text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

alter table public.growth_events enable row level security;
alter table public.product_reviews enable row level security;
alter table public.product_questions enable row level security;
alter table public.product_answers enable row level security;
alter table public.loyalty_accounts enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.promotions enable row level security;

drop policy if exists growth_events_insert on public.growth_events;
create policy growth_events_insert on public.growth_events for insert with check (auth.uid() is null or user_id = auth.uid());
drop policy if exists growth_events_self_select on public.growth_events;
create policy growth_events_self_select on public.growth_events for select using (user_id = auth.uid());

drop policy if exists reviews_public_select on public.product_reviews;
create policy reviews_public_select on public.product_reviews for select using (status = 'approved' or user_id = auth.uid());
drop policy if exists reviews_self_insert on public.product_reviews;
create policy reviews_self_insert on public.product_reviews for insert with check (user_id = auth.uid());
drop policy if exists reviews_self_update on public.product_reviews;
create policy reviews_self_update on public.product_reviews for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists questions_public_select on public.product_questions;
create policy questions_public_select on public.product_questions for select using (status = 'published' or user_id = auth.uid());
drop policy if exists questions_self_insert on public.product_questions;
create policy questions_self_insert on public.product_questions for insert with check (user_id = auth.uid());

drop policy if exists answers_public_select on public.product_answers;
create policy answers_public_select on public.product_answers for select using (status = 'published' or user_id = auth.uid());
drop policy if exists answers_self_insert on public.product_answers;
create policy answers_self_insert on public.product_answers for insert with check (user_id = auth.uid());

drop policy if exists loyalty_self_select on public.loyalty_accounts;
create policy loyalty_self_select on public.loyalty_accounts for select using (user_id = auth.uid());
drop policy if exists loyalty_tx_self_select on public.loyalty_transactions;
create policy loyalty_tx_self_select on public.loyalty_transactions for select using (user_id = auth.uid());

drop policy if exists tickets_self_select on public.support_tickets;
create policy tickets_self_select on public.support_tickets for select using (user_id = auth.uid());
drop policy if exists tickets_self_insert on public.support_tickets;
create policy tickets_self_insert on public.support_tickets for insert with check (user_id = auth.uid());
drop policy if exists messages_ticket_self_select on public.support_messages;
create policy messages_ticket_self_select on public.support_messages for select using (exists(select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));
drop policy if exists messages_ticket_self_insert on public.support_messages;
create policy messages_ticket_self_insert on public.support_messages for insert with check (user_id = auth.uid() and exists(select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));

drop policy if exists promotions_public_select on public.promotions;
create policy promotions_public_select on public.promotions for select using (active = true and starts_at <= now() and ends_at >= now());

create or replace function public.mx_mark_review_helpful(p_review_id uuid) returns boolean language plpgsql security definer set search_path=public as $$
begin update public.product_reviews set helpful_count=helpful_count+1 where id=p_review_id and status='approved'; return found; end; $$;
revoke all on function public.mx_mark_review_helpful(uuid) from public;
grant execute on function public.mx_mark_review_helpful(uuid) to authenticated;

create or replace function public.mx_create_support_ticket(p_subject text,p_category text,p_priority text,p_body text) returns public.support_tickets language plpgsql security definer set search_path=public as $$
declare t public.support_tickets;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  insert into public.support_tickets(user_id,subject,category,priority) values(auth.uid(),trim(p_subject),p_category,p_priority) returning * into t;
  insert into public.support_messages(ticket_id,user_id,sender_type,body) values(t.id,auth.uid(),'customer',trim(p_body));
  return t;
end; $$;
revoke all on function public.mx_create_support_ticket(text,text,text,text) from public;
grant execute on function public.mx_create_support_ticket(text,text,text,text) to authenticated;

-- Helpful trigger: maintain question answer_count.
create or replace function public.mx_sync_question_answer_count() returns trigger language plpgsql security definer set search_path=public as $$
begin update public.product_questions set answer_count=(select count(*) from public.product_answers a where a.question_id=coalesce(new.question_id,old.question_id) and a.status='published') where id=coalesce(new.question_id,old.question_id); return coalesce(new,old); end; $$;
drop trigger if exists trg_question_answer_count on public.product_answers;
create trigger trg_question_answer_count after insert or update or delete on public.product_answers for each row execute function public.mx_sync_question_answer_count();


create or replace function public.mx_redeem_loyalty_points(p_points integer, p_description text) returns public.loyalty_accounts language plpgsql security definer set search_path=public as $$
declare a public.loyalty_accounts;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_points <= 0 then raise exception 'INVALID_POINTS'; end if;
  select * into a from public.loyalty_accounts where user_id=auth.uid() for update;
  if a.user_id is null then raise exception 'LOYALTY_ACCOUNT_NOT_FOUND'; end if;
  if a.points < p_points then raise exception 'INSUFFICIENT_POINTS'; end if;
  update public.loyalty_accounts set points=points-p_points, updated_at=now() where user_id=auth.uid() returning * into a;
  insert into public.loyalty_transactions(user_id,type,points,description,metadata) values(auth.uid(),'redeem',-p_points,trim(p_description),'{}'::jsonb);
  return a;
end; $$;
revoke all on function public.mx_redeem_loyalty_points(integer,text) from public;
grant execute on function public.mx_redeem_loyalty_points(integer,text) to authenticated;
