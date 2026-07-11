/* ------------------------------------------------------------------ */
/*  Global transfer trading floor — ledger, rumors, value movers       */
/* ------------------------------------------------------------------ */

import { LATEST_TRANSFERS, RUMORS, VALUE_UPDATES, SMART_RISERS } from './homeData.js'
import { normalizeMarketTransfer, normalizeRumor } from './schema.js'

export const MARKET_LEAGUES = [
  'All leagues',
  'Premier League',
  'La Liga',
  'Bundesliga',
  'Serie A',
  'Ligue 1',
  'Trendyol Süper Lig',
  'Other',
]

export const POS_GROUPS = [
  { id: 'GK', label: 'GK' },
  { id: 'DEF', label: 'DEF' },
  { id: 'MID', label: 'MID' },
  { id: 'FWD', label: 'FWD' },
]

export const TRANSFER_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'permanent', label: 'Permanent' },
  { id: 'loan', label: 'Loan' },
  { id: 'free', label: 'Free Transfers' },
]

/** Window spend by top leagues (€M) — market analytics strip */
export const TOP_SPENDING_LEAGUES = [
  { league: 'Premier League', spent: 840, code: 'PRL', color: 'bg-emerald-400' },
  { league: 'La Liga', spent: 420, code: 'LAL', color: 'bg-sky-400' },
  { league: 'Trendyol Süper Lig', spent: 180, code: 'SÜP', color: 'bg-violet-400' },
]

/** Agencies moving the most market value this window */
export const DOMINANT_AGENCIES = [
  { rank: 1, name: 'Gestifute', volume: 312, deals: 14, tag: 'Elite' },
  { rank: 2, name: 'CAA Stellar', volume: 248, deals: 11, tag: 'Elite' },
  { rank: 3, name: 'ROOF', volume: 196, deals: 9, tag: 'Rising' },
]

/** Club short code → club profile id (when known) */
const CLUB_ID_BY_CODE = {
  BAR: 'fc-barcelona',
  RMA: 'real-madrid',
  JUV: 'juventus',
  FCB: 'bayern-munich',
  PSG: 'psg',
  REN: null,
  CRY: null,
  FEN: null,
  FLA: null,
  CHE: null,
  MCI: null,
  LIV: null,
  ARS: null,
  ATM: null,
  INT: null,
  MIL: null,
  NAP: null,
  BVB: null,
  B04: null,
  TOT: null,
  MUN: null,
  NEW: null,
  WHU: null,
  AVL: null,
  SEV: null,
  BET: null,
  VIL: null,
  ROM: null,
  LAZ: null,
  FIO: null,
  MON: null,
  LYO: null,
  MAR: null,
  AJA: null,
  PSV: null,
  FEY: null,
  SCP: null,
  SLB: null,
  POR: null,
  GAL: null,
  GS: null,
  FB: null,
  BJK: null,
  RIY: null,
  HIL: null,
  NSR: null,
}

function clubId(code) {
  return CLUB_ID_BY_CODE[code] ?? null
}

function posGroup(pos) {
  const p = (pos || '').toUpperCase()
  if (p === 'GK' || p === 'GOALKEEPER') return 'GK'
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF', 'SW'].includes(p)) return 'DEF'
  if (['DM', 'CM', 'AM', 'LM', 'RM', 'CDM', 'CAM', 'MID'].includes(p)) return 'MID'
  return 'FWD' // ST, CF, LW, RW, SS, etc.
}

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

/* ---- Seed expansions ---- */

const PLAYER_POOL = [
  { name: 'João Neves', pos: 'CM', playerId: null },
  { name: 'Warren Zaïre-Emery', pos: 'CM', playerId: null },
  { name: 'Endrick', pos: 'ST', playerId: null },
  { name: 'Pau Cubarsí', pos: 'CB', playerId: null },
  { name: 'Savinho', pos: 'RW', playerId: null },
  { name: 'Geovany Quenda', pos: 'RW', playerId: null },
  { name: 'Luka Sučić', pos: 'CM', playerId: null },
  { name: 'Rico Lewis', pos: 'RB', playerId: null },
  { name: 'Kobbie Mainoo', pos: 'CM', playerId: null },
  { name: 'Alejandro Garnacho', pos: 'LW', playerId: null },
  { name: 'Castello Lukeba', pos: 'CB', playerId: null },
  { name: 'Arthur Vermeeren', pos: 'DM', playerId: null },
  { name: 'Mathys Tel', pos: 'ST', playerId: null },
  { name: 'Harvey Elliott', pos: 'AM', playerId: null },
  { name: 'Noni Madueke', pos: 'RW', playerId: null },
  { name: 'Malo Gusto', pos: 'RB', playerId: null },
  { name: 'Giorgi Mamardashvili', pos: 'GK', playerId: null },
  { name: 'Diogo Costa', pos: 'GK', playerId: null },
  { name: 'Dean Huijsen', pos: 'CB', playerId: null },
  { name: 'Leny Yoro', pos: 'CB', playerId: null },
  { name: 'Arda Güler', pos: 'AM', playerId: 'arda-guler' },
  { name: 'Désiré Doué', pos: 'AM', playerId: 'desire-doue' },
  { name: 'Kenan Yıldız', pos: 'AM', playerId: 'kenan-yildiz' },
  { name: 'Jamal Musiala', pos: 'AM', playerId: 'jamal-musiala' },
  { name: 'Lamine Yamal', pos: 'RW', playerId: 'lamine-yamal' },
  { name: 'Michael Olise', pos: 'RW', playerId: 'michael-olise' },
  { name: 'Vinícius Júnior', pos: 'LW', playerId: 'vinicius-junior' },
]

const CLUB_POOL = [
  { name: 'Arsenal', code: 'ARS', league: 'Premier League' },
  { name: 'Chelsea', code: 'CHE', league: 'Premier League' },
  { name: 'Liverpool', code: 'LIV', league: 'Premier League' },
  { name: 'Man City', code: 'MCI', league: 'Premier League' },
  { name: 'Man United', code: 'MUN', league: 'Premier League' },
  { name: 'Tottenham', code: 'TOT', league: 'Premier League' },
  { name: 'Newcastle', code: 'NEW', league: 'Premier League' },
  { name: 'FC Barcelona', code: 'BAR', league: 'La Liga' },
  { name: 'Real Madrid', code: 'RMA', league: 'La Liga' },
  { name: 'Atlético', code: 'ATM', league: 'La Liga' },
  { name: 'Sevilla', code: 'SEV', league: 'La Liga' },
  { name: 'Bayern', code: 'FCB', league: 'Bundesliga' },
  { name: 'Dortmund', code: 'BVB', league: 'Bundesliga' },
  { name: 'Leverkusen', code: 'B04', league: 'Bundesliga' },
  { name: 'Juventus', code: 'JUV', league: 'Serie A' },
  { name: 'Inter', code: 'INT', league: 'Serie A' },
  { name: 'Milan', code: 'MIL', league: 'Serie A' },
  { name: 'Napoli', code: 'NAP', league: 'Serie A' },
  { name: 'Paris SG', code: 'PSG', league: 'Ligue 1' },
  { name: 'Monaco', code: 'MON', league: 'Ligue 1' },
  { name: 'Lyon', code: 'LYO', league: 'Ligue 1' },
  { name: 'Marseille', code: 'MAR', league: 'Ligue 1' },
  { name: 'Galatasaray', code: 'GS', league: 'Trendyol Süper Lig' },
  { name: 'Fenerbahçe', code: 'FB', league: 'Trendyol Süper Lig' },
  { name: 'Beşiktaş', code: 'BJK', league: 'Trendyol Süper Lig' },
  { name: 'Ajax', code: 'AJA', league: 'Other' },
  { name: 'Benfica', code: 'SLB', league: 'Other' },
  { name: 'Porto', code: 'POR', league: 'Other' },
  { name: 'Sporting CP', code: 'SCP', league: 'Other' },
  { name: 'Al-Hilal', code: 'HIL', league: 'Other' },
  { name: 'Al-Nassr', code: 'NSR', league: 'Other' },
  { name: 'Rennes', code: 'REN', league: 'Ligue 1' },
  { name: 'Crystal Palace', code: 'CRY', league: 'Premier League' },
  { name: 'Flamengo', code: 'FLA', league: 'Other' },
]

const SOURCES = [
  { name: 'Fabrizio Romano', tier: 1 },
  { name: 'The Athletic', tier: 1 },
  { name: 'Sky Sports', tier: 1 },
  { name: 'L’Équipe', tier: 2 },
  { name: 'Kicker', tier: 2 },
  { name: 'MARCA', tier: 2 },
  { name: 'Bild', tier: 2 },
  { name: 'Calciomercato', tier: 3 },
  { name: 'FootMercato', tier: 3 },
  { name: 'TransferGossip', tier: 3 },
]

const LEAGUE_BY_CODE = Object.fromEntries(CLUB_POOL.map((c) => [c.code, c.league]))

function feeLabel(fee, type) {
  if (type === 'free' || fee === 0) return 'Free'
  if (type === 'loan') return fee ? `Loan · €${fee}M` : 'Loan'
  return `€${fee}M`
}

function realTransfers() {
  return LATEST_TRANSFERS.map((t, i) => {
    const type = t.fee === 0 ? 'free' : 'permanent'
    const toLeague = LEAGUE_BY_CODE[t.tc] || 'Other'
    return {
      id: `tx-real-${i}`,
      playerId: t.playerId,
      name: t.name,
      pos: t.pos,
      posGroup: posGroup(t.pos),
      age: t.age,
      from: t.from,
      fromCode: t.fc,
      fromClubId: clubId(t.fc),
      to: t.to,
      toCode: t.tc,
      toClubId: clubId(t.tc),
      fee: t.fee,
      feeDisplay: feeLabel(t.fee, type),
      type,
      league: toLeague,
      real: true,
      date: `2024-0${(i % 8) + 1}-15`,
    }
  })
}

function syntheticTransfers(count = 42) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const h = hash(i + 501)
    const pl = pick(PLAYER_POOL, h)
    let from = pick(CLUB_POOL, h >> 2)
    let to = pick(CLUB_POOL, h >> 5)
    if (from.code === to.code) to = pick(CLUB_POOL, h >> 7)
    const typeRoll = h % 100
    const type = typeRoll < 12 ? 'free' : typeRoll < 28 ? 'loan' : 'permanent'
    const fee =
      type === 'free' ? 0 : type === 'loan' ? (h % 5 === 0 ? 2 + (h % 8) : 0) : 5 + (h % 95)
    rows.push({
      id: `tx-syn-${i}`,
      playerId: pl.playerId,
      name: pl.name,
      pos: pl.pos,
      posGroup: posGroup(pl.pos),
      age: 18 + (h % 14),
      from: from.name,
      fromCode: from.code,
      fromClubId: clubId(from.code),
      to: to.name,
      toCode: to.code,
      toClubId: clubId(to.code),
      fee,
      feeDisplay: feeLabel(fee, type),
      type,
      league: to.league,
      real: false,
      date: `2025-${String(1 + (h % 6)).padStart(2, '0')}-${String(1 + (h % 27)).padStart(2, '0')}`,
    })
  }
  return rows
}

function realRumors() {
  return RUMORS.map((r, i) => {
    const src = SOURCES.find((s) => s.name === r.source) || SOURCES[i % SOURCES.length]
    const fromClub = CLUB_POOL.find((c) => c.code === r.from) || { name: r.from, code: r.from, league: 'Other' }
    const toClub = CLUB_POOL.find((c) => c.code === r.to) || { name: r.to, code: r.to, league: 'Other' }
    return {
      id: `rumor-real-${i}`,
      playerId: r.playerId,
      name: r.player,
      pos: r.pos,
      posGroup: posGroup(r.pos),
      age: r.age,
      from: fromClub.name,
      fromCode: r.from,
      fromClubId: clubId(r.from),
      to: toClub.name,
      toCode: r.to,
      toClubId: clubId(r.to),
      probability: r.probability,
      fee: r.fee,
      source: r.source,
      tier: src.tier,
      league: toClub.league || LEAGUE_BY_CODE[r.to] || 'Other',
      real: true,
    }
  })
}

function syntheticRumors(count = 36) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const h = hash(i + 8801)
    const pl = pick(PLAYER_POOL, h)
    let from = pick(CLUB_POOL, h >> 3)
    let to = pick(CLUB_POOL, h >> 6)
    if (from.code === to.code) to = pick(CLUB_POOL, h >> 9)
    const src = pick(SOURCES, h >> 4)
    const probability = 8 + (h % 88)
    rows.push({
      id: `rumor-syn-${i}`,
      playerId: pl.playerId,
      name: pl.name,
      pos: pl.pos,
      posGroup: posGroup(pl.pos),
      age: 18 + (h % 15),
      from: from.name,
      fromCode: from.code,
      fromClubId: clubId(from.code),
      to: to.name,
      toCode: to.code,
      toClubId: clubId(to.code),
      probability,
      fee: 8 + (h % 160),
      source: src.name,
      tier: src.tier,
      league: to.league,
      real: false,
    })
  }
  return rows.sort((a, b) => b.probability - a.probability)
}

function realMovers() {
  const fromUpdates = VALUE_UPDATES.map((u, i) => {
    const deltaPct = u.old > 0 ? +(((u.value - u.old) / u.old) * 100).toFixed(1) : 0
    return {
      id: `mover-vu-${i}`,
      playerId: u.playerId,
      name: u.name,
      pos: u.pos,
      posGroup: posGroup(u.pos),
      age: u.age,
      club: u.club,
      clubCode: u.cc,
      clubId: clubId(u.cc),
      value: u.value,
      oldValue: u.old,
      deltaPct,
      direction: deltaPct >= 0 ? 'up' : 'down',
      league: LEAGUE_BY_CODE[u.cc] || 'Other',
      real: true,
    }
  })

  // Enrich with SMART_RISERS that may not be in VALUE_UPDATES
  const seen = new Set(fromUpdates.map((m) => m.playerId + m.name))
  for (const r of SMART_RISERS) {
    const key = r.playerId + r.name
    if (seen.has(key)) continue
    const old = +(r.value / (1 + r.trend / 100)).toFixed(1)
    fromUpdates.push({
      id: `mover-sr-${r.playerId}`,
      playerId: r.playerId,
      name: r.name,
      pos: r.pos,
      posGroup: posGroup(r.pos),
      age: r.age,
      club: r.club,
      clubCode: r.cc,
      clubId: clubId(r.cc),
      value: r.value,
      oldValue: old,
      deltaPct: r.trend,
      direction: r.trend >= 0 ? 'up' : 'down',
      league: LEAGUE_BY_CODE[r.cc] || 'Other',
      real: true,
    })
  }
  return fromUpdates
}

function syntheticMovers(count = 28) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const h = hash(i + 12011)
    const pl = pick(PLAYER_POOL, h)
    const club = pick(CLUB_POOL, h >> 4)
    const value = 8 + (h % 160)
    const up = (h % 100) > 42
    const deltaPct = up ? +(4 + (h % 40) + (h % 10) / 10).toFixed(1) : -+(3 + (h % 28) + (h % 10) / 10).toFixed(1)
    const oldValue = +(value / (1 + deltaPct / 100)).toFixed(1)
    rows.push({
      id: `mover-syn-${i}`,
      playerId: pl.playerId,
      name: pl.name,
      pos: pl.pos,
      posGroup: posGroup(pl.pos),
      age: 18 + (h % 14),
      club: club.name,
      clubCode: club.code,
      clubId: clubId(club.code),
      value,
      oldValue,
      deltaPct,
      direction: up ? 'up' : 'down',
      league: club.league,
      real: false,
    })
  }
  return rows
}

export const TRANSFER_LEDGER = [...realTransfers(), ...syntheticTransfers()]
  .map(normalizeMarketTransfer)
  .sort((a, b) => {
    if (a.fee !== b.fee) return b.fee - a.fee
    return a.name.localeCompare(b.name)
  })

export const RUMOR_MILL = [...realRumors(), ...syntheticRumors()]
  .map(normalizeRumor)
  .sort((a, b) => b.probability - a.probability)

const ALL_MOVERS = [...realMovers(), ...syntheticMovers()]

export const VALUE_RISERS = ALL_MOVERS.filter((m) => m.direction === 'up').sort(
  (a, b) => b.deltaPct - a.deltaPct,
)

export const VALUE_DROPPERS = ALL_MOVERS.filter((m) => m.direction === 'down').sort(
  (a, b) => a.deltaPct - b.deltaPct,
)

export function matchesMarketFilters(row, filters) {
  const q = filters.query
  if (q) {
    const hay = [row.name, row.from, row.to, row.club, row.fromCode, row.toCode, row.clubCode]
      .filter(Boolean)
      .join(' ')
    // fold applied by caller
    if (!filters.foldHay(hay).includes(q)) return false
  }
  if (filters.league && filters.league !== 'All leagues' && row.league !== filters.league) {
    return false
  }
  if (filters.posGroups?.length && !filters.posGroups.includes(row.posGroup)) return false
  if (filters.transferType && filters.transferType !== 'all' && row.type && row.type !== filters.transferType) {
    return false
  }
  return true
}
