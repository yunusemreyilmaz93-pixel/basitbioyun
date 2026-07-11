/**
 * Import Transfermarkt CSVs → staging.* in Supabase
 *
 * PowerShell:
 *   $env:SUPABASE_URL="https://xxxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ...."   # SECRET — never paste in chat
 *   npm run import:tm              # wave 1
 *   npm run import:tm -- --all     # wave 1+2
 *   npm run import:tm -- --rest    # wave 3 big files (appearances, events, lineups, club_games)
 *   npm run import:tm -- --everything
 */
import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (secret key)')
  process.exit(1)
}

const DATA_DIR =
  process.env.TM_DATA_DIR ||
  join(process.env.USERPROFILE || process.env.HOME || '', 'Desktop', 'football_datasets', 'archive')

const onlyList = (() => {
  const i = process.argv.indexOf('--only')
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1].split(',').map((s) => s.trim())
  return null
})()

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BATCH = Number(process.env.IMPORT_BATCH || 500)

const JOBS = [
  { id: 'competitions', file: 'competitions.csv', table: 'competitions', pk: 'competition_id', wave: 1 },
  { id: 'countries', file: 'countries.csv', table: 'countries', pk: 'country_id', wave: 1 },
  { id: 'national_teams', file: 'national_teams.csv', table: 'national_teams', pk: 'national_team_id', wave: 1 },
  { id: 'clubs', file: 'clubs.csv', table: 'clubs', pk: 'club_id', wave: 1 },
  { id: 'players', file: 'players.csv', table: 'players', pk: 'player_id', wave: 1 },
  { id: 'transfers', file: 'transfers.csv', table: 'transfers', skipId: true, wave: 2 },
  { id: 'valuations', file: 'player_valuations.csv', table: 'player_valuations', skipId: true, wave: 2 },
  { id: 'games', file: 'games.csv', table: 'games', pk: 'game_id', wave: 2 },
  // Wave 3 — large
  { id: 'club_games', file: 'club_games.csv', table: 'club_games', skipId: true, wave: 3 },
  { id: 'appearances', file: 'appearances.csv', table: 'appearances', pk: 'appearance_id', wave: 3 },
  { id: 'game_events', file: 'game_events.csv', table: 'game_events', pk: 'game_event_id', wave: 3 },
  { id: 'game_lineups', file: 'game_lineups.csv', table: 'game_lineups', pk: 'game_lineups_id', wave: 3 },
]

function emptyToNull(row) {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    if (v === undefined || v === null || v === '') out[k] = null
    else out[k] = v
  }
  return out
}

function numFields(row, fields) {
  for (const f of fields) {
    if (row[f] == null || row[f] === '') {
      row[f] = null
      continue
    }
    const n = Number(String(row[f]).replace(/,/g, ''))
    row[f] = Number.isFinite(n) ? n : null
  }
  return row
}

function cleanRow(table, raw) {
  let row = emptyToNull(raw)
  const map = {
    players: [
      'last_season', 'height_in_cm', 'international_caps', 'international_goals',
      'market_value_in_eur', 'highest_market_value_in_eur',
    ],
    clubs: [
      'total_market_value', 'squad_size', 'average_age', 'foreigners_number',
      'foreigners_percentage', 'national_team_players', 'stadium_seats', 'last_season',
    ],
    competitions: ['total_clubs'],
    countries: ['total_clubs', 'total_players', 'average_age'],
    national_teams: [
      'squad_size', 'average_age', 'foreigners_number', 'foreigners_percentage',
      'total_market_value', 'fifa_ranking', 'last_season',
    ],
    transfers: ['transfer_fee', 'market_value_in_eur'],
    player_valuations: ['market_value_in_eur'],
    games: [
      'season', 'home_club_goals', 'away_club_goals', 'home_club_position',
      'away_club_position', 'attendance',
    ],
    appearances: ['yellow_cards', 'red_cards', 'goals', 'assists', 'minutes_played'],
    club_games: [
      'own_goals', 'own_position', 'opponent_goals', 'opponent_position', 'is_win',
    ],
    game_events: ['minute'],
    game_lineups: ['number', 'team_captain'],
  }
  if (map[table]) row = numFields(row, map[table])
  return row
}

async function upsertBatch(table, rows, pk) {
  if (!rows.length) return
  const q = supabase.schema('staging').from(table)
  if (!pk) {
    const { error } = await q.insert(rows)
    if (error) throw error
    return
  }
  const { error } = await q.upsert(rows, { onConflict: pk })
  if (error) throw error
}

async function importCsv(job) {
  const path = join(DATA_DIR, job.file)
  if (!existsSync(path)) {
    console.warn(`  SKIP missing: ${path}`)
    return { count: 0 }
  }

  console.log(`\n→ ${job.id}  (${job.file})`)
  let batch = []
  let total = 0
  let errors = 0

  const parser = createReadStream(path).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
      trim: true,
    }),
  )

  for await (const raw of parser) {
    const row = cleanRow(job.table, raw)
    if (job.skipId && 'id' in row) delete row.id
    batch.push(row)

    if (batch.length >= BATCH) {
      try {
        await upsertBatch(job.table, batch, job.pk)
        total += batch.length
        process.stdout.write(`\r  rows: ${total.toLocaleString('en-US')}`)
      } catch (e) {
        console.error(`\n  batch error @${total}:`, e.message || e)
        for (const r of batch) {
          try {
            await upsertBatch(job.table, [r], job.pk)
            total++
          } catch {
            errors++
          }
        }
      }
      batch = []
    }
  }

  if (batch.length) {
    try {
      await upsertBatch(job.table, batch, job.pk)
      total += batch.length
    } catch (e) {
      console.error(`\n  final batch error:`, e.message || e)
      for (const r of batch) {
        try {
          await upsertBatch(job.table, [r], job.pk)
          total++
        } catch {
          errors++
        }
      }
    }
  }

  console.log(`\n  done: ${total.toLocaleString('en-US')}` + (errors ? `  errors:${errors}` : ''))
  return { count: total, errors }
}

const everything = process.argv.includes('--everything')
const rest = process.argv.includes('--rest') || process.argv.includes('--wave3')
const all = process.argv.includes('--all')

let jobs = JOBS.filter((j) => {
  if (onlyList) return onlyList.includes(j.id)
  if (everything) return true
  if (rest) return j.wave === 3
  if (all) return j.wave <= 2
  return j.wave === 1
})

console.log('Supabase URL:', url)
console.log('Data dir:', DATA_DIR)
console.log('Jobs:', jobs.map((j) => j.id).join(', '))
console.log('Batch:', BATCH)

if (!existsSync(DATA_DIR)) {
  console.error('Dataset folder missing:', DATA_DIR)
  process.exit(1)
}

const t0 = Date.now()
for (const job of jobs) await importCsv(job)
console.log(`\nAll done in ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`)
