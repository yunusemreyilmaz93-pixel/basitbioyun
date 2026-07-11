/* ------------------------------------------------------------------ */
/*  API-ready entity schema + normalizers (mock today, API tomorrow)   */
/* ------------------------------------------------------------------ */

/** Active product season — every stats block should reference this */
export const CURRENT_SEASON = {
  id: '2025-26',
  label: '2025/26',
  yearStart: 2025,
  yearEnd: 2026,
}

/** Active transfer window context for Market Hub */
export const CURRENT_WINDOW = {
  id: '2026-summer',
  label: 'Summer 2026',
  seasonId: CURRENT_SEASON.id,
  opens: '2026-06-01',
  closes: '2026-09-01',
}

/** Data layer status — mock | supabase | api */
const envMode =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATA_MODE) || 'auto'
const hasSupabase =
  typeof import.meta !== 'undefined' &&
  Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY)

// auto: use supabase when keys exist (unless forced mock)
const resolvedMode =
  envMode === 'mock'
    ? 'mock'
    : envMode === 'api'
      ? 'api'
      : envMode === 'supabase' || (envMode === 'auto' && hasSupabase)
        ? hasSupabase
          ? 'supabase'
          : 'mock'
        : 'mock'

export const DATA_SOURCE = {
  mode: resolvedMode,
  provider: resolvedMode === 'supabase' ? 'supabase' : null,
  season: CURRENT_SEASON,
  window: CURRENT_WINDOW,
  asOf: '2026-07-11',
  readyForApi: true,
  supabaseConfigured: hasSupabase,
  warehouse: null,
}

export function emptyExternalIds(partial = {}) {
  return {
    apiFootball: partial.apiFootball ?? null,
    sportmonks: partial.sportmonks ?? null,
    transfermarkt: partial.transfermarkt ?? null,
  }
}

/**
 * Smart Market Value envelope — never a bare number alone.
 * API layer should fill `inputs` from live signals later.
 */
export function buildSmv(value, opts = {}) {
  const v = Number(value) || 0
  const conf = opts.confidence ?? 74
  const bandPct = opts.bandPct ?? 0.12
  const band = Math.max(2, Math.round(v * bandPct))
  return {
    value: v,
    low: Math.max(0, v - band),
    high: v + band,
    confidence: conf,
    asOf: opts.asOf ?? DATA_SOURCE.asOf,
    currency: 'EUR',
    unit: 'million',
    source: opts.source ?? 'basitbi-smv-v0-mock',
    inputs: opts.inputs ?? [
      { key: 'league', weight: 34 },
      { key: 'form', weight: 28 },
      { key: 'age', weight: 26 },
      { key: 'caps', weight: 12 },
    ],
  }
}

function seasonStatsShape(raw = {}, seasonId = CURRENT_SEASON.id) {
  return {
    seasonId,
    matches: raw.matches ?? 0,
    starts: raw.starts ?? Math.max(0, Math.round((raw.matches ?? 0) * 0.78)),
    goals: raw.goals ?? 0,
    assists: raw.assists ?? 0,
    minutes: raw.minutes ?? 0,
    yellow: raw.yellow ?? 0,
    red: raw.red ?? 0,
  }
}

function normalizeTransferRow(t, seasonId = CURRENT_SEASON.id) {
  return {
    ...t,
    seasonId: t.seasonId ?? (t.year && t.year >= 2025 ? CURRENT_SEASON.id : t.seasonId ?? null),
    windowId: t.windowId ?? null,
    fee: t.fee ?? null,
    feeCurrency: t.feeCurrency ?? 'EUR',
    feeUnit: t.feeUnit ?? 'million',
    marketValue: t.marketValue ?? null,
    type: t.type ?? (t.fee === 0 ? 'Free' : t.fee != null ? 'Transfer' : 'Other'),
    externalIds: emptyExternalIds(t.externalIds),
  }
}

/** Player core dossier */
export function normalizePlayer(raw) {
  if (!raw) return null
  const value = raw.value ?? raw.smv?.value ?? 0
  const smv = raw.smv?.value != null ? { ...buildSmv(raw.smv.value, raw.smv), ...raw.smv } : buildSmv(value, {
    confidence: raw.smvConfidence,
    asOf: raw.smvAsOf,
  })
  // Keep single number in sync for legacy UI
  smv.value = value

  return {
    ...raw,
    externalIds: emptyExternalIds(raw.externalIds),
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    value,
    smv,
    trendPct: raw.trendPct ?? 0,
    contractUntil: raw.contractUntil ?? null,
    contractEnd: raw.contractEnd ?? (raw.contractUntil ? `Jun ${raw.contractUntil}` : null),
    releaseClause: raw.releaseClause ?? null,
    seasonStats: seasonStatsShape(raw.seasonStats, raw.seasonId ?? CURRENT_SEASON.id),
    transfers: (raw.transfers || []).map((t) => normalizeTransferRow(t)),
    meta: {
      source: DATA_SOURCE.mode,
      provider: DATA_SOURCE.provider,
      ...(raw.meta || {}),
    },
  }
}

/** Deep player details (competitions, career, valuation breakdown) */
export function normalizePlayerDetails(raw, playerId) {
  if (!raw) return null
  const comps = (raw.competitions || []).map((c) => ({
    ...c,
    seasonId: c.seasonId ?? CURRENT_SEASON.id,
    yellow: c.yellow ?? 0,
    red: c.red ?? 0,
  }))
  const yellow = comps.reduce((a, c) => a + (c.yellow || 0), 0)
  const red = comps.reduce((a, c) => a + (c.red || 0), 0)

  return {
    ...raw,
    id: raw.id ?? playerId,
    externalIds: emptyExternalIds(raw.externalIds),
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    competitions: comps,
    /** Convenience rollup for overview cards */
    cardTotals: { yellow, red },
    career: (raw.career || []).map((row) => ({
      ...row,
      seasonId: row.seasonId ?? null,
    })),
    meta: {
      source: DATA_SOURCE.mode,
      ...(raw.meta || {}),
    },
  }
}

export function normalizeClub(raw) {
  if (!raw) return null
  const stadium =
    raw.stadium && typeof raw.stadium === 'object'
      ? {
          name: raw.stadium.name || '—',
          capacity: raw.stadium.capacity ?? 0,
          city: raw.stadium.city || '—',
          pitch: raw.stadium.pitch || '—',
        }
      : { name: '—', capacity: 0, city: '—', pitch: '—' }
  const transfers = raw.transfers && typeof raw.transfers === 'object'
    ? {
        arrivals: Array.isArray(raw.transfers.arrivals) ? raw.transfers.arrivals : [],
        departures: Array.isArray(raw.transfers.departures) ? raw.transfers.departures : [],
      }
    : { arrivals: [], departures: [] }
  return {
    ...raw,
    externalIds: emptyExternalIds(raw.externalIds),
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    leagueId: raw.leagueId ?? null,
    stadium,
    transfers,
    // Support both shapes: grouped {GK,DEF,MID,FWD} (UI) or flat array
    squad: (() => {
      if (!raw.squad) return { GK: [], DEF: [], MID: [], FWD: [] }
      if (Array.isArray(raw.squad)) {
        const g = { GK: [], DEF: [], MID: [], FWD: [] }
        for (const pl of raw.squad) {
          const key = pl.posGroup || pl.group || 'MID'
          ;(g[key] || g.MID).push(pl)
        }
        return g
      }
      return {
        GK: Array.isArray(raw.squad.GK) ? raw.squad.GK : [],
        DEF: Array.isArray(raw.squad.DEF) ? raw.squad.DEF : [],
        MID: Array.isArray(raw.squad.MID) ? raw.squad.MID : [],
        FWD: Array.isArray(raw.squad.FWD) ? raw.squad.FWD : [],
      }
    })(),
    startingXI: Array.isArray(raw.startingXI) ? raw.startingXI : [],
    standings: Array.isArray(raw.standings) ? raw.standings : [],
    nextFixtures: Array.isArray(raw.nextFixtures) ? raw.nextFixtures : [],
    lastResults: Array.isArray(raw.lastResults) ? raw.lastResults : [],
    squadSize:
      raw.squadSize ??
      (raw.squad && !Array.isArray(raw.squad)
        ? (raw.squad.GK?.length || 0) +
          (raw.squad.DEF?.length || 0) +
          (raw.squad.MID?.length || 0) +
          (raw.squad.FWD?.length || 0)
        : Array.isArray(raw.squad)
          ? raw.squad.length
          : 0),
    avgAge: raw.avgAge ?? 0,
    foreignersPct: raw.foreignersPct ?? 0,
    squadValue: raw.squadValue ?? 0,
    manager: raw.manager || { name: '—', managerId: null },
    formation: raw.formation || '—',
    meta: {
      source: DATA_SOURCE.mode,
      provider: DATA_SOURCE.provider,
      ...(raw.meta || {}),
    },
  }
}

export function normalizeMatch(raw) {
  if (!raw) return null
  const status = raw.status ?? 'ns'
  return {
    ...raw,
    externalIds: emptyExternalIds(raw.externalIds),
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    /** Canonical status: live | ft | ns | postponed | cancelled */
    status,
    statusDetail: raw.statusDetail ?? null,
    /** Per-player ratings for pitch UI (optional; filled by API or mock) */
    playerRatings: raw.playerRatings ?? null,
    meta: {
      source: DATA_SOURCE.mode,
      provider: DATA_SOURCE.provider,
      ...(raw.meta || {}),
    },
  }
}

export function normalizeLeague(raw) {
  if (!raw) return null
  const zones = raw.zones && typeof raw.zones === 'object'
    ? {
        ucl: raw.zones.ucl || { max: 4, label: 'UEFA Champions League' },
        uel: raw.zones.uel,
        uecl: raw.zones.uecl,
        relegation: raw.zones.relegation || { min: 18, max: 20, label: 'Relegation' },
      }
    : {
        ucl: { max: 4, label: 'UEFA Champions League' },
        relegation: { min: 18, max: 20, label: 'Relegation' },
      }
  return {
    ...raw,
    externalIds: emptyExternalIds(raw.externalIds),
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    zones,
    standings: Array.isArray(raw.standings) ? raw.standings : [],
    allTime: Array.isArray(raw.allTime) ? raw.allTime : [],
    leaders: raw.leaders && typeof raw.leaders === 'object' ? raw.leaders : {},
    bestXi: Array.isArray(raw.bestXi) ? raw.bestXi : [],
    teams: raw.teams ?? 0,
    players: raw.players ?? 0,
    foreignersPct: raw.foreignersPct ?? 0,
    avgAge: raw.avgAge ?? 0,
    totalValue: raw.totalValue ?? 0,
    meta: {
      source: DATA_SOURCE.mode,
      provider: DATA_SOURCE.provider,
      catalogStub: !!raw.catalogStub,
      ...(raw.meta || {}),
    },
  }
}

export function normalizeNation(raw) {
  if (!raw) return null
  return {
    ...raw,
    externalIds: emptyExternalIds(raw.externalIds),
    squad: Array.isArray(raw.squad) ? raw.squad : [],
    fixtures: Array.isArray(raw.fixtures) ? raw.fixtures : [],
    trophies: Array.isArray(raw.trophies) ? raw.trophies : [],
    legends: raw.legends && typeof raw.legends === 'object' ? raw.legends : {},
    rankingHistory: Array.isArray(raw.rankingHistory) ? raw.rankingHistory : [],
    coach: raw.coach || { name: '—' },
    stadium: raw.stadium && typeof raw.stadium === 'object' ? raw.stadium : {},
    colors: raw.colors && typeof raw.colors === 'object' ? raw.colors : {},
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    meta: {
      source: DATA_SOURCE.mode,
      provider: DATA_SOURCE.provider,
      ...(raw.meta || {}),
    },
  }
}

export function normalizeManager(raw) {
  if (!raw) return null
  return {
    ...raw,
    externalIds: emptyExternalIds(raw.externalIds),
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    meta: {
      source: DATA_SOURCE.mode,
      provider: DATA_SOURCE.provider,
      ...(raw.meta || {}),
    },
  }
}

/** Market ledger / rumor rows */
export function normalizeMarketTransfer(raw) {
  if (!raw) return null
  return {
    ...raw,
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    windowId: raw.windowId ?? CURRENT_WINDOW.id,
    updatedAt: raw.updatedAt ?? `${DATA_SOURCE.asOf}T12:00:00Z`,
    externalIds: emptyExternalIds(raw.externalIds),
    meta: { source: DATA_SOURCE.mode, ...(raw.meta || {}) },
  }
}

export function normalizeRumor(raw) {
  if (!raw) return null
  return {
    ...raw,
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    windowId: raw.windowId ?? CURRENT_WINDOW.id,
    firstSeenAt: raw.firstSeenAt ?? `${DATA_SOURCE.asOf}T08:00:00Z`,
    updatedAt: raw.updatedAt ?? `${DATA_SOURCE.asOf}T12:00:00Z`,
    direction: raw.direction ?? 'in',
    externalIds: emptyExternalIds(raw.externalIds),
    meta: { source: DATA_SOURCE.mode, ...(raw.meta || {}) },
  }
}

export function mapRecord(obj, normalize) {
  const out = {}
  for (const [k, v] of Object.entries(obj || {})) {
    out[k] = normalize(v)
  }
  return out
}
