/**
 * Import Transfermarkt CSVs → staging.* tables in Supabase
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_URL="https://xxxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ...."
 *   npm run import:tm
 *
 * Optional:
 *   $env:TM_DATA_DIR="C:\Users\YUNUS EMRE\Desktop\football_datasets\archive"
 *   npm run import:tm -- --only competitions,clubs,players
 *   npm run import:tm -- --only valuations
 *   npm run import:tm -- --only appearances   (huge — run later)
 */
import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(`
Eksik env.
PowerShell:

  $env:SUPABASE_URL="https://SENIN-PROJE.supabase.co"
  $env:SUPABASE_SERVICE_ROLE_KEY="eyJ....service_role...."
  npm run import:tm
`)
  process.exit(1)
}

const DATA_DIR =
  process.env.TM_DATA_DIR ||
  join(process.env.USERPROFILE || process.env.HOME || '', 'Desktop', 'football_datasets', 'archive')

const onlyArg = process.argv.find((a) => a.startsWith('--only'))
const onlyList = (() => {
  const i = process.argv.indexOf('--only')
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1].split(',').map((s) => s.trim())
  if (onlyArg?.includes('=')) return onlyArg.split('=')[1].split(',').map((s) => s.trim())
  return null
})()

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BATCH = Number(process.env.IMPORT_BATCH || 500)

/** @type {{ id: string, file: string, table: string, pk?: string, skipId?: boolean, wave: number }[]} */
const JOBS = [
  { id: 'competitions', file: 'competitions.csv', table: 'competitions', pk: 'competition_id', wave: 1 },
  { id: 'countries', file: 'countries.csv', table: 'countries', pk: 'country_id', wave: 1 },
  { id: 'national_teams', file: 'national_teams.csv', table: 'national_teams', pk: 'national_team_id', wave: 1 },
  { id: 'clubs', file: 'clubs.csv', table: 'clubs', pk: 'club_id', wave: 1 },
  { id: 'players', file: 'players.csv', table: 'players', pk: 'player_id', wave: 1 },
  { id: 'transfers', file: 'transfers.csv', table: 'transfers', skipId: true, wave: 2 },
  { id: 'valuations', file: 'player_valuations.csv', table: 'player_valuations', skipId: true, wave: 2 },
  { id: 'games', file: 'games.csv', table: 'games', pk: 'game_id', wave: 2 },
  // Wave 3 — very large
  { id: 'appearances', file: 'appearances.csv', table: 'appearances', pk: 'appearance_id', wave: 3 },
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
  if (table === 'players') {
    row = numFields(row, [
      'last_season',
      'height_in_cm',
      'international_caps',
      'international_goals',
      'market_value_in_eur',
      'highest_market_value_in_eur',
    ])
  } else if (table === 'clubs') {
    row = numFields(row, [
      'total_market_value',
      'squad_size',
      'average_age',
      'foreigners_number',
      'foreigners_percentage',
      'national_team_players',
      'stadium_seats',
      'last_season',
    ])
  } else if (table === 'competitions') {
    row = numFields(row, ['total_clubs'])
  } else if (table === 'countries') {
    row = numFields(row, ['total_clubs', 'total_players', 'average_age'])
  } else if (table === 'national_teams') {
    row = numFields(row, [
      'squad_size',
      'average_age',
      'foreigners_number',
      'foreigners_percentage',
      'total_market_value',
      'fifa_ranking',
      'last_season',
    ])
  } else if (table === 'transfers') {
    row = numFields(row, ['transfer_fee', 'market_value_in_eur'])
  } else if (table === 'player_valuations') {
    row = numFields(row, ['market_value_in_eur'])
  } else if (table === 'games') {
    row = numFields(row, [
      'season',
      'home_club_goals',
      'away_club_goals',
      'home_club_position',
      'away_club_position',
      'attendance',
    ])
  } else if (table === 'appearances') {
    row = numFields(row, [
      'yellow_cards',
      'red_cards',
      'goals',
      'assists',
      'minutes_played',
    ])
  }
  return row
}

async function upsertBatch(table, rows, pk) {
  if (!rows.length) return
  const opts = pk ? { onConflict: pk } : undefined
  // tables without natural pk: plain insert
  if (!pk) {
    const { error } = await supabase.schema('staging').from(table).insert(rows)
    if (error) throw error
    return
  }
  const { error } = await supabase.schema('staging').from(table).upsert(rows, opts)
  if (error) throw error
}

async function importCsv(job) {
  const path = join(DATA_DIR, job.file)
  if (!existsSync(path)) {
    console.warn(`  SKIP missing file: ${path}`)
    return { ok: false, count: 0 }
  }

  console.log(`\n→ ${job.id}  (${job.file})`)
  console.log(`  path: ${path}`)

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
    // drop auto id columns if present in CSV (none expected)
    if (job.skipId && 'id' in row) delete row.id
    batch.push(row)

    if (batch.length >= BATCH) {
      try {
        await upsertBatch(job.table, batch, job.pk)
        total += batch.length
        process.stdout.write(`\r  rows: ${total.toLocaleString('en-US')}`)
      } catch (e) {
        errors++
        console.error(`\n  batch error at ~${total}:`, e.message || e)
        // try row-by-row for this batch to salvage
        for (const r of batch) {
          try {
            await upsertBatch(job.table, [r], job.pk)
            total++
          } catch (e2) {
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

  console.log(`\n  done: ${total.toLocaleString('en-US')} rows` + (errors ? `  (errors: ${errors})` : ''))
  return { ok: true, count: total, errors }
}

// Default: wave 1 only (safe first run). Use --all for wave 1+2, or --only appearances
const wantAll = process.argv.includes('--all')
const wantWave3 = process.argv.includes('--wave3') || onlyList?.includes('appearances')

let jobs = JOBS.filter((j) => {
  if (onlyList) return onlyList.includes(j.id)
  if (wantWave3) return j.wave <= 3
  if (wantAll) return j.wave <= 2
  return j.wave === 1
})

console.log('Supabase URL:', url)
console.log('Data dir:', DATA_DIR)
console.log('Jobs:', jobs.map((j) => j.id).join(', '))
console.log('Batch size:', BATCH)

if (!existsSync(DATA_DIR)) {
  console.error(`\nDataset klasörü bulunamadı: ${DATA_DIR}`)
  console.error('TM_DATA_DIR env ile doğru yolu ver.')
  process.exit(1)
}

const started = Date.now()
for (const job of jobs) {
  await importCsv(job)
}
console.log(`\nAll done in ${((Date.now() - started) / 1000).toFixed(1)}s`)
