/* ------------------------------------------------------------------ */
/*  Global competitions catalog for CompetitionsHub                    */
/* ------------------------------------------------------------------ */

import { LEAGUES_DETAIL, CLUBS } from './dataLayer.js'

/** Elite continental / global cups shown in premium row */
export const ELITE_CUP_IDS = [
  'ucl',
  'uel',
  'uecl',
  'afc-cl',
  'libertadores',
  'caf-cl',
  'concacaf-cc',
  'club-world-cup',
]

/** Continent accordion order + confederation label */
export const CONTINENT_REGIONS = [
  { id: 'Europe', label: 'Europe', confederation: 'UEFA', accent: 'sky' },
  { id: 'South America', label: 'South America', confederation: 'CONMEBOL', accent: 'emerald' },
  { id: 'North America', label: 'North America', confederation: 'CONCACAF', accent: 'violet' },
  { id: 'Asia', label: 'Asia', confederation: 'AFC', accent: 'amber' },
  { id: 'Africa', label: 'Africa', confederation: 'CAF', accent: 'rose' },
  { id: 'Oceania', label: 'Oceania', confederation: 'OFC / AFC', accent: 'cyan' },
]

function confederationFor(l) {
  if (l.confederation) return l.confederation
  if (l.type === 'international') {
    if (l.id === 'ucl' || l.id === 'uel' || l.id === 'uecl') return 'UEFA'
    if (l.continent === 'Asia') return 'AFC'
    if (l.continent === 'South America') return 'CONMEBOL'
    if (l.continent === 'Africa') return 'CAF'
    if (l.continent === 'North America') return 'CONCACAF'
    if (l.continent === 'World') return 'FIFA'
    return 'International'
  }
  const map = {
    Europe: 'UEFA',
    'South America': 'CONMEBOL',
    'North America': 'CONCACAF',
    Asia: 'AFC',
    Africa: 'CAF',
    Oceania: 'OFC',
  }
  return map[l.continent] || '—'
}

function championValueBn(l, champClubId) {
  if (champClubId && CLUBS[champClubId]?.squadValue != null) {
    // club squadValue is in €M
    return +(CLUBS[champClubId].squadValue / 1000).toFixed(3)
  }
  // ~11–18% of league total value as defending champion proxy
  const share = l.type === 'international' ? 0.09 : 0.14
  return +(l.totalValue * share).toFixed(3)
}

function toRow(l) {
  const top = l.standings?.[0]
  const champion = top?.club || 'TBD'
  const championClubId = top?.clubId || null
  const championCode = top?.code || '—'
  const totalValue = Number(l.totalValue) || 0
  // Mock leagues store totalValue in €bn; warehouse may store €M-ish squad sums
  const totalValueBn = totalValue > 50 ? totalValue / 1000 : totalValue
  const playersCount = Number(l.players) || 0
  const avgPlayerValue =
    playersCount > 0 ? +((totalValueBn * 1000) / playersCount).toFixed(2) : 0

  let championValue = 0
  try {
    championValue = championValueBn(l, championClubId) || 0
  } catch {
    championValue = 0
  }

  return {
    id: l.id,
    leagueId: l.id,
    name: l.name,
    fullName: l.fullName || l.name,
    code: l.code,
    country: l.country,
    nationId: l.nationId || null,
    nationCode: l.nationCode || '—',
    continent: l.continent,
    confederation: confederationFor(l),
    type: l.type === 'international' || l.meta?.type === 'international_cup' ? 'continental' : 'domestic',
    elite: ELITE_CUP_IDS.includes(l.id),
    totalValue: totalValueBn,
    teams: l.teams || 0,
    players: playersCount,
    avgPlayerValue,
    champion,
    championClubId,
    championCode,
    championValue,
    founded: l.founded,
    real: !l.catalogStub,
  }
}

export const COMPETITION_DIRECTORY = Object.values(LEAGUES_DETAIL)
  .map(toRow)
  .sort((a, b) => b.totalValue - a.totalValue)

export function rebuildCompetitionDirectory(leaguesRecord) {
  const rows = Object.values(leaguesRecord || {})
    .map(toRow)
    .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
  COMPETITION_DIRECTORY.length = 0
  COMPETITION_DIRECTORY.push(...rows)
}

export function formatBn(v) {
  if (v >= 10) return `€${v.toFixed(1)}bn`
  if (v >= 1) return `€${v.toFixed(2)}bn`
  return `€${(v * 1000).toFixed(0)}M`
}

export function formatPlayerValue(m) {
  if (m >= 10) return `€${m.toFixed(1)}M`
  if (m >= 1) return `€${m.toFixed(2)}M`
  return `€${(m * 1000).toFixed(0)}k`
}
