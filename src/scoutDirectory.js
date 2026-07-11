/* ------------------------------------------------------------------ */
/*  Advanced Scouting Directory — expanded mock index                  */
/*  Real PLAYERS are linked; synthetic rows fill density / pagination. */
/* ------------------------------------------------------------------ */

import { PLAYERS } from './dataLayer.js'

export const SCOUT_LEAGUES = [
  'All Leagues',
  'Premier League',
  'La Liga',
  'Bundesliga',
  'Serie A',
  'Ligue 1',
  'Trendyol Süper Lig',
  'Eredivisie',
  'Primeira Liga',
  'Belgian Pro League',
]

export const POS_GROUPS = {
  GK: ['Goalkeeper'],
  DEF: ['Centre-Back', 'Left-Back', 'Right-Back', 'Defender'],
  MID: ['Defensive Mid', 'Central Mid', 'Attacking Midfield', 'Attacking Mid', 'Left Mid', 'Right Mid'],
  FWD: ['Striker', 'Centre-Forward', 'Left Winger', 'Right Winger', 'Second Striker'],
}

export const SUB_POSITIONS = [
  'Goalkeeper',
  'Centre-Back',
  'Left-Back',
  'Right-Back',
  'Defensive Mid',
  'Central Mid',
  'Attacking Midfield',
  'Left Winger',
  'Right Winger',
  'Striker',
]

const FIRST = [
  'Alex', 'Bruno', 'Carlos', 'Diego', 'Enzo', 'Felix', 'Gabriel', 'Hugo', 'Ivan', 'João',
  'Kai', 'Leon', 'Mateo', 'Noah', 'Oscar', 'Pablo', 'Quinn', 'Rafael', 'Sergio', 'Tyler',
  'Ulrich', 'Victor', 'William', 'Xavi', 'Yannick', 'Zinedine', 'Amadou', 'Bilal', 'Cem', 'Deniz',
  'Eren', 'Faruk', 'Gökhan', 'Halil', 'İbrahim', 'Kerem', 'Luka', 'Milan', 'Nico', 'Ozan',
]

const LAST = [
  'Silva', 'Santos', 'García', 'Martínez', 'Fernández', 'Rodríguez', 'Müller', 'Schmidt', 'Rossi', 'Moretti',
  'Dubois', 'Bernard', 'Jensen', 'Nielsen', 'Kowalski', 'Nowak', 'Popov', 'Ivanov', 'Yılmaz', 'Demir',
  'Kaya', 'Şahin', 'Öztürk', 'Chen', 'Kim', 'Tanaka', 'Singh', 'Patel', 'Alonso', 'Navarro',
  'Costa', 'Pereira', 'Bakayoko', 'Touré', 'Diallo', 'Camara', 'Ibrahimović', 'Højlund', 'Berg', 'Lindner',
]

const CLUBS_POOL = [
  { club: 'Man City', clubShort: 'MCI', clubId: null, league: 'Premier League' },
  { club: 'Arsenal', clubShort: 'ARS', clubId: null, league: 'Premier League' },
  { club: 'Liverpool', clubShort: 'LIV', clubId: null, league: 'Premier League' },
  { club: 'Chelsea', clubShort: 'CHE', clubId: null, league: 'Premier League' },
  { club: 'FC Barcelona', clubShort: 'BAR', clubId: 'fc-barcelona', league: 'La Liga' },
  { club: 'Real Madrid', clubShort: 'RMA', clubId: 'real-madrid', league: 'La Liga' },
  { club: 'Atlético Madrid', clubShort: 'ATM', clubId: null, league: 'La Liga' },
  { club: 'Bayern Munich', clubShort: 'FCB', clubId: 'bayern-munich', league: 'Bundesliga' },
  { club: 'Dortmund', clubShort: 'BVB', clubId: null, league: 'Bundesliga' },
  { club: 'Leverkusen', clubShort: 'B04', clubId: null, league: 'Bundesliga' },
  { club: 'Inter', clubShort: 'INT', clubId: null, league: 'Serie A' },
  { club: 'Milan', clubShort: 'MIL', clubId: null, league: 'Serie A' },
  { club: 'Juventus', clubShort: 'JUV', clubId: 'juventus', league: 'Serie A' },
  { club: 'Napoli', clubShort: 'NAP', clubId: null, league: 'Serie A' },
  { club: 'Paris SG', clubShort: 'PSG', clubId: 'psg', league: 'Ligue 1' },
  { club: 'Monaco', clubShort: 'ASM', clubId: null, league: 'Ligue 1' },
  { club: 'Marseille', clubShort: 'OM', clubId: null, league: 'Ligue 1' },
  { club: 'Galatasaray', clubShort: 'GS', clubId: null, league: 'Trendyol Süper Lig' },
  { club: 'Fenerbahçe', clubShort: 'FB', clubId: null, league: 'Trendyol Süper Lig' },
  { club: 'Beşiktaş', clubShort: 'BJK', clubId: null, league: 'Trendyol Süper Lig' },
  { club: 'Ajax', clubShort: 'AJA', clubId: null, league: 'Eredivisie' },
  { club: 'PSV', clubShort: 'PSV', clubId: null, league: 'Eredivisie' },
  { club: 'Benfica', clubShort: 'SLB', clubId: null, league: 'Primeira Liga' },
  { club: 'Porto', clubShort: 'FCP', clubId: null, league: 'Primeira Liga' },
  { club: 'Club Brugge', clubShort: 'BRU', clubId: null, league: 'Belgian Pro League' },
]

const NATIONS_POOL = [
  { code: 'ESP', name: 'Spain' },
  { code: 'ENG', name: 'England' },
  { code: 'FRA', name: 'France' },
  { code: 'GER', name: 'Germany' },
  { code: 'ITA', name: 'Italy' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'POR', name: 'Portugal' },
  { code: 'NED', name: 'Netherlands' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'TUR', name: 'Türkiye' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'URU', name: 'Uruguay' },
  { code: 'CRO', name: 'Croatia' },
  { code: 'DEN', name: 'Denmark' },
  { code: 'SWE', name: 'Sweden' },
]

const POS_POOL = [
  { pos: 'Goalkeeper', group: 'GK' },
  { pos: 'Centre-Back', group: 'DEF' },
  { pos: 'Left-Back', group: 'DEF' },
  { pos: 'Right-Back', group: 'DEF' },
  { pos: 'Defensive Mid', group: 'MID' },
  { pos: 'Central Mid', group: 'MID' },
  { pos: 'Attacking Midfield', group: 'MID' },
  { pos: 'Left Winger', group: 'FWD' },
  { pos: 'Right Winger', group: 'FWD' },
  { pos: 'Striker', group: 'FWD' },
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

function mapRealPosition(position) {
  const p = position || ''
  if (/goal/i.test(p)) return { pos: 'Goalkeeper', group: 'GK' }
  if (/back|defen/i.test(p) && !/mid/i.test(p)) {
    if (/left/i.test(p)) return { pos: 'Left-Back', group: 'DEF' }
    if (/right/i.test(p)) return { pos: 'Right-Back', group: 'DEF' }
    return { pos: 'Centre-Back', group: 'DEF' }
  }
  if (/wing/i.test(p)) {
    if (/left/i.test(p)) return { pos: 'Left Winger', group: 'FWD' }
    return { pos: 'Right Winger', group: 'FWD' }
  }
  if (/strik|forward|centre-forward/i.test(p)) return { pos: 'Striker', group: 'FWD' }
  if (/attacking mid/i.test(p)) return { pos: 'Attacking Midfield', group: 'MID' }
  if (/defensive mid/i.test(p)) return { pos: 'Defensive Mid', group: 'MID' }
  if (/mid/i.test(p)) return { pos: 'Central Mid', group: 'MID' }
  return { pos: p || 'Central Mid', group: 'MID' }
}

function realToScoutRow(p) {
  const { pos, group } = mapRealPosition(p.pos || p.position)
  const goals = p.seasonStats?.goals ?? 0
  const assists = p.seasonStats?.assists ?? 0
  const form = +(6.2 + (Math.min(p.value || 0, 180) / 180) * 1.8 + ((p.age || 25) % 7) / 10).toFixed(2)
  return {
    id: p.id,
    playerId: p.id,
    name: p.name,
    nation: p.nation || { code: '—', name: '—' },
    club: p.club,
    clubShort: p.clubShort,
    clubId: p.clubId || null,
    league: p.league || '—',
    position: pos,
    posGroup: p.posGroup || group,
    age: p.age,
    form: Math.min(9.5, form),
    goals,
    assists,
    contractUntil: p.contractUntil,
    value: p.value || 0,
    status: p.contractUntil && p.contractUntil <= 2026 ? 'expiring' : 'active',
    loan: false,
    real: true,
    imageUrl: p.imageUrl || null,
  }
}

function syntheticRow(i) {
  const h = hash(i + 9001)
  const club = pick(CLUBS_POOL, h)
  const pos = pick(POS_POOL, h >> 3)
  const nation = pick(NATIONS_POOL, h >> 5)
  const age = 17 + (h % 20)
  const value = Math.max(0.5, Math.round(((h % 1900) / 10 + (pos.group === 'FWD' ? 8 : 0)) * 10) / 10)
  const contractUntil = 2025 + (h % 7) // 2025–2031
  const loan = (h % 23) === 0
  const free = contractUntil <= 2025 && (h % 11) === 0
  let status = 'active'
  if (free) status = 'free'
  else if (contractUntil <= 2026) status = 'expiring'
  if (loan) status = 'loan'

  const first = pick(FIRST, h >> 7)
  const last = pick(LAST, h >> 11)
  const form = +(5.8 + (h % 280) / 100).toFixed(2)
  const goals = pos.group === 'GK' ? 0 : (h % 22)
  const assists = pos.group === 'GK' ? 0 : ((h >> 2) % 16)

  return {
    id: `scout-${i}`,
    playerId: null, // synthetic — no deep dossier
    name: `${first} ${last}`,
    nation,
    club: club.club,
    clubShort: club.clubShort,
    clubId: club.clubId,
    league: club.league,
    position: pos.pos,
    posGroup: pos.group,
    age,
    form: Math.min(9.4, form),
    goals,
    assists,
    contractUntil: free ? 2025 : contractUntil,
    value,
    status,
    loan,
    real: false,
  }
}

/** Full scouting cache used by filters (real + synthetic in mock mode) */
export const SCOUT_DIRECTORY = (() => {
  const reals = Object.values(PLAYERS).map(realToScoutRow)
  const synth = Array.from({ length: 293 }, (_, i) => syntheticRow(i + 1))
  return [...reals, ...synth]
})()

/** Global index brand number — updated after Supabase hydrate */
export let GLOBAL_INDEX_SIZE = 14842

/** Replace directory with warehouse players (no synthetic filler). */
export function rebuildScoutDirectory(playersRecord) {
  const reals = Object.values(playersRecord || {})
    .map(realToScoutRow)
    .sort((a, b) => (b.value || 0) - (a.value || 0))
  SCOUT_DIRECTORY.length = 0
  SCOUT_DIRECTORY.push(...reals)
  GLOBAL_INDEX_SIZE = reals.length
  // Dynamic league list from data
  const leagues = [...new Set(reals.map((r) => r.league).filter((l) => l && l !== '—'))].sort()
  SCOUT_LEAGUES.length = 0
  SCOUT_LEAGUES.push('All Leagues', ...leagues)
}

export function posGroupOf(position) {
  for (const [g, list] of Object.entries(POS_GROUPS)) {
    if (list.some((x) => x.toLowerCase() === position.toLowerCase())) return g
  }
  return mapRealPosition(position).group
}
