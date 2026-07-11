/* ------------------------------------------------------------------ */
/*  Managers staff directory — real MANAGERS + synthetic density        */
/* ------------------------------------------------------------------ */

import { MANAGERS } from './dataLayer.js'

/** Marketing-size global staff index */
export const GLOBAL_MANAGER_INDEX = 1240

export const FORMATION_OPTIONS = [
  { id: 'all', label: 'All formations' },
  { id: '4-2-3-1', label: '4-2-3-1' },
  { id: '4-3-3', label: '4-3-3' },
  { id: '3-4-2-1', label: '3-4-2-1' },
]

const FIRST = [
  'Marco', 'Luca', 'Thomas', 'André', 'Rafael', 'Sergio', 'Niko', 'Gianluca',
  'Patrick', 'Oliver', 'Diego', 'Erik', 'Jorge', 'Stefan', 'Mikel', 'Fabio',
  'Roberto', 'Héctor', 'Ivan', 'Claudio', 'Lars', 'Paulo', 'Xabi', 'Jürgen',
  'Antonio', 'Bruno', 'Kasper', 'Milan', 'Álvaro', 'Felix',
]

const LAST = [
  'Silva', 'Rossi', 'Müller', 'Costa', 'Berg', 'Santos', 'Kovac', 'Moretti',
  'Fischer', 'Schmidt', 'Alvarez', 'Jensen', 'Navarro', 'Weber', 'Arrieta',
  'Romano', 'López', 'Petrov', 'Ranieri', 'Nielsen', 'Ferreira', 'Alonso',
  'Klopp', 'Conte', 'Lage', 'Schmeichel', 'Jovanovic', 'García', 'Ullrich',
]

const NATIONS_POOL = [
  { code: 'ESP', name: 'Spain' },
  { code: 'ITA', name: 'Italy' },
  { code: 'GER', name: 'Germany' },
  { code: 'FRA', name: 'France' },
  { code: 'POR', name: 'Portugal' },
  { code: 'NED', name: 'Netherlands' },
  { code: 'ENG', name: 'England' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'CRO', name: 'Croatia' },
  { code: 'TUR', name: 'Türkiye' },
  { code: 'SCO', name: 'Scotland' },
  { code: 'SRB', name: 'Serbia' },
  { code: 'DEN', name: 'Denmark' },
]

const CLUBS_POOL = [
  { name: 'Atalanta', code: 'ATA', clubId: null },
  { name: 'Sevilla', code: 'SEV', clubId: null },
  { name: 'Leverkusen', code: 'B04', clubId: null },
  { name: 'Monaco', code: 'ASM', clubId: null },
  { name: 'Ajax', code: 'AJA', clubId: null },
  { name: 'Sporting CP', code: 'SCP', clubId: null },
  { name: 'Benfica', code: 'SLB', clubId: null },
  { name: 'Wolfsburg', code: 'WOB', clubId: null },
  { name: 'Fiorentina', code: 'FIO', clubId: null },
  { name: 'Lyon', code: 'OL', clubId: null },
  { name: 'Brighton', code: 'BHA', clubId: null },
  { name: 'Girona', code: 'GIR', clubId: null },
  { name: 'Bologna', code: 'BOL', clubId: null },
  { name: 'Rennes', code: 'REN', clubId: null },
  { name: 'Galatasaray', code: 'GS', clubId: null },
  { name: 'Beşiktaş', code: 'BJK', clubId: null },
  { name: 'Celtic', code: 'CEL', clubId: null },
  { name: 'Porto', code: 'FCP', clubId: null },
  { name: 'Shakhtar', code: 'SHK', clubId: null },
  { name: 'Club Brugge', code: 'CLU', clubId: null },
]

const FORMATION_KEYS = ['4-2-3-1', '4-3-3', '3-4-2-1']

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

/** Map free-text formation to a filterable key */
export function normalizeFormation(formation) {
  if (!formation) return '4-2-3-1'
  const f = String(formation)
  if (f.includes('3-4-2-1') || f.includes('3-5-2') || f.includes('3-4-3')) return '3-4-2-1'
  if (f.includes('4-3-3')) return '4-3-3'
  if (f.includes('4-2-3-1')) return '4-2-3-1'
  if (f.includes('4-4-2')) return '4-2-3-1'
  return '4-2-3-1'
}

function totalMatches(career = []) {
  return career.reduce((sum, s) => sum + (s.matches || 0), 0)
}

function realToRow(m) {
  const employed = Boolean(m.currentClub && m.currentClub !== 'Free Agent')
  return {
    id: m.id,
    managerId: m.id,
    name: m.name,
    age: m.age,
    nation: { code: m.nation, name: m.nationName || m.nation },
    club: employed ? m.currentClub : null,
    clubCode: employed ? m.clubCode : null,
    clubId: m.clubId || null,
    employed,
    formation: normalizeFormation(m.formation),
    formationLabel: m.formation?.split('/')[0]?.trim() || normalizeFormation(m.formation),
    matches: totalMatches(m.career),
    winPct: m.winPct,
    ppg: m.ppg,
    real: true,
  }
}

function syntheticRow(i) {
  const h = hash(i + 91001)
  const first = pick(FIRST, h)
  const last = pick(LAST, h >> 3)
  const name = `${first} ${last}`
  const nation = pick(NATIONS_POOL, h >> 5)
  const formation = pick(FORMATION_KEYS, h >> 7)
  // ~28% free agents
  const employed = (h % 100) > 28
  const club = employed ? pick(CLUBS_POOL, h >> 9) : null
  const age = 36 + (h % 32) // 36–67
  const matches = 80 + (h % 620)
  // PPG 0.9 – 2.45, slightly correlated with age (veterans higher)
  const ppg = +Math.min(2.55, 0.95 + ((h % 150) / 100) + (age > 50 ? 0.12 : 0)).toFixed(2)
  const winPct = +Math.min(78, Math.max(28, ppg * 28 + ((h >> 11) % 12) - 4)).toFixed(1)

  return {
    id: `mgr-scout-${i}`,
    managerId: null,
    name,
    age,
    nation,
    club: club?.name ?? null,
    clubCode: club?.code ?? null,
    clubId: null,
    employed,
    formation,
    formationLabel: formation,
    matches,
    winPct,
    ppg,
    real: false,
  }
}

function buildDirectory() {
  const seen = new Set()
  const reals = []
  for (const m of Object.values(MANAGERS)) {
    // skip Brazil-NT alias of Ancelotti for directory density
    if (m.id === 'ancelotti-bra') continue
    if (seen.has(m.name)) continue
    seen.add(m.name)
    reals.push(realToRow(m))
  }

  const synthetics = []
  const target = 180
  for (let i = 0; i < target - reals.length; i++) {
    synthetics.push(syntheticRow(i))
  }

  // Real dossiers first (sorted by PPG desc), then synthetics by PPG
  reals.sort((a, b) => b.ppg - a.ppg)
  synthetics.sort((a, b) => b.ppg - a.ppg)
  return [...reals, ...synthetics]
}

export const MANAGER_DIRECTORY = buildDirectory()
