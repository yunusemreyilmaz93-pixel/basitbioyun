/**
 * Import archive (1) international results → staging.intl_*
 *
 *   npm run import:intl
 */
import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const DATA_DIR =
  process.env.INTL_DATA_DIR ||
  join(process.env.USERPROFILE || '', 'Desktop', 'football_datasets', 'archive (1)')

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const BATCH = 500

const JOBS = [
  { file: 'results.csv', table: 'intl_results' },
  { file: 'goalscorers.csv', table: 'intl_goalscorers' },
  { file: 'shootouts.csv', table: 'intl_shootouts' },
  { file: 'former_names.csv', table: 'intl_former_names' },
]

function emptyToNull(row) {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    out[k] = v === '' || v == null ? null : v
  }
  return out
}

function nums(row, fields) {
  for (const f of fields) {
    if (row[f] == null || row[f] === '') row[f] = null
    else {
      const n = Number(row[f])
      row[f] = Number.isFinite(n) ? n : null
    }
  }
  return row
}

async function importFile(job) {
  const path = join(DATA_DIR, job.file)
  if (!existsSync(path)) {
    console.warn('SKIP', path)
    return
  }
  console.log(`\n→ ${job.table} (${job.file})`)
  let batch = []
  let total = 0
  const parser = createReadStream(path).pipe(
    parse({ columns: true, skip_empty_lines: true, bom: true, trim: true, relax_column_count: true }),
  )
  for await (const raw of parser) {
    let row = emptyToNull(raw)
    if (job.table === 'intl_results') row = nums(row, ['home_score', 'away_score'])
    if (job.table === 'intl_goalscorers') row = nums(row, ['minute'])
    batch.push(row)
    if (batch.length >= BATCH) {
      const { error } = await supabase.schema('staging').from(job.table).insert(batch)
      if (error) throw error
      total += batch.length
      process.stdout.write(`\r  rows: ${total.toLocaleString('en-US')}`)
      batch = []
    }
  }
  if (batch.length) {
    const { error } = await supabase.schema('staging').from(job.table).insert(batch)
    if (error) throw error
    total += batch.length
  }
  console.log(`\n  done: ${total.toLocaleString('en-US')}`)
}

console.log('Data dir:', DATA_DIR)
for (const j of JOBS) await importFile(j)
console.log('\nInternational history import done.')
