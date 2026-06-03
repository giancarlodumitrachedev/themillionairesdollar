-- ============================================================
-- The Millionaire's Dollar — initial schema
-- ============================================================
-- Security model (hardened vs. the PRD's literal RLS, which would have
-- exposed email/phone to anonymous visitors):
--
--   * `participants` holds PII and is locked down: only admins (via the
--     admin_whitelist) may read/write it. Anonymous visitors get NOTHING.
--   * A `public_tiles` VIEW exposes ONLY non-sensitive columns of public
--     rows, and is granted to anon/authenticated.
--   * A `counters` table holds the live total, readable by anon and wired to
--     Realtime, so the hero counter can update without exposing participants.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Admin whitelist
-- ------------------------------------------------------------
create table if not exists admin_whitelist (
  email text primary key
);

-- ------------------------------------------------------------
-- Participants (PII — locked down)
-- ------------------------------------------------------------
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  tile_number serial unique not null,
  tier text not null check (tier in
    ('existence','verified','founding','permanent','patron','curators_circle')),
  amount_paid_cents integer not null,

  email text not null,
  display_name text not null,
  display_as text not null check (display_as in ('initials','full_name')),

  country_code text not null,
  city text,
  latitude decimal(10,7),
  longitude decimal(10,7),

  year_became_millionaire integer
    check (year_became_millionaire is null
      or (year_became_millionaire between 1900 and 2100)),
  personal_message text check (personal_message is null or char_length(personal_message) <= 60),

  linkedin_url text,
  business_email text,
  source_of_wealth text,
  phone_number text,

  consent_participation boolean not null default true,
  consent_future_contact boolean not null default false,
  consent_newsletter boolean not null default false,

  is_public boolean not null default true,
  removal_requested_at timestamptz,

  vetting_status text not null default 'none'
    check (vetting_status in ('none','pending','in_progress','approved','rejected')),
  vetting_notes jsonb not null default '{}'::jsonb,

  stripe_payment_intent_id text,
  stripe_customer_id text,

  is_seed_participant boolean not null default false,

  -- Wall management
  is_highlighted boolean not null default false
);

create index if not exists idx_participants_tier on participants(tier);
create index if not exists idx_participants_country on participants(country_code);
create index if not exists idx_participants_year on participants(year_became_millionaire);
create index if not exists idx_participants_public on participants(is_public) where is_public = true;
create index if not exists idx_participants_created on participants(created_at desc);

-- ------------------------------------------------------------
-- Site settings (tier enable/disable, etc.) — key/value JSON
-- ------------------------------------------------------------
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Per-tier manual enable/disable overrides (null = follow revenue gating).
insert into site_settings (key, value)
values ('tier_overrides', '{}'::jsonb)
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- Press coverage
-- ------------------------------------------------------------
create table if not exists press_coverage (
  id uuid primary key default gen_random_uuid(),
  publication_name text not null,
  publication_logo_url text,
  article_url text not null,
  article_title text not null,
  quote text,
  published_at date,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Admin action log
-- ------------------------------------------------------------
create table if not exists admin_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Newsletter subscribers
-- ------------------------------------------------------------
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  source text,
  participant_id uuid references participants(id) on delete set null
);

-- ------------------------------------------------------------
-- Live counters (anon-readable, Realtime source)
-- ------------------------------------------------------------
create table if not exists counters (
  id text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into counters (id, value)
values ('participants_total', 0), ('revenue_total_cents', 0)
on conflict (id) do nothing;

-- Keep the total count and total revenue in sync with public participants.
create or replace function refresh_participants_counter()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update counters
     set value = (select count(*) from participants where is_public = true),
         updated_at = now()
   where id = 'participants_total';
  update counters
     set value = coalesce((select sum(amount_paid_cents) from participants where is_public = true), 0),
         updated_at = now()
   where id = 'revenue_total_cents';
  return null;
end;
$$;

drop trigger if exists trg_participants_counter on participants;
create trigger trg_participants_counter
  after insert or update of is_public or delete on participants
  for each statement
  execute function refresh_participants_counter();

-- ------------------------------------------------------------
-- Public-safe view (NO email / phone / business data)
-- ------------------------------------------------------------
create or replace view public_tiles as
  select
    id,
    tile_number,
    tier,
    display_name,
    display_as,
    country_code,
    city,
    latitude,
    longitude,
    year_became_millionaire,
    personal_message,
    is_highlighted,
    created_at
  from participants
  where is_public = true;

-- ------------------------------------------------------------
-- Aggregate public stats (materialized; refresh on a schedule)
-- ------------------------------------------------------------
drop materialized view if exists public_stats;
create materialized view public_stats as
  with base as (
    select country_code, created_at
    from participants
    where is_public = true
  ),
  per_country as (
    select country_code, count(*)::int as c
    from base
    group by country_code
  )
  select
    (select count(*) from base)::int as total_participants,
    (select count(*) from base where created_at > now() - interval '24 hours')::int as last_24h,
    (select count(*) from base where created_at > now() - interval '7 days')::int as last_week,
    (select count(*) from per_country)::int as countries,
    coalesce((select jsonb_object_agg(country_code, c) from per_country), '{}'::jsonb) as by_country;

create unique index if not exists idx_public_stats_singleton
  on public_stats ((total_participants is not null));

create or replace function refresh_public_stats()
returns void
language sql
security definer
set search_path = public
as $$
  refresh materialized view concurrently public_stats;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table participants enable row level security;
alter table press_coverage enable row level security;
alter table admin_log enable row level security;
alter table newsletter_subscribers enable row level security;
alter table counters enable row level security;
alter table admin_whitelist enable row level security;
alter table site_settings enable row level security;

-- Admins (whitelisted) get full access to participants.
drop policy if exists "admin_full_access_participants" on participants;
create policy "admin_full_access_participants" on participants
  for all
  using (auth.email() in (select email from admin_whitelist))
  with check (auth.email() in (select email from admin_whitelist));

-- Press coverage: world-readable, admin-writable.
drop policy if exists "public_read_press" on press_coverage;
create policy "public_read_press" on press_coverage
  for select using (true);
drop policy if exists "admin_write_press" on press_coverage;
create policy "admin_write_press" on press_coverage
  for all
  using (auth.email() in (select email from admin_whitelist))
  with check (auth.email() in (select email from admin_whitelist));

-- Counters: world-readable, no public write.
drop policy if exists "public_read_counters" on counters;
create policy "public_read_counters" on counters
  for select using (true);

-- Site settings: world-readable (tier overrides), admin-writable.
drop policy if exists "public_read_settings" on site_settings;
create policy "public_read_settings" on site_settings
  for select using (true);
drop policy if exists "admin_write_settings" on site_settings;
create policy "admin_write_settings" on site_settings
  for all
  using (auth.email() in (select email from admin_whitelist))
  with check (auth.email() in (select email from admin_whitelist));

-- Newsletter: admin read; inserts happen via service role (webhook/api).
drop policy if exists "admin_read_newsletter" on newsletter_subscribers;
create policy "admin_read_newsletter" on newsletter_subscribers
  for select
  using (auth.email() in (select email from admin_whitelist));

-- Admin log + whitelist: admin-only.
drop policy if exists "admin_read_log" on admin_log;
create policy "admin_read_log" on admin_log
  for select
  using (auth.email() in (select email from admin_whitelist));
drop policy if exists "admin_read_whitelist" on admin_whitelist;
create policy "admin_read_whitelist" on admin_whitelist
  for select
  using (auth.email() in (select email from admin_whitelist));

-- ============================================================
-- Grants for the safe view + stats
-- ============================================================
grant select on public_tiles to anon, authenticated;
grant select on counters to anon, authenticated;
grant select on press_coverage to anon, authenticated;
grant select on site_settings to anon, authenticated;

-- public_stats is read server-side (service role) only — keep it off the public API.
revoke select on public_stats from anon, authenticated;

-- These SECURITY DEFINER functions are a trigger fn and an admin/cron fn;
-- they must not be callable via the public RPC endpoint.
revoke execute on function refresh_participants_counter() from anon, authenticated, public;
revoke execute on function refresh_public_stats() from anon, authenticated, public;

-- ============================================================
-- Realtime: publish the counters table only.
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table counters;
