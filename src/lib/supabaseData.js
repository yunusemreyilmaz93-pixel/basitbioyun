/**
 * Load Transfermarkt staging tables → app-shaped records.
 * Future: swap to live API for fresh rows; keep this as historical warehouse reader.
 */
import { supabase } from './supabase.js'

const PAGE = 1000

async function fetchAll(table, { select = '*', order, ascending = true } = {}) {
  if (!supabase) throw new Error('Supabase not configured')
  let from = 0
  const all = []
  for (;;) {
    let q = supabase.schema('staging').from(table).select(select).range(from, from + PAGE - 1)
    if (order) q = q.order(order, { ascending })
    const { data, error } = await q
    if (error) throw error
    if (!data?.length) break
    all.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return all
}

function guessPosCode(pos) {
  const p = String(pos || '').toLowerCase()
  if (p.includes('goal')) return 'GK'
  if (p.includes('left-back') || p.includes('left back')) return 'LB'
  if (p.includes('right-back') || p.includes('right back')) return 'RB'
  if (p.includes('centre-back') || p.includes('center-back') || p.includes('central defend')) return 'CB'
  if (p.includes('defensive mid')) return 'DM'
  if (p.includes('attacking mid')) return 'AM'
  if (p.includes('left winger') || p.includes('left mid')) return 'LW'
  if (p.includes('right winger') || p.includes('right mid')) return 'RW'
  if (p.includes('second striker')) return 'SS'
  if (p.includes('striker') || p.includes('centre-forward') || p.includes('center-forward')) return 'ST'
  if (p.includes('mid')) return 'CM'
  if (p.includes('forward') || p.includes('attack')) return 'ST'
  if (p.includes('defend')) return 'CB'
  return 'CM'
}

function eurToM(v) {
  if (v == null || v === '') return 0
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round((n / 1_000_000) * 100) / 100
}

function posGroup(position, sub) {
  const p = `${position || ''} ${sub || ''}`.toLowerCase()
  if (p.includes('goalkeep') || p === 'gk') return 'GK'
  if (
    p.includes('back') ||
    p.includes('defend') ||
    p.includes('centre-back') ||
    p.includes('center-back') ||
    p.includes('full-back') ||
    p.includes('wing-back')
  )
    return 'DEF'
  if (
    p.includes('mid') ||
    p.includes('wing') && p.includes('mid')
  )
    return 'MID'
  if (p.includes('attack') || p.includes('forward') || p.includes('striker') || p.includes('winger'))
    return 'FWD'
  if (position === 'Attack') return 'FWD'
  if (position === 'Defender') return 'DEF'
  if (position === 'Midfield') return 'MID'
  if (position === 'Goalkeeper') return 'GK'
  return 'MID'
}

function shortCode(name, fallback = 'FC') {
  if (!name) return fallback
  const parts = String(name).replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase()
  return parts
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function contractYear(dateStr) {
  if (!dateStr) return null
  const y = parseInt(String(dateStr).slice(0, 4), 10)
  return Number.isFinite(y) ? y : null
}

function ageFromDob(dob) {
  if (!dob) return null
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

function nationCode(citizenship) {
  if (!citizenship) return '—'
  // rough: first 3 letters upper
  return String(citizenship).slice(0, 3).toUpperCase()
}

function mapPlayer(row, clubMap) {
  const id = String(row.player_id)
  const clubId = row.current_club_id != null ? String(row.current_club_id) : null
  const club = clubId && clubMap[clubId]
  const valueM = eurToM(row.market_value_in_eur)
  const highM = eurToM(row.highest_market_value_in_eur)
  const pos = row.sub_position || row.position || '—'
  return {
    id,
    name: row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || id,
    age: ageFromDob(row.date_of_birth) ?? 25,
    pos,
    posGroup: posGroup(row.position, row.sub_position),
    foot: row.foot || '—',
    club: row.current_club_name || club?.name || 'Free Agent',
    clubId,
    clubShort: club?.short || shortCode(row.current_club_name),
    league: club?.league || row.current_club_domestic_competition_id || '—',
    nation: {
      name: row.country_of_citizenship || '—',
      code: nationCode(row.country_of_citizenship),
    },
    value: valueM,
    form: 6.5,
    goals: 0,
    assists: 0,
    contractUntil: contractYear(row.contract_expiration_date),
    height: row.height_in_cm ? `${row.height_in_cm} cm` : null,
    agent: row.agent_name || null,
    imageUrl: row.image_url || null,
    caps: row.international_caps ?? 0,
    ntGoals: row.international_goals ?? 0,
    highestValue: highM,
    seasonStats: {
      matches: 0,
      starts: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
      yellow: 0,
      red: 0,
    },
    transfers: [],
    valueHistory: highM
      ? [
          { year: 2022, value: Math.round(highM * 0.55 * 10) / 10 },
          { year: 2023, value: Math.round(highM * 0.75 * 10) / 10 },
          { year: 2024, value: Math.round(highM * 0.9 * 10) / 10 },
          { year: 2025, value: valueM || highM },
        ]
      : [],
    externalIds: { transfermarkt: row.player_id },
    meta: { source: 'supabase-staging', playerCode: row.player_code, url: row.url },
  }
}

function mapClubFixed(row, compMap) {
  const leagueId = row.domestic_competition_id || null
  const league = leagueId && compMap[leagueId]
  return {
    id: String(row.club_id),
    name: row.name,
    short: shortCode(row.name, (row.club_code || 'fc').slice(0, 3).toUpperCase()),
    league: league?.name || row.domestic_competition_id || '—',
    leagueCode: row.domestic_competition_id || null,
    leagueId: leagueId ? String(leagueId) : null,
    country: league?.country_name || null,
    founded: null,
    squadSize: row.squad_size ?? 0,
    avgAge: Number(row.average_age) || 0,
    foreignersPct: Number(row.foreigners_percentage) || 0,
    squadValue: eurToM(row.total_market_value),
    stadium: {
      name: row.stadium_name || '—',
      capacity: row.stadium_seats ?? 0,
      city: '—',
      pitch: '—',
    },
    formation: '4-3-3',
    manager: { name: row.coach_name || '—', managerId: null },
    squad: [],
    startingXI: [],
    standings: [],
    transfers: { arrivals: [], departures: [] },
    lastResults: [],
    nextFixtures: [],
    externalIds: { transfermarkt: row.club_id },
    meta: { url: row.url, clubCode: row.club_code },
  }
}

function mapLeague(row) {
  return {
    id: String(row.competition_id),
    name: row.name,
    fullName: row.name,
    code: row.competition_code || row.competition_id,
    country: row.country_name || null,
    confederation: row.confederation || null,
    teams: row.total_clubs ?? 0,
    players: 0,
    foreignersPct: 0,
    avgAge: 0,
    totalValue: 0,
    seasonId: '2025-26',
    zones: {
      ucl: { max: 4, label: 'UEFA Champions League' },
      relegation: { min: 18, max: 20, label: 'Relegation' },
    },
    standings: [],
    allTime: [],
    leaders: {},
    bestXi: [],
    externalIds: { transfermarkt: row.competition_id },
    meta: { type: row.type, subType: row.sub_type, url: row.url },
  }
}

function mapNation(row) {
  return {
    id: String(row.national_team_id),
    name: row.name,
    code: (row.country_code || row.team_code || '—').slice(0, 3).toUpperCase(),
    confederation: row.confederation || null,
    fifaRank: row.fifa_ranking ?? null,
    squadValue: eurToM(row.total_market_value),
    association: row.country_name || null,
    stadium: {},
    coach: { name: row.coach_name || '—' },
    colors: {},
    squad: [],
    fixtures: [],
    trophies: [],
    legends: {},
    rankingHistory: [],
    imageUrl: row.team_image_url || null,
    externalIds: { transfermarkt: row.national_team_id },
    meta: { url: row.url },
  }
}

function mapGame(row) {
  const homeGoals = row.home_club_goals
  const awayGoals = row.away_club_goals
  const played = homeGoals != null && awayGoals != null
  return {
    id: String(row.game_id),
    seasonId: row.season != null ? String(row.season) : '2025-26',
    league: row.competition_id || '—',
    leagueCode: row.competition_id || null,
    leagueId: row.competition_id ? String(row.competition_id) : null,
    status: played ? 'ft' : 'upcoming',
    kickoff: row.date || null,
    clock: played ? 'FT' : null,
    md: null,
    attendance: row.attendance ?? null,
    referee: row.referee || null,
    home: {
      name: row.home_club_name || 'Home',
      short: shortCode(row.home_club_name, 'HOM'),
      clubId: row.home_club_id != null ? String(row.home_club_id) : null,
      score: homeGoals,
      formation: row.home_club_formation || null,
    },
    away: {
      name: row.away_club_name || 'Away',
      short: shortCode(row.away_club_name, 'AWY'),
      clubId: row.away_club_id != null ? String(row.away_club_id) : null,
      score: awayGoals,
      formation: row.away_club_formation || null,
    },
    stats: {},
    events: [],
    momentum: [],
    externalIds: { transfermarkt: row.game_id },
    meta: { competitionType: row.competition_type, stadium: row.stadium, url: row.url },
  }
}

function toRecord(rows) {
  const out = {}
  for (const r of rows) {
    if (r?.id != null) out[r.id] = r
  }
  return out
}

/**
 * Full warehouse → app bundle (paginated).
 * Games limited to recent N for boot performance.
 */
export async function fetchSupabaseBundle({ maxGames = 1500 } = {}) {
  if (!supabase) throw new Error('Supabase not configured')

  const [comps, clubsRaw, playersRaw, nationsRaw, gamesRaw] = await Promise.all([
    fetchAll('competitions'),
    fetchAll('clubs'),
    fetchAll('players', { order: 'market_value_in_eur', ascending: false }),
    fetchAll('national_teams'),
    fetchAll('games', { order: 'date', ascending: false }),
  ])

  const leagues = toRecord(comps.map(mapLeague))
  const clubs = toRecord(clubsRaw.map((c) => mapClubFixed(c, Object.fromEntries(comps.map((x) => [x.competition_id, x])))))
  const clubMap = clubs
  const players = toRecord(playersRaw.map((p) => mapPlayer(p, clubMap)))

  // Attach squads to clubs
  for (const p of Object.values(players)) {
    if (!p.clubId || !clubs[p.clubId]) continue
    if (!clubs[p.clubId].squad) clubs[p.clubId].squad = []
    clubs[p.clubId].squad.push({
      playerId: p.id,
      name: p.name,
      pos: p.pos,
      age: p.age,
      value: p.value,
      nation: p.nation,
      imageUrl: p.imageUrl,
    })
  }

  // League totals
  for (const c of Object.values(clubs)) {
    const lid = c.leagueId
    if (lid && leagues[lid]) {
      leagues[lid].totalValue = (leagues[lid].totalValue || 0) + (c.squadValue || 0)
      leagues[lid].players = (leagues[lid].players || 0) + (c.squadSize || 0)
    }
  }

  const nations = toRecord(nationsRaw.map(mapNation))
  const gamesSlice = gamesRaw.slice(0, maxGames)
  const matches = toRecord(gamesSlice.map(mapGame))

  // Details shell so PlayerProfile can open (transfers/valuations filled on demand)
  const details = {}
  for (const p of Object.values(players)) {
    const posCode = guessPosCode(p.pos)
    details[p.id] = {
      height: p.height || '—',
      agent: p.agent || '—',
      joined: '—',
      outfitter: '—',
      positions: { main: posCode, others: [] },
      highest: { value: p.highestValue || p.value, date: '—' },
      competitions: [],
      career: [],
      injuries: [],
      nationalTeam: {
        code: p.nation?.code || '—',
        name: p.nation?.name || '—',
        caps: p.caps || 0,
        goals: p.ntGoals || 0,
        assists: 0,
        minutes: 0,
        debut: '—',
        coach: '—',
        seasons: [],
        tournaments: [],
      },
      smart: {
        league: { name: p.club, mult: 1.1, pct: 72, weight: 34, note: 'Top-5 UEFA coefficient league' },
        form: { rating: 7.1, pct: 72, weight: 28, note: 'Consistent elite output' },
        age: {
          label: p.age < 23 ? `Pre-peak upside (${p.age})` : p.age > 29 ? `At peak (${p.age})` : `Approaching peak (${p.age})`,
          pct: p.age < 23 ? 90 : 70,
          weight: 26,
          note: p.age < 23 ? 'Steepest part of the age curve' : 'High projection on the age curve',
        },
        nt: {
          label: `${p.caps || 0} ${p.nation?.name || ''} caps`.trim(),
          pct: Math.min(90, 40 + (p.caps || 0)),
          weight: 12,
          note: (p.caps || 0) > 20 ? 'Established senior international' : 'Regular senior starter',
        },
      },
      trophies: [],
      imageUrl: p.imageUrl,
    }
  }

  return {
    players,
    details,
    clubs,
    leagues,
    nations,
    managers: {},
    matches,
    meta: {
      counts: {
        players: Object.keys(players).length,
        clubs: Object.keys(clubs).length,
        leagues: Object.keys(leagues).length,
        nations: Object.keys(nations).length,
        matches: Object.keys(matches).length,
      },
    },
  }
}

/** Lazy enrich player transfers + valuation history from staging */
export async function fetchPlayerEnrichment(playerId) {
  if (!supabase || playerId == null) return { transfers: [], valueHistory: [] }

  const pid = String(playerId)
  const [{ data: tr, error: e1 }, { data: val, error: e2 }] = await Promise.all([
    supabase
      .schema('staging')
      .from('transfers')
      .select('*')
      .eq('player_id', pid)
      .order('transfer_date', { ascending: false })
      .limit(40),
    supabase
      .schema('staging')
      .from('player_valuations')
      .select('date,market_value_in_eur')
      .eq('player_id', pid)
      .order('date', { ascending: true })
      .limit(80),
  ])
  if (e1) console.warn('transfers', e1.message)
  if (e2) console.warn('valuations', e2.message)

  const transfers = (tr || []).map((t) => ({
    date: t.transfer_date,
    year: t.transfer_date ? parseInt(String(t.transfer_date).slice(0, 4), 10) : null,
    from: t.from_club_name || '—',
    to: t.to_club_name || '—',
    fee: eurToM(t.transfer_fee),
    marketValue: eurToM(t.market_value_in_eur),
    type: t.transfer_fee === 0 || t.transfer_fee === '0' ? 'Free' : 'Transfer',
  }))

  // downsample valuations to yearly peaks
  const byYear = {}
  for (const v of val || []) {
    const y = String(v.date || '').slice(0, 4)
    if (!y) continue
    const m = eurToM(v.market_value_in_eur)
    if (!byYear[y] || m > byYear[y]) byYear[y] = m
  }
  const valueHistory = Object.entries(byYear)
    .map(([year, value]) => ({ year: Number(year), value }))
    .sort((a, b) => a.year - b.year)

  return { transfers, valueHistory }
}

export async function fetchIntlResults(limit = 30) {
  if (!supabase) return []
  const { data, error } = await supabase
    .schema('staging')
    .from('intl_results')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)
  if (error) {
    console.warn(error.message)
    return []
  }
  return data || []
}
