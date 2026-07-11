/**
 * Upsert seed JSON into Supabase (service role — server only).
 *
 * Required env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional:
 *   SEED_DIR (default: supabase/seed)
 *
 * Run: node --env-file=.env scripts/seed-supabase.mjs
 *  or:  $env:SUPABASE_URL=...; $env:SUPABASE_SERVICE_ROLE_KEY=...; node scripts/seed-supabase.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const seedDir = process.env.SEED_DIR || join(root, 'supabase', 'seed')

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function loadJson(name) {
  const path = join(seedDir, name)
  if (!existsSync(path)) {
    console.warn(`skip missing ${name}`)
    return null
  }
  return JSON.parse(readFileSync(path, 'utf8'))
}

async function upsert(table, rows, onConflict = 'id') {
  if (!rows?.length) {
    console.log(`${table}: 0 rows`)
    return
  }
  const chunk = 200
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk)
    const { error } = await supabase.from(table).upsert(slice, { onConflict })
    if (error) {
      console.error(`${table} upsert failed:`, error.message)
      throw error
    }
  }
  console.log(`${table}: upserted ${rows.length}`)
}

function mapPlayer(p) {
  return {
    id: p.id,
    name: p.name,
    age: p.age ?? null,
    pos: p.pos ?? p.position ?? null,
    pos_group: p.posGroup ?? p.pos_group ?? null,
    foot: p.foot ?? null,
    club: p.club ?? null,
    club_id: p.clubId ?? p.club_id ?? null,
    club_short: p.clubShort ?? p.club_short ?? null,
    nation: p.nation ?? {},
    value: p.value ?? p.smv?.value ?? null,
    form: p.form ?? null,
    goals: p.goals ?? p.seasonStats?.goals ?? 0,
    assists: p.assists ?? p.seasonStats?.assists ?? 0,
    contract_until: p.contractUntil ?? p.contract_until ?? null,
    status: p.status ?? null,
    loan: Boolean(p.loan),
    height: p.height ?? null,
    agent: p.agent ?? null,
    joined: p.joined ?? null,
    outfitter: p.outfitter ?? null,
    season_stats: p.seasonStats ?? p.season_stats ?? {},
    smv: p.smv ?? {},
    value_history: p.valueHistory ?? p.value_history ?? [],
    transfers: p.transfers ?? [],
    positions: p.positions ?? {},
    external_ids: p.externalIds ?? p.external_ids ?? {},
    meta: {},
  }
}

function mapClub(c) {
  return {
    id: c.id,
    name: c.name,
    short: c.short ?? null,
    league: c.league ?? null,
    league_code: c.leagueCode ?? c.league_code ?? null,
    league_id: c.leagueId ?? c.league_id ?? null,
    country: c.country ?? null,
    founded: c.founded ?? null,
    squad_size: c.squadSize ?? c.squad_size ?? null,
    avg_age: c.avgAge ?? c.avg_age ?? null,
    foreigners_pct: c.foreignersPct ?? c.foreigners_pct ?? null,
    squad_value: c.squadValue ?? c.squad_value ?? c.value ?? null,
    stadium: c.stadium ?? {},
    formation: c.formation ?? null,
    manager: c.manager ?? {},
    squad: c.squad ?? [],
    starting_xi: c.startingXI ?? c.starting_xi ?? [],
    standings: c.standings ?? [],
    transfers: c.transfers ?? {},
    last_results: c.lastResults ?? c.last_results ?? [],
    next_fixtures: c.nextFixtures ?? c.next_fixtures ?? [],
    external_ids: c.externalIds ?? c.external_ids ?? {},
    meta: {},
  }
}

function mapLeague(l) {
  return {
    id: l.id,
    name: l.name,
    full_name: l.fullName ?? l.full_name ?? null,
    code: l.code ?? null,
    country: l.country ?? null,
    confederation: l.confederation ?? null,
    teams: l.teams ?? null,
    players: l.players ?? null,
    foreigners_pct: l.foreignersPct ?? l.foreigners_pct ?? null,
    avg_age: l.avgAge ?? l.avg_age ?? null,
    total_value: l.totalValue ?? l.total_value ?? l.totalMarket ?? null,
    season_id: l.seasonId ?? l.season_id ?? '2025-26',
    zones: l.zones ?? {},
    standings: l.standings ?? [],
    all_time: l.allTime ?? l.all_time ?? [],
    leaders: l.leaders ?? {},
    best_xi: l.bestXi ?? l.best_xi ?? [],
    meta: {},
  }
}

function mapNation(n) {
  return {
    id: n.id,
    name: n.name,
    code: n.code ?? null,
    confederation: n.confederation ?? null,
    fifa_rank: n.fifaRank ?? n.fifa_rank ?? null,
    squad_value: n.squadValue ?? n.squad_value ?? null,
    association: n.association ?? null,
    stadium: n.stadium ?? {},
    coach: n.coach ?? {},
    colors: n.colors ?? {},
    squad: n.squad ?? [],
    fixtures: n.fixtures ?? n.matchLog ?? [],
    trophies: n.trophies ?? [],
    legends: n.legends ?? {},
    ranking_history: n.rankingHistory ?? n.ranking_history ?? [],
    external_ids: n.externalIds ?? n.external_ids ?? {},
    meta: {},
  }
}

function mapManager(m) {
  return {
    id: m.id,
    name: m.name,
    age: m.age ?? null,
    nation: m.nation ?? {},
    club: m.club ?? null,
    club_id: m.clubId ?? m.club_id ?? null,
    club_code: m.clubCode ?? m.club_code ?? null,
    employed: m.employed ?? Boolean(m.club),
    formation: m.formation ?? null,
    formation_label: m.formationLabel ?? m.formation_label ?? null,
    matches: m.matches ?? 0,
    win_pct: m.winPct ?? m.win_pct ?? null,
    ppg: m.ppg ?? null,
    contract_until: m.contractUntil ?? m.contract_until ?? null,
    licence: m.licence ?? null,
    style: m.style ?? null,
    career: m.career ?? m.history ?? [],
    talents: m.talents ?? [],
    metrics: m.metrics ?? {},
    external_ids: m.externalIds ?? m.external_ids ?? {},
    meta: {},
  }
}

function mapMatch(m) {
  return {
    id: m.id,
    season_id: m.seasonId ?? m.season_id ?? '2025-26',
    league: m.league ?? null,
    league_code: m.leagueCode ?? m.league_code ?? null,
    league_id: m.leagueId ?? m.league_id ?? null,
    status: m.status ?? 'upcoming',
    kickoff: m.kickoff ?? null,
    clock: m.clock ?? null,
    md: m.md ?? null,
    attendance: m.attendance ?? m.att ?? null,
    referee: m.referee ?? m.ref ?? null,
    home: m.home ?? {},
    away: m.away ?? {},
    stats: m.stats ?? {},
    events: m.events ?? m.timeline ?? [],
    momentum: m.momentum ?? [],
    external_ids: m.externalIds ?? m.external_ids ?? {},
    meta: {},
  }
}

const leagues = loadJson('leagues.json')
const clubs = loadJson('clubs.json')
const players = loadJson('players.json')
const playerDetails = loadJson('player_details.json')
const managers = loadJson('managers.json')
const nations = loadJson('nations.json')
const matches = loadJson('matches.json')
const market = loadJson('market.json')

// Order: leagues → clubs → players → details → rest
await upsert('leagues', (leagues || []).map(mapLeague))
await upsert('clubs', (clubs || []).map(mapClub))
await upsert('players', (players || []).map(mapPlayer))

if (playerDetails && typeof playerDetails === 'object') {
  const detailRows = Object.entries(playerDetails).map(([id, d]) => ({
    player_id: id,
    competitions: d.competitions ?? [],
    career: d.career ?? [],
    injuries: d.injuries ?? [],
    national_team: d.nationalTeam ?? d.national_team ?? d.nt ?? {},
    smart: d.smart ?? {},
    trophies: d.trophies ?? [],
    meta: {},
  }))
  await upsert('player_details', detailRows, 'player_id')
}

await upsert('managers', (managers || []).map(mapManager))
await upsert('nations', (nations || []).map(mapNation))
await upsert('matches', (matches || []).map(mapMatch))

if (market) {
  const transfers = (market.transfers || []).map((t, i) => ({
    id: t.id || `tr-${i}`,
    player_name: t.player || t.playerName || t.name || null,
    player_id: t.playerId || t.player_id || null,
    from_club: t.from || t.fromClub || null,
    from_club_id: t.fromClubId || null,
    to_club: t.to || t.toClub || null,
    to_club_id: t.toClubId || null,
    fee: t.fee ?? null,
    fee_type: t.type || t.feeType || null,
    pos: t.pos || null,
    date: t.date || null,
    window_id: t.windowId || '2026-summer',
    meta: t,
  }))
  const rumors = (market.rumors || []).map((r, i) => ({
    id: r.id || `ru-${i}`,
    player_name: r.player || r.playerName || r.name || null,
    player_id: r.playerId || null,
    from_club: r.from || null,
    to_club: r.to || null,
    probability: r.probability ?? r.prob ?? null,
    tier: r.tier ?? null,
    source: r.source || null,
    ask: r.ask ?? null,
    meta: r,
  }))
  const movers = (market.movers || []).map((m, i) => ({
    id: m.id || `mv-${i}`,
    player_name: m.player || m.playerName || m.name || null,
    player_id: m.playerId || null,
    club: m.club || null,
    direction: m.direction || (m.pct >= 0 ? 'up' : 'down'),
    pct: m.pct ?? null,
    value: m.value ?? null,
    meta: m,
  }))
  await upsert('transfers', transfers)
  await upsert('rumors', rumors)
  await upsert('value_movers', movers)
}

console.log('\nSeed complete.')
