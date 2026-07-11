/**
 * Export current mock datasets → supabase/seed/*.json
 * Run: node scripts/export-seed.mjs
 *
 * Then load into Supabase via Table Editor import, or use scripts/seed-supabase.mjs
 * with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'supabase', 'seed')
mkdirSync(outDir, { recursive: true })

async function load(rel) {
  const mod = await import(pathToFileURL(join(root, rel)).href)
  return mod
}

function asArray(obj) {
  if (!obj) return []
  if (Array.isArray(obj)) return obj
  return Object.values(obj)
}

function write(name, data) {
  const path = join(outDir, name)
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
  console.log(`wrote ${name} (${Array.isArray(data) ? data.length : Object.keys(data).length} rows)`)
}

const data = await load('src/data.js')
const clubs = await load('src/clubData.js')
const leagues = await load('src/leagueData.js')
const nations = await load('src/nationData.js')
const managers = await load('src/managerData.js')
const matches = await load('src/matchData.js')
const details = await load('src/playerDetails.js')
const market = await load('src/marketDirectory.js')
const home = await load('src/homeData.js')

write('players.json', asArray(data.PLAYERS))
write('player_details.json', details.DETAILS || details.default || {})
write('clubs.json', asArray(clubs.CLUBS))
write('leagues.json', asArray(leagues.LEAGUES_DETAIL))
write('nations.json', asArray(nations.NATIONS))
write('managers.json', asArray(managers.MANAGERS))
write('matches.json', asArray(matches.MATCHES_DETAIL))

// Market / home feeds (flexible shapes)
const marketPayload = {
  transfers: market.TRANSFERS || market.LEDGER || market.CONFIRMED || [],
  rumors: market.RUMORS || [],
  movers: market.MOVERS || market.VALUE_MOVERS || [],
  rawKeys: Object.keys(market),
}
write('market.json', marketPayload)

const homePayload = {
  featured: home.FEATURED || null,
  news: home.NEWS || [],
  matches: home.MATCHES || [],
  latestTransfers: home.LATEST_TRANSFERS || [],
  rumors: home.RUMORS || [],
  smartRisers: home.SMART_RISERS || [],
  mostSearched: home.MOST_SEARCHED || [],
  expiring: home.EXPIRING || [],
  leagues: home.LEAGUES || [],
}
write('home.json', homePayload)

console.log('\nSeed JSON ready in supabase/seed/')
console.log('Next: create a Supabase project, run supabase/migrations/001_init.sql, then npm run seed:supabase')
