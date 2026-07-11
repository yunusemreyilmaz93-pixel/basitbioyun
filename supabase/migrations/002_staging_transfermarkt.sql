-- ============================================================
-- BasitBiOyun — Staging tables for Transfermarkt CSV import
-- Folder: Desktop/football_datasets/archive/
-- Run once in Supabase → SQL Editor → New query → Run
-- ============================================================

create schema if not exists staging;

-- 1) competitions.csv
create table if not exists staging.competitions (
  competition_id text primary key,
  competition_code text,
  name text,
  sub_type text,
  type text,
  country_id text,
  country_name text,
  domestic_league_code text,
  confederation text,
  total_clubs int,
  url text
);

-- 2) countries.csv
create table if not exists staging.countries (
  country_id text primary key,
  country_name text,
  country_code text,
  confederation text,
  total_clubs int,
  total_players int,
  average_age numeric,
  url text
);

-- 3) national_teams.csv
create table if not exists staging.national_teams (
  national_team_id text primary key,
  name text,
  team_code text,
  country_id text,
  country_name text,
  country_code text,
  confederation text,
  team_image_url text,
  squad_size int,
  average_age numeric,
  foreigners_number int,
  foreigners_percentage numeric,
  total_market_value numeric,
  coach_name text,
  fifa_ranking int,
  last_season int,
  url text
);

-- 4) clubs.csv
create table if not exists staging.clubs (
  club_id text primary key,
  club_code text,
  name text,
  domestic_competition_id text,
  total_market_value numeric,
  squad_size int,
  average_age numeric,
  foreigners_number int,
  foreigners_percentage numeric,
  national_team_players int,
  stadium_name text,
  stadium_seats int,
  net_transfer_record text,
  coach_name text,
  last_season int,
  filename text,
  url text
);

-- 5) players.csv  (~50k rows)
create table if not exists staging.players (
  player_id text primary key,
  first_name text,
  last_name text,
  name text,
  last_season int,
  current_club_id text,
  player_code text,
  country_of_birth text,
  city_of_birth text,
  country_of_citizenship text,
  date_of_birth text,
  sub_position text,
  position text,
  foot text,
  height_in_cm int,
  contract_expiration_date text,
  agent_name text,
  image_url text,
  international_caps int,
  international_goals int,
  current_national_team_id text,
  url text,
  current_club_domestic_competition_id text,
  current_club_name text,
  market_value_in_eur numeric,
  highest_market_value_in_eur numeric
);

-- 6) player_valuations.csv  (~500k rows)
create table if not exists staging.player_valuations (
  id bigserial primary key,
  player_id text,
  date text,
  market_value_in_eur numeric,
  current_club_name text,
  current_club_id text,
  player_club_domestic_competition_id text
);
create index if not exists stg_pv_player_idx on staging.player_valuations(player_id);

-- 7) transfers.csv
create table if not exists staging.transfers (
  id bigserial primary key,
  player_id text,
  transfer_date text,
  transfer_season text,
  from_club_id text,
  to_club_id text,
  from_club_name text,
  to_club_name text,
  transfer_fee numeric,
  market_value_in_eur numeric,
  player_name text
);
create index if not exists stg_tr_player_idx on staging.transfers(player_id);

-- 8) games.csv  (~90k rows)
create table if not exists staging.games (
  game_id text primary key,
  competition_id text,
  season int,
  round text,
  date text,
  home_club_id text,
  away_club_id text,
  home_club_goals int,
  away_club_goals int,
  home_club_position int,
  away_club_position int,
  home_club_manager_name text,
  away_club_manager_name text,
  stadium text,
  attendance int,
  referee text,
  url text,
  home_club_formation text,
  away_club_formation text,
  home_club_name text,
  away_club_name text,
  aggregate text,
  competition_type text
);

-- 9) appearances.csv  (~1.9M rows — later, not day 1)
create table if not exists staging.appearances (
  appearance_id text primary key,
  game_id text,
  player_id text,
  player_club_id text,
  player_current_club_id text,
  date text,
  player_name text,
  competition_id text,
  yellow_cards int,
  red_cards int,
  goals int,
  assists int,
  minutes_played int
);
create index if not exists stg_app_player_idx on staging.appearances(player_id);
create index if not exists stg_app_game_idx on staging.appearances(game_id);

-- Public read (optional; site will mostly use product tables later)
alter table staging.competitions enable row level security;
alter table staging.countries enable row level security;
alter table staging.national_teams enable row level security;
alter table staging.clubs enable row level security;
alter table staging.players enable row level security;
alter table staging.player_valuations enable row level security;
alter table staging.transfers enable row level security;
alter table staging.games enable row level security;
alter table staging.appearances enable row level security;

do $$ begin
  execute 'drop policy if exists "read competitions" on staging.competitions';
  execute 'drop policy if exists "read countries" on staging.countries';
  execute 'drop policy if exists "read national_teams" on staging.national_teams';
  execute 'drop policy if exists "read clubs" on staging.clubs';
  execute 'drop policy if exists "read players" on staging.players';
  execute 'drop policy if exists "read player_valuations" on staging.player_valuations';
  execute 'drop policy if exists "read transfers" on staging.transfers';
  execute 'drop policy if exists "read games" on staging.games';
  execute 'drop policy if exists "read appearances" on staging.appearances';
exception when others then null;
end $$;

create policy "read competitions" on staging.competitions for select using (true);
create policy "read countries" on staging.countries for select using (true);
create policy "read national_teams" on staging.national_teams for select using (true);
create policy "read clubs" on staging.clubs for select using (true);
create policy "read players" on staging.players for select using (true);
create policy "read player_valuations" on staging.player_valuations for select using (true);
create policy "read transfers" on staging.transfers for select using (true);
create policy "read games" on staging.games for select using (true);
create policy "read appearances" on staging.appearances for select using (true);

-- Done. Tables are EMPTY shells — next step is CSV import.
select 'staging tables ready' as status;
