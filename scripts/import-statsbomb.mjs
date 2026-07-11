/**
 * Import StatsBomb open data (archive 2)
 *
 * Default: competitions.json + all matches/*.json  (reasonable size)
 * Optional: --events   loads every events/{match_id}.json (VERY large / slow)
 *
 *   npm run import:sb
 *   npm run import:sb -- --events
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const ROOT =
  process.env.SB_DATA_DIR ||
  join(process.env.USERPROFILE || '', 'Desktop', 'football_datasets', 'archive (2)', 'data')

const wantEvents = process.argv.includes('--events')
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const BATCH = 200

async function upsert(table, rows, onConflict) {
  if (!rows.length) return
  const { error } = await supabase.schema('staging').from(table).upsert(rows, { onConflict })
  if (error) throw error
}

async function insert(table, rows) {
  if (!rows.length) return
  const { error } = await supabase.schema('staging').from(table).insert(rows)
  if (error) throw error
}

// ── competitions ────────────────────────────────────────────
const compPath = join(ROOT, 'competitions.json')
if (!existsSync(compPath)) {
  console.error('Missing', compPath)
  process.exit(1)
}
const competitions = JSON.parse(readFileSync(compPath, 'utf8'))
const compRows = competitions.map((c) => ({
  competition_id: c.competition_id,
  season_id: c.season_id,
  country_name: c.country_name ?? null,
  competition_name: c.competition_name ?? null,
  competition_gender: c.competition_gender ?? null,
  competition_youth: c.competition_youth ?? null,
  competition_international: c.competition_international ?? null,
  season_name: c.season_name ?? null,
  match_updated: c.match_updated ?? null,
  match_updated_360: c.match_updated_360 ?? null,
  match_available_360: c.match_available_360 ?? null,
  match_available: c.match_available ?? null,
}))
await upsert('sb_competitions', compRows, 'competition_id,season_id')
console.log('sb_competitions:', compRows.length)

// ── matches (nested folders: matches/{comp_id}/{season_id}.json) ─
const matchesRoot = join(ROOT, 'matches')
let matchTotal = 0
if (existsSync(matchesRoot)) {
  const comps = readdirSync(matchesRoot, { withFileTypes: true }).filter((d) => d.isDirectory())
  for (const c of comps) {
    const files = readdirSync(join(matchesRoot, c.name)).filter((f) => f.endsWith('.json'))
    for (const f of files) {
      const arr = JSON.parse(readFileSync(join(matchesRoot, c.name, f), 'utf8'))
      const rows = (Array.isArray(arr) ? arr : [arr]).map((m) => ({
        match_id: m.match_id,
        match_date: m.match_date ?? null,
        kick_off: m.kick_off ?? null,
        competition: m.competition ?? null,
        season: m.season ?? null,
        home_team: m.home_team ?? null,
        away_team: m.away_team ?? null,
        home_score: m.home_score ?? null,
        away_score: m.away_score ?? null,
        match_status: m.match_status ?? null,
        match_status_360: m.match_status_360 ?? null,
        last_updated: m.last_updated ?? null,
        last_updated_360: m.last_updated_360 ?? null,
        metadata: m.metadata ?? null,
        match_week: m.match_week ?? null,
        competition_stage: m.competition_stage ?? null,
        stadium: m.stadium ?? null,
        referee: m.referee ?? null,
      }))
      // batch
      for (let i = 0; i < rows.length; i += BATCH) {
        await upsert('sb_matches', rows.slice(i, i + BATCH), 'match_id')
      }
      matchTotal += rows.length
      process.stdout.write(`\r  matches: ${matchTotal}`)
    }
  }
  console.log(`\nsb_matches: ${matchTotal}`)
}

// ── events (optional) ───────────────────────────────────────
if (wantEvents) {
  const eventsRoot = join(ROOT, 'events')
  if (!existsSync(eventsRoot)) {
    console.warn('No events folder')
  } else {
    const files = readdirSync(eventsRoot).filter((f) => f.endsWith('.json'))
    console.log(`\nImporting ${files.length} event files (this can take a long time)...`)
    let evTotal = 0
    let fileI = 0
    for (const f of files) {
      fileI++
      const matchId = Number(f.replace('.json', ''))
      let arr
      try {
        arr = JSON.parse(readFileSync(join(eventsRoot, f), 'utf8'))
      } catch {
        continue
      }
      const rows = (Array.isArray(arr) ? arr : []).map((e, idx) => ({
        id: e.id || `${matchId}-${idx}`,
        match_id: matchId,
        index: e.index ?? idx,
        period: e.period ?? null,
        timestamp: e.timestamp ?? null,
        minute: e.minute ?? null,
        second: e.second ?? null,
        type: e.type ?? null,
        possession: e.possession ?? null,
        possession_team: e.possession_team ?? null,
        play_pattern: e.play_pattern ?? null,
        team: e.team ?? null,
        player: e.player ?? null,
        position: e.position ?? null,
        location: e.location ?? null,
        duration: e.duration ?? null,
        under_pressure: e.under_pressure ?? null,
        raw: e,
      }))
      for (let i = 0; i < rows.length; i += BATCH) {
        try {
          await upsert('sb_events', rows.slice(i, i + BATCH), 'id')
        } catch (err) {
          // fallback insert without conflict
          try {
            await insert('sb_events', rows.slice(i, i + BATCH))
          } catch (e2) {
            console.error(`\n  events error ${f}:`, e2.message || e2)
          }
        }
      }
      evTotal += rows.length
      if (fileI % 20 === 0) {
        process.stdout.write(`\r  event files ${fileI}/${files.length}  rows ~${evTotal.toLocaleString('en-US')}`)
      }
    }
    console.log(`\nsb_events: ~${evTotal.toLocaleString('en-US')}`)
  }
} else {
  console.log('\nSkipped events (add --events to load). Lineups/360 also skipped by default.')
}

console.log('\nStatsBomb import done.')
