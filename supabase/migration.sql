create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  url text not null,
  title text not null,
  price numeric not null,
  currency text not null default 'CAD',
  shipping_cost numeric,
  total_cost_cad numeric not null,
  condition_raw text not null default '',
  is_broken boolean not null default false,
  images jsonb not null default '[]'::jsonb,
  location text,
  listed_at timestamptz,
  interest_score integer,
  interest_tags jsonb not null default '[]'::jsonb,
  interest_rationale text,
  is_candidate boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (source, source_id)
);

create index if not exists idx_listings_candidate on listings (is_candidate) where is_candidate = true;
create index if not exists idx_listings_score on listings (interest_score desc nulls last);
create index if not exists idx_listings_source on listings (source);

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  source text not null,
  found integer not null default 0,
  inserted integer not null default 0,
  updated integer not null default 0,
  errors integer not null default 0,
  adapter_error text
);

alter table if exists sync_runs
add column if not exists adapter_error text;
