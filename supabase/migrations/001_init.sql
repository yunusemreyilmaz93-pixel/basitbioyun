-- BasitBiOyun core schema (API-ready, mock-compatible)
-- Apply in Supabase SQL editor or: supabase db push

create extension if not exists "pgcrypto";

-- ─── Leagues / competitions ─────────────────────────────────────────
create table if not exists public.leagues (
  id text primary key,
  name text not null,
  full_name text,
  code text,
  country text,
  confederation text,
  teams int,
  players int,
  foreigners_pct numeric,
  avg_age numeric,
  total_value numeric,
  season_id text default '2025-26',
  zones jsonb default '{}'::jsonb,
  standings jsonb default '[]'::jsonb,
  all_time jsonb default '[]'::jsonb,
  leaders jsonb default '{}'::jsonb,
  best_xi jsonb default '[]'::jsonb,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Clubs ──────────────────────────────────────────────────────────
create table if not exists public.clubs (
  id text primary key,
  name text not null,
  short text,
  league text,
  league_code text,
  league_id text references public.leagues(id) on delete set null,
  country text,
  founded int,
  squad_size int,
  avg_age numeric,
  foreigners_pct numeric,
  squad_value numeric,
  stadium jsonb default '{}'::jsonb,
  formation text,
  manager jsonb default '{}'::jsonb,
  squad jsonb default '[]'::jsonb,
  starting_xi jsonb default '[]'::jsonb,
  standings jsonb default '[]'::jsonb,
  transfers jsonb default '{}'::jsonb,
  last_results jsonb default '[]'::jsonb,
  next_fixtures jsonb default '[]'::jsonb,
  external_ids jsonb default '{}'::jsonb,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists clubs_league_id_idx on public.clubs(league_id);
create index if not exists clubs_short_idx on public.clubs(short);

-- ─── Players ────────────────────────────────────────────────────────
create table if not exists public.players (
  id text primary key,
  name text not null,
  age int,
  pos text,
  pos_group text,
  foot text,
  club text,
  club_id text references public.clubs(id) on delete set null,
  club_short text,
  nation jsonb default '{}'::jsonb,
  value numeric,
  form numeric,
  goals int default 0,
  assists int default 0,
  contract_until int,
  status text,
  loan boolean default false,
  height text,
  agent text,
  joined text,
  outfitter text,
  season_stats jsonb default '{}'::jsonb,
  smv jsonb default '{}'::jsonb,
  value_history jsonb default '[]'::jsonb,
  transfers jsonb default '[]'::jsonb,
  positions jsonb default '{}'::jsonb,
  external_ids jsonb default '{}'::jsonb,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists players_club_id_idx on public.players(club_id);
create index if not exists players_value_idx on public.players(value desc nulls last);
create index if not exists players_name_idx on public.players using gin (to_tsvector('simple', coalesce(name, '')));

-- ─── Player detail dossiers (stats deep dive) ───────────────────────
create table if not exists public.player_details (
  player_id text primary key references public.players(id) on delete cascade,
  competitions jsonb default '[]'::jsonb,
  career jsonb default '[]'::jsonb,
  injuries jsonb default '[]'::jsonb,
  national_team jsonb default '{}'::jsonb,
  smart jsonb default '{}'::jsonb,
  trophies jsonb default '[]'::jsonb,
  meta jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ─── Managers ───────────────────────────────────────────────────────
create table if not exists public.managers (
  id text primary key,
  name text not null,
  age int,
  nation jsonb default '{}'::jsonb,
  club text,
  club_id text references public.clubs(id) on delete set null,
  club_code text,
  employed boolean default true,
  formation text,
  formation_label text,
  matches int default 0,
  win_pct numeric,
  ppg numeric,
  contract_until text,
  licence text,
  style text,
  career jsonb default '[]'::jsonb,
  talents jsonb default '[]'::jsonb,
  metrics jsonb default '{}'::jsonb,
  external_ids jsonb default '{}'::jsonb,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Nations ────────────────────────────────────────────────────────
create table if not exists public.nations (
  id text primary key,
  name text not null,
  code text,
  confederation text,
  fifa_rank int,
  squad_value numeric,
  association text,
  stadium jsonb default '{}'::jsonb,
  coach jsonb default '{}'::jsonb,
  colors jsonb default '{}'::jsonb,
  squad jsonb default '[]'::jsonb,
  fixtures jsonb default '[]'::jsonb,
  trophies jsonb default '[]'::jsonb,
  legends jsonb default '{}'::jsonb,
  ranking_history jsonb default '[]'::jsonb,
  external_ids jsonb default '{}'::jsonb,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Matches ────────────────────────────────────────────────────────
create table if not exists public.matches (
  id text primary key,
  season_id text default '2025-26',
  league text,
  league_code text,
  league_id text references public.leagues(id) on delete set null,
  status text not null default 'upcoming',
  kickoff text,
  clock text,
  md int,
  attendance int,
  referee text,
  home jsonb not null default '{}'::jsonb,
  away jsonb not null default '{}'::jsonb,
  stats jsonb default '{}'::jsonb,
  events jsonb default '[]'::jsonb,
  momentum jsonb default '[]'::jsonb,
  external_ids jsonb default '{}'::jsonb,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists matches_status_idx on public.matches(status);
create index if not exists matches_league_id_idx on public.matches(league_id);

-- ─── Market (transfers, rumors, movers) ─────────────────────────────
create table if not exists public.transfers (
  id text primary key,
  player_name text,
  player_id text references public.players(id) on delete set null,
  from_club text,
  from_club_id text,
  to_club text,
  to_club_id text,
  fee numeric,
  fee_type text,
  pos text,
  date text,
  window_id text default '2026-summer',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.rumors (
  id text primary key,
  player_name text,
  player_id text references public.players(id) on delete set null,
  from_club text,
  to_club text,
  probability int,
  tier int,
  source text,
  ask numeric,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.value_movers (
  id text primary key,
  player_name text,
  player_id text references public.players(id) on delete set null,
  club text,
  direction text check (direction in ('up', 'down')),
  pct numeric,
  value numeric,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ─── Public read access (anon) ──────────────────────────────────────
alter table public.leagues enable row level security;
alter table public.clubs enable row level security;
alter table public.players enable row level security;
alter table public.player_details enable row level security;
alter table public.managers enable row level security;
alter table public.nations enable row level security;
alter table public.matches enable row level security;
alter table public.transfers enable row level security;
alter table public.rumors enable row level security;
alter table public.value_movers enable row level security;

-- Drop policies if re-running
do $$ begin
  execute 'drop policy if exists "public read leagues" on public.leagues';
  execute 'drop policy if exists "public read clubs" on public.clubs';
  execute 'drop policy if exists "public read players" on public.players';
  execute 'drop policy if exists "public read player_details" on public.player_details';
  execute 'drop policy if exists "public read managers" on public.managers';
  execute 'drop policy if exists "public read nations" on public.nations';
  execute 'drop policy if exists "public read matches" on public.matches';
  execute 'drop policy if exists "public read transfers" on public.transfers';
  execute 'drop policy if exists "public read rumors" on public.rumors';
  execute 'drop policy if exists "public read value_movers" on public.value_movers';
exception when others then null;
end $$;

create policy "public read leagues" on public.leagues for select using (true);
create policy "public read clubs" on public.clubs for select using (true);
create policy "public read players" on public.players for select using (true);
create policy "public read player_details" on public.player_details for select using (true);
create policy "public read managers" on public.managers for select using (true);
create policy "public read nations" on public.nations for select using (true);
create policy "public read matches" on public.matches for select using (true);
create policy "public read transfers" on public.transfers for select using (true);
create policy "public read rumors" on public.rumors for select using (true);
create policy "public read value_movers" on public.value_movers for select using (true);
