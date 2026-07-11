/* ------------------------------------------------------------------ */
/*  Single data access point — mock default; Supabase via hydrate()    */
/* ------------------------------------------------------------------ */

import {
  CURRENT_SEASON,
  CURRENT_WINDOW,
  DATA_SOURCE,
  mapRecord,
  normalizePlayer,
  normalizePlayerDetails,
  normalizeClub,
  normalizeMatch,
  normalizeLeague,
  normalizeNation,
  normalizeManager,
} from './schema.js'
import { isSupabaseConfigured } from './lib/supabase.js'
import { fetchPlayerEnrichment, fetchSupabaseBundle } from './lib/supabaseData.js'

// NOTE: Do NOT import scoutDirectory / clubDirectory / etc. here at top level.
// Those modules import PLAYERS/CLUBS from this file → circular TDZ crash in production.

import { PLAYERS as RAW_PLAYERS, SEARCH_INDEX as RAW_SEARCH } from './data.js'
import { DETAILS as RAW_DETAILS } from './playerDetails.js'
import { CLUBS as RAW_CLUBS, CLUB_BY_SHORT as RAW_CLUB_BY_SHORT } from './clubData.js'
import { MATCHES_DETAIL as RAW_MATCHES, matchesForClub, matchesForLeague } from './matchData.js'
import { LEAGUES_DETAIL as RAW_LEAGUES, LEAGUE_CODE_TO_ID, LEAGUE_NAME_TO_ID } from './leagueData.js'
import { NATIONS as RAW_NATIONS } from './nationData.js'
import { MANAGERS as RAW_MANAGERS } from './managerData.js'

function fixtureSummary(m) {
  return {
    matchId: m.id,
    seasonId: m.seasonId ?? CURRENT_SEASON.id,
    status: m.status,
    league: m.league,
    leagueCode: m.leagueCode,
    kickoff: m.kickoff,
    clock: m.clock,
    home: {
      name: m.home?.name,
      short: m.home?.short,
      clubId: m.home?.clubId ?? null,
      score: m.home?.score,
    },
    away: {
      name: m.away?.name,
      short: m.away?.short,
      clubId: m.away?.clubId ?? null,
      score: m.away?.score,
    },
  }
}

/* ---- Normalized stores (mutable for hydrate) ---- */

export const PLAYERS = mapRecord(RAW_PLAYERS, (p) => {
  const n = normalizePlayer(p)
  const d = RAW_DETAILS[p.id]
  if (d?.competitions?.length) {
    const y = d.competitions.reduce((a, c) => a + (c.yellow || 0), 0)
    const r = d.competitions.reduce((a, c) => a + (c.red || 0), 0)
    n.seasonStats = {
      ...n.seasonStats,
      yellow: n.seasonStats.yellow || y,
      red: n.seasonStats.red || r,
    }
  }
  return n
})

export const DETAILS = Object.fromEntries(
  Object.entries(RAW_DETAILS).map(([id, d]) => [id, normalizePlayerDetails(d, id)]),
)

export const MATCHES_DETAIL = mapRecord(RAW_MATCHES, normalizeMatch)

export const CLUBS = mapRecord(RAW_CLUBS, (c) => {
  const n = normalizeClub(c)
  const related = matchesForClub(n).map((m) => normalizeMatch(m))
  if (!n.lastResults?.length) {
    n.lastResults = related
      .filter((m) => m.status === 'ft' || m.status === 'live')
      .slice(0, 5)
      .map(fixtureSummary)
  }
  if (!n.nextFixtures?.length) {
    n.nextFixtures = related
      .filter((m) => m.status === 'upcoming' || m.status === 'ns')
      .slice(0, 5)
      .map(fixtureSummary)
  }
  if (!n.leagueId) {
    n.leagueId = LEAGUE_CODE_TO_ID[n.leagueCode] || LEAGUE_NAME_TO_ID[n.league] || null
  }
  return n
})

export const LEAGUES_DETAIL = mapRecord(RAW_LEAGUES, normalizeLeague)
export const NATIONS = mapRecord(RAW_NATIONS, normalizeNation)
export const MANAGERS = mapRecord(RAW_MANAGERS, normalizeManager)

export const CLUB_BY_SHORT = { ...RAW_CLUB_BY_SHORT }

export { LEAGUE_CODE_TO_ID, LEAGUE_NAME_TO_ID, CURRENT_SEASON, CURRENT_WINDOW, DATA_SOURCE }
export { matchesForClub, matchesForLeague }

export const SEARCH_INDEX = [...RAW_SEARCH]

function rebuildSearchIndex() {
  SEARCH_INDEX.length = 0
  // Cap search index so command palette stays snappy
  const topPlayers = Object.values(PLAYERS)
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 800)
  for (const p of topPlayers) {
    SEARCH_INDEX.push({
      type: 'Player',
      label: p.name,
      meta: `${p.club || '—'} · ${p.pos || '—'} · €${p.value}M`,
      playerId: p.id,
    })
  }
  for (const c of Object.values(CLUBS).slice(0, 400)) {
    SEARCH_INDEX.push({
      type: 'Club',
      label: c.name,
      meta: `${c.league || '—'} · €${c.squadValue}M`,
      clubId: c.id,
    })
  }
  for (const l of Object.values(LEAGUES_DETAIL)) {
    SEARCH_INDEX.push({
      type: 'League',
      label: l.name,
      meta: l.country || l.confederation || 'Competition',
      leagueId: l.id,
    })
  }
  for (const n of Object.values(NATIONS)) {
    SEARCH_INDEX.push({
      type: 'Nation',
      label: n.name,
      meta: `FIFA ${n.fifaRank ?? '—'} · ${n.confederation || ''}`,
      nationId: n.id,
    })
  }
  for (const m of Object.values(MATCHES_DETAIL).slice(0, 200)) {
    SEARCH_INDEX.push({
      type: 'Match',
      label: `${m.home?.name || '?'} vs ${m.away?.name || '?'}`,
      meta: `${m.league || ''} · ${m.kickoff || m.status || ''}`,
      matchId: m.id,
    })
  }
}

/**
 * Hydrate in-memory stores from Supabase staging warehouse.
 */
export async function hydrateFromSupabase() {
  if (!isSupabaseConfigured) return false
  // Allow hydrate when mode is supabase OR auto when configured + env not mock-only
  if (DATA_SOURCE.mode === 'mock' && import.meta.env.VITE_DATA_MODE === 'mock') return false

  const bundle = await fetchSupabaseBundle({
    maxPlayers: 2500,
    maxGames: 600,
    maxClubs: 800,
  })

  for (const k of Object.keys(PLAYERS)) delete PLAYERS[k]
  Object.assign(PLAYERS, mapRecord(bundle.players, normalizePlayer))

  for (const k of Object.keys(DETAILS)) delete DETAILS[k]
  Object.assign(
    DETAILS,
    Object.fromEntries(
      Object.entries(bundle.details).map(([id, d]) => [id, normalizePlayerDetails(d, id)]),
    ),
  )

  for (const k of Object.keys(CLUBS)) delete CLUBS[k]
  Object.assign(CLUBS, mapRecord(bundle.clubs, normalizeClub))

  for (const k of Object.keys(CLUB_BY_SHORT)) delete CLUB_BY_SHORT[k]
  for (const c of Object.values(CLUBS)) {
    if (c.short) CLUB_BY_SHORT[c.short] = c.id
  }

  for (const k of Object.keys(LEAGUES_DETAIL)) delete LEAGUES_DETAIL[k]
  Object.assign(LEAGUES_DETAIL, mapRecord(bundle.leagues, normalizeLeague))

  for (const k of Object.keys(NATIONS)) delete NATIONS[k]
  Object.assign(NATIONS, mapRecord(bundle.nations, normalizeNation))

  for (const k of Object.keys(MANAGERS)) delete MANAGERS[k]
  // Keep empty managers from warehouse for now (no TM manager dump)
  Object.assign(MANAGERS, mapRecord(bundle.managers || {}, normalizeManager))

  for (const k of Object.keys(MATCHES_DETAIL)) delete MATCHES_DETAIL[k]
  Object.assign(MATCHES_DETAIL, mapRecord(bundle.matches, normalizeMatch))

  // Attach recent results onto clubs from matches
  for (const m of Object.values(MATCHES_DETAIL)) {
    for (const side of ['home', 'away']) {
      const cid = m[side]?.clubId
      if (!cid || !CLUBS[cid]) continue
      if (!CLUBS[cid].lastResults) CLUBS[cid].lastResults = []
      if (m.status === 'ft' && CLUBS[cid].lastResults.length < 8) {
        CLUBS[cid].lastResults.push(fixtureSummary(m))
      }
    }
  }

  rebuildSearchIndex()

  // Dynamic imports break the dataLayer ↔ *Directory circular dependency
  const [
    { rebuildScoutDirectory },
    { rebuildClubDirectory },
    { rebuildCompetitionDirectory },
    { rebuildNationDirectory },
  ] = await Promise.all([
    import('./scoutDirectory.js'),
    import('./clubDirectory.js'),
    import('./competitionDirectory.js'),
    import('./nationDirectory.js'),
  ])
  rebuildScoutDirectory(PLAYERS)
  rebuildClubDirectory(CLUBS)
  rebuildCompetitionDirectory(LEAGUES_DETAIL)
  rebuildNationDirectory(NATIONS)

  DATA_SOURCE.mode = 'supabase'
  DATA_SOURCE.provider = 'supabase'
  DATA_SOURCE.warehouse = bundle.meta?.counts || null
  return true
}

/** Pull transfers + valuation curve for one player (lazy) */
export async function enrichPlayerFromWarehouse(playerId) {
  if (DATA_SOURCE.mode !== 'supabase' || !isSupabaseConfigured) return null
  const { transfers, valueHistory } = await fetchPlayerEnrichment(playerId)
  const p = PLAYERS[playerId]
  const d = DETAILS[playerId]
  if (p && transfers?.length) {
    p.transfers = transfers
  }
  if (p && valueHistory?.length) {
    p.valueHistory = valueHistory
  }
  if (d && valueHistory?.length) {
    const last = valueHistory[valueHistory.length - 1]
    d.highest = {
      value: Math.max(...valueHistory.map((v) => v.value)),
      date: last ? String(last.year) : '—',
    }
  }
  return { transfers, valueHistory }
}

export function getPlayer(id) {
  return PLAYERS[id] ?? null
}

export function getPlayerDetails(id) {
  return DETAILS[id] ?? null
}

export function getPlayerBundle(id) {
  const player = getPlayer(id)
  if (!player) return null
  return { player, details: getPlayerDetails(id) }
}

export function getClub(id) {
  return CLUBS[id] ?? null
}

export function getMatch(id) {
  return MATCHES_DETAIL[id] ?? null
}

export function getLeague(id) {
  return LEAGUES_DETAIL[id] ?? null
}

export function getNation(id) {
  return NATIONS[id] ?? null
}

export function getManager(id) {
  return MANAGERS[id] ?? null
}

export async function loadPlayer(id) {
  return getPlayer(id)
}

export async function loadClub(id) {
  return getClub(id)
}

export async function loadMatch(id) {
  return getMatch(id)
}

export async function loadLeague(id) {
  return getLeague(id)
}

export async function loadNation(id) {
  return getNation(id)
}

export async function loadManager(id) {
  return getManager(id)
}

export function getDataStatus() {
  return {
    ...DATA_SOURCE,
    counts: {
      players: Object.keys(PLAYERS).length,
      clubs: Object.keys(CLUBS).length,
      matches: Object.keys(MATCHES_DETAIL).length,
      leagues: Object.keys(LEAGUES_DETAIL).length,
      nations: Object.keys(NATIONS).length,
      managers: Object.keys(MANAGERS).length,
    },
  }
}
