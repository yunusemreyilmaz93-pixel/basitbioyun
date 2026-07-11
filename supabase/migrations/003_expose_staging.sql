-- ============================================================
-- Expose staging schema to Supabase API (PostgREST)
-- Run once in SQL Editor after 002_staging_transfermarkt.sql
-- ============================================================

-- 1) API roles can see/use the schema
grant usage on schema staging to postgres, anon, authenticated, service_role;

-- 2) Table privileges
grant all on all tables in schema staging to postgres, service_role;
grant select on all tables in schema staging to anon, authenticated;

grant all on all sequences in schema staging to postgres, service_role;
grant usage, select on all sequences in schema staging to anon, authenticated;

-- Future tables in staging get same grants
alter default privileges in schema staging
  grant all on tables to postgres, service_role;
alter default privileges in schema staging
  grant select on tables to anon, authenticated;
alter default privileges in schema staging
  grant all on sequences to postgres, service_role;

select 'staging grants applied — now also add staging to Exposed schemas in API settings' as next_step;
