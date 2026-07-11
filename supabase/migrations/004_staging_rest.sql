-- ============================================================
-- Remaining Transfermarkt + international results staging tables
-- Run once in SQL Editor, then re-run 003 grants if needed
-- ============================================================

create schema if not exists staging;

-- club_games.csv
create table if not exists staging.club_games (
  id bigserial primary key,
  game_id text,
  club_id text,
  own_goals int,
  own_position int,
  own_manager_name text,
  opponent_id text,
  opponent_goals int,
  opponent_position int,
  opponent_manager_name text,
  hosting text,
  is_win int
);
create index if not exists stg_cg_game_idx on staging.club_games(game_id);
create index if not exists stg_cg_club_idx on staging.club_games(club_id);

-- game_events.csv  (large)
create table if not exists staging.game_events (
  game_event_id text primary key,
  date text,
  game_id text,
  minute int,
  type text,
  club_id text,
  club_name text,
  player_id text,
  description text,
  player_in_id text,
  player_assist_id text
);
create index if not exists stg_ge_game_idx on staging.game_events(game_id);
create index if not exists stg_ge_player_idx on staging.game_events(player_id);

-- game_lineups.csv  (very large)
create table if not exists staging.game_lineups (
  game_lineups_id text primary key,
  date text,
  game_id text,
  player_id text,
  club_id text,
  player_name text,
  type text,
  position text,
  number int,
  team_captain int
);
create index if not exists stg_gl_game_idx on staging.game_lineups(game_id);
create index if not exists stg_gl_player_idx on staging.game_lineups(player_id);

-- archive (1) — international football history
create table if not exists staging.intl_results (
  id bigserial primary key,
  date text,
  home_team text,
  away_team text,
  home_score int,
  away_score int,
  tournament text,
  city text,
  country text,
  neutral text
);
create index if not exists stg_intl_date_idx on staging.intl_results(date);

create table if not exists staging.intl_goalscorers (
  id bigserial primary key,
  date text,
  home_team text,
  away_team text,
  team text,
  scorer text,
  minute int,
  own_goal text,
  penalty text
);

create table if not exists staging.intl_shootouts (
  id bigserial primary key,
  date text,
  home_team text,
  away_team text,
  winner text,
  first_shooter text
);

create table if not exists staging.intl_former_names (
  id bigserial primary key,
  current text,
  former text,
  start_date text,
  end_date text
);

-- StatsBomb open data (lighter index tables; full events optional)
create table if not exists staging.sb_competitions (
  competition_id int,
  season_id int,
  country_name text,
  competition_name text,
  competition_gender text,
  competition_youth text,
  competition_international text,
  season_name text,
  match_updated text,
  match_updated_360 text,
  match_available_360 text,
  match_available text,
  primary key (competition_id, season_id)
);

create table if not exists staging.sb_matches (
  match_id int primary key,
  match_date text,
  kick_off text,
  competition jsonb,
  season jsonb,
  home_team jsonb,
  away_team jsonb,
  home_score int,
  away_score int,
  match_status text,
  match_status_360 text,
  last_updated text,
  last_updated_360 text,
  metadata jsonb,
  match_week int,
  competition_stage jsonb,
  stadium jsonb,
  referee jsonb
);

create table if not exists staging.sb_events (
  id text primary key,
  match_id int,
  index int,
  period int,
  timestamp text,
  minute int,
  second int,
  type jsonb,
  possession int,
  possession_team jsonb,
  play_pattern jsonb,
  team jsonb,
  player jsonb,
  position jsonb,
  location jsonb,
  duration numeric,
  under_pressure boolean,
  raw jsonb
);
create index if not exists stg_sb_ev_match_idx on staging.sb_events(match_id);

-- Grants
grant usage on schema staging to postgres, anon, authenticated, service_role;
grant all on all tables in schema staging to postgres, service_role;
grant select on all tables in schema staging to anon, authenticated;
grant all on all sequences in schema staging to postgres, service_role;
grant usage, select on all sequences in schema staging to anon, authenticated;

alter table staging.club_games enable row level security;
alter table staging.game_events enable row level security;
alter table staging.game_lineups enable row level security;
alter table staging.intl_results enable row level security;
alter table staging.intl_goalscorers enable row level security;
alter table staging.intl_shootouts enable row level security;
alter table staging.intl_former_names enable row level security;
alter table staging.sb_competitions enable row level security;
alter table staging.sb_matches enable row level security;
alter table staging.sb_events enable row level security;

do $$ begin
  execute 'drop policy if exists "read club_games" on staging.club_games';
  execute 'drop policy if exists "read game_events" on staging.game_events';
  execute 'drop policy if exists "read game_lineups" on staging.game_lineups';
  execute 'drop policy if exists "read intl_results" on staging.intl_results';
  execute 'drop policy if exists "read intl_goalscorers" on staging.intl_goalscorers';
  execute 'drop policy if exists "read intl_shootouts" on staging.intl_shootouts';
  execute 'drop policy if exists "read intl_former_names" on staging.intl_former_names';
  execute 'drop policy if exists "read sb_competitions" on staging.sb_competitions';
  execute 'drop policy if exists "read sb_matches" on staging.sb_matches';
  execute 'drop policy if exists "read sb_events" on staging.sb_events';
exception when others then null;
end $$;

create policy "read club_games" on staging.club_games for select using (true);
create policy "read game_events" on staging.game_events for select using (true);
create policy "read game_lineups" on staging.game_lineups for select using (true);
create policy "read intl_results" on staging.intl_results for select using (true);
create policy "read intl_goalscorers" on staging.intl_goalscorers for select using (true);
create policy "read intl_shootouts" on staging.intl_shootouts for select using (true);
create policy "read intl_former_names" on staging.intl_former_names for select using (true);
create policy "read sb_competitions" on staging.sb_competitions for select using (true);
create policy "read sb_matches" on staging.sb_matches for select using (true);
create policy "read sb_events" on staging.sb_events for select using (true);

select '004 staging rest ready' as status;
