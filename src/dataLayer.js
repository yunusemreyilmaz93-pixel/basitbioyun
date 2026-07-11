/* ------------------------------------------------------------------ */
/*  Single data access point — mock now, swap provider later           */
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

import { PLAYERS as RAW_PLAYERS, SEARCH_INDEX as RAW_SEARCH } from './data.js'
import { DETAILS as RAW_DETAILS } from './playerDetails.js'
import { CLUBS as RAW_CLUBS, CLUB_BY_SHORT } from './clubData.js'
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

/* ---- Normalized stores ---- */

export const PLAYERS = mapRecord(RAW_PLAYERS, (p) => {
  const n = normalizePlayer(p)
  // Roll yellow/red from DETAILS competitions when available
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
  // Attach fixture strips from match store (API will replace)
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
  // Resolve leagueId if missing
  if (!n.leagueId) {
    n.leagueId =
      LEAGUE_CODE_TO_ID[n.leagueCode] || LEAGUE_NAME_TO_ID[n.league] || null
  }
  return n
})

export const LEAGUES_DETAIL = mapRecord(RAW_LEAGUES, normalizeLeague)
export const NATIONS = mapRecord(RAW_NATIONS, normalizeNation)
export const MANAGERS = mapRecord(RAW_MANAGERS, normalizeManager)

export { CLUB_BY_SHORT, LEAGUE_CODE_TO_ID, LEAGUE_NAME_TO_ID, CURRENT_SEASON, CURRENT_WINDOW, DATA_SOURCE }
export { matchesForClub, matchesForLeague }

export const SEARCH_INDEX = RAW_SEARCH

/* ---- Getters (stable API for UI + future fetchers) ---- */

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

/**
 * Future API entrypoint — keep UI calling these async helpers.
 * Today: resolves from mock stores. Tomorrow: provider switch.
 */
export async function loadPlayer(id) {
  // if (DATA_SOURCE.mode === 'api') return api.fetchPlayer(id)
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

/** Debug / status strip */
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
