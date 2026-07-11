/* ------------------------------------------------------------------ */
/*  Nations scouting directory — real NATIONS + synthetic density      */
/* ------------------------------------------------------------------ */

import { NATIONS } from './dataLayer.js'

/** Marketing-size global national-team index */
export const GLOBAL_NATION_INDEX = 211

export const CONFEDERATIONS = [
  { id: 'UEFA', label: 'UEFA' },
  { id: 'CONMEBOL', label: 'CONMEBOL' },
  { id: 'CAF', label: 'CAF' },
  { id: 'AFC', label: 'AFC' },
  { id: 'CONCACAF', label: 'CONCACAF' },
  { id: 'OFC', label: 'OFC' },
]

export const FIFA_RANK_PRESETS = [
  { id: 'all', label: 'All Teams', maxRank: 211 },
  { id: 'top10', label: 'Top 10', maxRank: 10 },
  { id: 'top30', label: 'Top 30', maxRank: 30 },
  { id: 'top50', label: 'Top 50', maxRank: 50 },
  { id: 'top100', label: 'Top 100', maxRank: 100 },
]

const NAME_POOL = [
  'Portugal', 'Netherlands', 'Belgium', 'Croatia', 'Denmark', 'Switzerland',
  'Austria', 'Poland', 'Serbia', 'Sweden', 'Norway', 'Scotland', 'Wales',
  'Ukraine', 'Czechia', 'Hungary', 'Romania', 'Greece', 'Ireland', 'Slovakia',
  'Argentina', 'Uruguay', 'Colombia', 'Chile', 'Ecuador', 'Paraguay', 'Peru',
  'Morocco', 'Senegal', 'Nigeria', 'Egypt', 'Cameroon', 'Ghana', 'Algeria',
  'Ivory Coast', 'Tunisia', 'Mali', 'South Africa', 'Japan', 'South Korea',
  'Australia', 'Iran', 'Saudi Arabia', 'Qatar', 'Iraq', 'Uzbekistan',
  'Mexico', 'USA', 'Canada', 'Costa Rica', 'Panama', 'Jamaica', 'Honduras',
  'New Zealand', 'Fiji', 'Tahiti',
]

const CODE_POOL = [
  'POR', 'NED', 'BEL', 'CRO', 'DEN', 'SUI', 'AUT', 'POL', 'SRB', 'SWE',
  'NOR', 'SCO', 'WAL', 'UKR', 'CZE', 'HUN', 'ROU', 'GRE', 'IRL', 'SVK',
  'ARG', 'URU', 'COL', 'CHI', 'ECU', 'PAR', 'PER', 'MAR', 'SEN', 'NGA',
  'EGY', 'CMR', 'GHA', 'ALG', 'CIV', 'TUN', 'MLI', 'RSA', 'JPN', 'KOR',
  'AUS', 'IRN', 'KSA', 'QAT', 'IRQ', 'UZB', 'MEX', 'USA', 'CAN', 'CRC',
  'PAN', 'JAM', 'HON', 'NZL', 'FIJ', 'TAH',
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

function avg(nums) {
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function realToRow(n) {
  const players = n.squad ? Object.values(n.squad).flat() : []
  const ages = players.map((p) => p.age).filter((a) => typeof a === 'number')
  const foreign = players.filter((p) => p.foreign).length
  const squadSize = players.length || (n.squadValue > 0 ? 23 : 0)
  const avgAge = ages.length
    ? +avg(ages).toFixed(1)
    : n.squadValue > 0
      ? 26.5
      : 0
  const foreignPct =
    squadSize > 0
      ? Math.round((foreign / Math.max(players.length, 1)) * 100) || (players.length ? Math.round((foreign / players.length) * 100) : 35)
      : 0

  // Lightweight shells (england/italy): estimate legioner ratio
  const foreignBasedPct =
    players.length > 0
      ? Math.round((foreign / players.length) * 100)
      : n.id === 'england'
        ? 22
        : n.id === 'italy'
          ? 18
          : foreignPct

  const size =
    players.length > 0
      ? players.length
      : n.squadValue > 0
        ? 23
        : 0

  return {
    id: n.id,
    nationId: n.id,
    name: n.name,
    code: n.code,
    confederation: n.confederation || 'UEFA',
    fifaRank: n.fifaRank != null ? n.fifaRank : 999,
    squadSize: size,
    avgAge: ages.length ? +avg(ages).toFixed(1) : n.squadValue > 0 ? +(25.5 + (n.fifaRank || 20) * 0.04).toFixed(1) : 0,
    foreignPct: foreignBasedPct,
    /** Total national squad value in €bn */
    squadValue: n.squadValue || 0,
    real: true,
  }
}

function syntheticRow(i) {
  const h = hash(i + 33001)
  const name = pick(NAME_POOL, h)
  const code = pick(CODE_POOL, h >> 3)
  const confIds = CONFEDERATIONS.map((c) => c.id)
  const confederation = pick(confIds, h >> 5)
  // FIFA rank 8–180 mostly
  const fifaRank = 8 + (h % 172)
  // Value correlates loosely with rank
  const base = Math.max(0.04, 1.6 - fifaRank * 0.008)
  const squadValue = +Math.max(0.03, base + ((h % 40) - 20) / 100).toFixed(2)
  const squadSize = 18 + (h % 10)
  const avgAge = +(24.2 + ((h % 60) / 10)).toFixed(1)
  const foreignPct = confederation === 'UEFA' || confederation === 'CONMEBOL'
    ? 25 + (h % 55)
    : 15 + (h % 45)

  return {
    id: `nation-scout-${i}`,
    nationId: null,
    name: `${name}`,
    code,
    confederation,
    fifaRank,
    squadSize,
    avgAge,
    foreignPct: Math.min(95, foreignPct),
    squadValue,
    real: false,
  }
}

function buildDirectory() {
  const reals = Object.values(NATIONS)
    .filter((n) => n.id !== 'uefa' && (n.squadValue > 0 || n.fifaRank != null))
    .map(realToRow)

  // Avoid name collisions with synthetics for known reals
  const realNames = new Set(reals.map((r) => r.name.toLowerCase()))
  const synthetics = []
  let i = 0
  while (synthetics.length < 90) {
    const row = syntheticRow(i++)
    if (realNames.has(row.name.toLowerCase())) continue
    // uniquify codes slightly
    row.name = row.name
    row.id = `nation-scout-${synthetics.length}`
    synthetics.push(row)
  }

  reals.sort((a, b) => a.fifaRank - b.fifaRank)
  synthetics.sort((a, b) => a.fifaRank - b.fifaRank)
  return [...reals, ...synthetics]
}

export const NATION_DIRECTORY = buildDirectory()

export function formatSquadValueBn(v) {
  if (v >= 1) return `€${v.toFixed(2)}bn`
  if (v >= 0.01) return `€${(v * 1000).toFixed(0)}M`
  return `€${(v * 1000).toFixed(1)}M`
}
