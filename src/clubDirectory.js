/* ------------------------------------------------------------------ */
/*  Clubs scouting directory — real CLUBS + synthetic density          */
/* ------------------------------------------------------------------ */

import { CLUBS } from './dataLayer.js'

export const CLUB_SCOUT_LEAGUES = [
  'Premier League',
  'La Liga',
  'Bundesliga',
  'Serie A',
  'Ligue 1',
  'Trendyol Süper Lig',
  'Eredivisie',
  'Primeira Liga',
  'Belgian Pro League',
  'Championship',
]

/** Marketing-size global club index — updated after hydrate */
export let GLOBAL_CLUB_INDEX = 842

const PREFIX = [
  'Sporting', 'United', 'City', 'Athletic', 'Royal', 'Olympic', 'National', 'Dynamo',
  'Racing', 'Inter', 'Real', 'FC', 'SC', 'AC', 'SV', 'CF',
]

const NAMES = [
  'Northgate', 'Riverside', 'Harbor', 'Summit', 'Valley', 'Crown', 'Phoenix', 'Atlas',
  'Orion', 'Liberty', 'Capitol', 'Mercury', 'Aether', 'Nova', 'Vertex', 'Horizon',
  'Alpine', 'Coastal', 'Metro', 'Imperial', 'Granite', 'Cedar', 'Silver', 'Golden',
]

const SUFFIX = ['FC', 'SC', 'United', 'City', 'Athletic', 'Rovers', 'Wanderers', '']

const STADIUMS = [
  'Arena', 'Park', 'Stadium', 'Ground', 'Dome', 'Coliseum', 'Field', 'Bowl',
]

const LEAGUE_POOL = [
  { league: 'Premier League', code: 'PRL' },
  { league: 'La Liga', code: 'LAL' },
  { league: 'Bundesliga', code: 'BUN' },
  { league: 'Serie A', code: 'SEA' },
  { league: 'Ligue 1', code: 'LI1' },
  { league: 'Trendyol Süper Lig', code: 'SÜP' },
  { league: 'Eredivisie', code: 'ERE' },
  { league: 'Primeira Liga', code: 'LIG' },
  { league: 'Belgian Pro League', code: 'BPL' },
  { league: 'Championship', code: 'CHP' },
]

function hash(n) {
  let x = (n * 2654435761) >>> 0
  x ^= x << 13
  x ^= x >>> 17
  x ^= x << 5
  return x >>> 0
}

function pick(arr, n) {
  return arr[hash(n) % arr.length]
}

function shortCode(i, h) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return (
    letters[h % 26] +
    letters[(h >> 3) % 26] +
    letters[(h >> 7) % 26]
  )
}

function realToRow(c) {
  const stadium =
    typeof c.stadium === 'string'
      ? c.stadium
      : c.stadium?.name || '—'
  const capacity =
    typeof c.stadium === 'object' && c.stadium
      ? Number(c.stadium.capacity) || 0
      : Number(c.capacity) || 0
  return {
    id: c.id,
    clubId: c.id,
    name: c.name,
    short: c.short,
    league: c.leagueDisplay || c.league || '—',
    leagueCode: c.leagueCode,
    leagueId: c.leagueId || null,
    squadSize: c.squadSize || 0,
    avgAge: Number(c.avgAge) || 0,
    foreignersPct: Number(c.foreignersPct) || 0,
    stadium,
    capacity,
    /** squad value in €M */
    squadValue: Number(c.squadValue) || 0,
    real: true,
  }
}

function syntheticRow(i) {
  const h = hash(i + 42001)
  const lg = pick(LEAGUE_POOL, h)
  const pre = pick(PREFIX, h >> 2)
  const mid = pick(NAMES, h >> 5)
  const suf = pick(SUFFIX, h >> 9)
  const name = [pre, mid, suf].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  const short = shortCode(i, h)
  // value: 20M – 980M mostly, some higher
  const squadValue = Math.round(20 + (h % 960) + ((h >> 4) % 40))
  const squadSize = 22 + (h % 12)
  const avgAge = +(22 + ((h % 90) / 10)).toFixed(1)
  const foreignersPct = h % 85
  const capacity = 8000 + (h % 72000)
  const stadium = `${mid} ${pick(STADIUMS, h >> 11)}`

  return {
    id: `club-scout-${i}`,
    clubId: null,
    name,
    short,
    league: lg.league,
    leagueCode: lg.code,
    squadSize,
    avgAge,
    foreignersPct,
    stadium,
    capacity,
    squadValue,
    real: false,
  }
}

export const CLUB_DIRECTORY = (() => {
  const reals = Object.values(CLUBS).map(realToRow)
  const synth = Array.from({ length: 195 }, (_, i) => syntheticRow(i + 1))
  return [...reals, ...synth]
})()

export function rebuildClubDirectory(clubsRecord) {
  const reals = Object.values(clubsRecord || {})
    .map(realToRow)
    .sort((a, b) => (b.squadValue || 0) - (a.squadValue || 0))
  CLUB_DIRECTORY.length = 0
  CLUB_DIRECTORY.push(...reals)
  GLOBAL_CLUB_INDEX = reals.length
  const leagues = [...new Set(reals.map((r) => r.league).filter(Boolean))].sort()
  CLUB_SCOUT_LEAGUES.length = 0
  CLUB_SCOUT_LEAGUES.push(...leagues)
}

export function formatSquadValue(m) {
  if (m >= 1000) return `€${(m / 1000).toFixed(2)}bn`
  return `€${m}M`
}
