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

/** Data layer status — flip provider when API lands */
export const DATA_SOURCE = {
  mode: 'mock', // 'mock' | 'api'
  provider: null, // 'api-football' | 'sportmonks' | null
  season: CURRENT_SEASON,
  window: CURRENT_WINDOW,
  asOf: '2026-07-11',
  readyForApi: true,
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
  return {
    ...raw,
    externalIds: emptyExternalIds(raw.externalIds),
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
    leagueId: raw.leagueId ?? null,
    nextFixtures: raw.nextFixtures ?? [],
    lastResults: raw.lastResults ?? [],
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
  return {
    ...raw,
    externalIds: emptyExternalIds(raw.externalIds),
    seasonId: raw.seasonId ?? CURRENT_SEASON.id,
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
