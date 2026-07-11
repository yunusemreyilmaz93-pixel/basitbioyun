import { useMemo, useState } from 'react'
import { Crest, fold } from './ui.jsx'
import { LEAGUE_CODE_TO_ID, LEAGUE_NAME_TO_ID } from './leagueData.js'
import {
  CLUB_DIRECTORY,
  CLUB_SCOUT_LEAGUES,
  GLOBAL_CLUB_INDEX,
  formatSquadValue,
} from './clubDirectory.js'
import { useI18n } from './i18n/I18nProvider.jsx'
import { DATA_SOURCE } from './dataLayer.js'

const PAGE_SIZE = 25

const SORT_IDS = [
  { id: 'value', key: 'hubs.sortSquadValue' },
  { id: 'youngest', key: 'hubs.sortYoungestSquad' },
  { id: 'foreigners', key: 'hubs.sortForeigners' },
  { id: 'stadium', key: 'hubs.sortStadium' },
]

const defaultFilters = () => ({
  query: '',
  leagues: [],
  valueMin: 0, // €M
  valueMax: 1000, // 1000M = €1B+
  ageMin: 20,
  ageMax: 32,
  foreignMin: 0,
  foreignMax: 100,
})

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-white/5 py-3 last:border-0">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</p>
      {children}
    </div>
  )
}

function Pagination({ page, totalPages, onPage }) {
  const { t } = useI18n()
  if (totalPages <= 1) return null
  const items = []
  items.push(1)
  const ws = Math.max(2, page - 1)
  const we = Math.min(totalPages - 1, page + 1)
  if (ws > 2) items.push('…')
  for (let i = ws; i <= we; i++) items.push(i)
  if (we < totalPages - 1) items.push('…')
  if (totalPages > 1) items.push(totalPages)
  const seen = new Set()
  const unique = items.filter((x) => {
    if (x === '…') return true
    if (seen.has(x)) return false
    seen.add(x)
    return true
  })

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 border-t border-white/5 px-3 py-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-md px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
      >
        {t('common.prev')}
      </button>
      {unique.map((item, i) =>
        item === '…' ? (
          <span key={`e-${i}`} className="px-1 text-xs text-zinc-600">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPage(item)}
            className={`min-w-[1.75rem] rounded-md px-2 py-1 text-xs font-medium tabular-nums transition-colors ${
              page === item
                ? 'bg-zinc-800 text-white ring-1 ring-white/10'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="rounded-md px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
      >
        {t('common.next')}
      </button>
    </div>
  )
}

function countActiveFilters(f) {
  let n = 0
  if (f.query.trim()) n++
  if (f.leagues.length) n++
  if (f.valueMin > 0 || f.valueMax < 1000) n++
  if (f.ageMin > 20 || f.ageMax < 32) n++
  if (f.foreignMin > 0 || f.foreignMax < 100) n++
  return n
}

/**
 * ClubsHub — high-density club scouting directory (PlayersHub architecture).
 */
export default function ClubsHub({ setView }) {
  const { t } = useI18n()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState('value')
  const [page, setPage] = useState(1)

  const patch = (partial) => {
    setFilters((f) => ({ ...f, ...partial }))
    setPage(1)
  }

  const toggleLeague = (league) => {
    setFilters((f) => {
      const on = f.leagues.includes(league)
      return {
        ...f,
        leagues: on ? f.leagues.filter((x) => x !== league) : [...f.leagues, league],
      }
    })
    setPage(1)
  }

  const reset = () => {
    setFilters(defaultFilters())
    setSort('value')
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = fold(filters.query.trim())
    let rows = CLUB_DIRECTORY.filter((r) => {
      if (q && !fold(r.name).includes(q) && !fold(r.league).includes(q)) return false
      if (filters.leagues.length && !filters.leagues.includes(r.league)) return false
      if (r.squadValue < filters.valueMin) return false
      if (filters.valueMax < 1000 && r.squadValue > filters.valueMax) return false
      if (r.avgAge < filters.ageMin || r.avgAge > filters.ageMax) return false
      if (r.foreignersPct < filters.foreignMin || r.foreignersPct > filters.foreignMax) return false
      return true
    })

    rows = [...rows].sort((a, b) => {
      if (sort === 'youngest') return a.avgAge - b.avgAge
      if (sort === 'foreigners') return b.foreignersPct - a.foreignersPct
      if (sort === 'stadium') return b.capacity - a.capacity
      return b.squadValue - a.squadValue
    })
    return rows
  }, [filters, sort])

  const isOpenSearch =
    DATA_SOURCE.mode !== 'supabase' &&
    !filters.query &&
    !filters.leagues.length &&
    filters.valueMin <= 0 &&
    filters.valueMax >= 1000 &&
    filters.ageMin <= 20 &&
    filters.ageMax >= 32 &&
    filters.foreignMin <= 0 &&
    filters.foreignMax >= 100

  const foundDisplay = isOpenSearch ? GLOBAL_CLUB_INDEX : filtered.length
  const totalPages = Math.max(1, Math.ceil(foundDisplay / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const activeCount = countActiveFilters(filters)

  const pageRows = useMemo(() => {
    if (!filtered.length) return []
    if (!isOpenSearch) {
      const start = (safePage - 1) * PAGE_SIZE
      return filtered.slice(start, start + PAGE_SIZE).map((r, i) => ({
        ...r,
        rank: start + i + 1,
      }))
    }
    const startRank = (safePage - 1) * PAGE_SIZE
    const reals = filtered.filter((x) => x.real)
    return Array.from({ length: PAGE_SIZE }, (_, i) => {
      const rank = startRank + i + 1
      if (rank > GLOBAL_CLUB_INDEX) return null
      if (safePage === 1 && i < reals.length) {
        return { ...reals[i], rank: i + 1 }
      }
      const base = filtered[rank % filtered.length]
      return {
        ...base,
        id: `club-page-${safePage}-${i}`,
        clubId: base.real && safePage === 1 ? base.clubId : base.clubId && safePage === 1 ? base.clubId : null,
        rank,
      }
    }).filter(Boolean)
  }, [filtered, safePage, isOpenSearch])

  const showingFrom = foundDisplay === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(safePage * PAGE_SIZE, foundDisplay)

  const openLeague = (row) => {
    const lid = LEAGUE_CODE_TO_ID[row.leagueCode] || LEAGUE_NAME_TO_ID[row.league]
    if (lid) setView('league', lid)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Top bar */}
      <div className="mb-5 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {t('hubs.clubsSub')}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t('hubs.clubsTitle')}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {t('hubs.clubsHint', { n: GLOBAL_CLUB_INDEX.toLocaleString('en-US') })}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-sky-400/30 hover:text-sky-300"
          >
            {t('common.reset')}
            {activeCount > 0 && (
              <span className="ml-1.5 rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-sky-300">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">
            {activeCount > 0 && (
              <span className="mr-2 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                {activeCount}{' '}
                {activeCount === 1 ? t('common.activeFilter') : t('common.activeFilters')}
              </span>
            )}
            {t('hubs.showingOf', {
              from: showingFrom,
              to: showingTo,
              total: foundDisplay.toLocaleString('en-US'),
            })}{' '}
            {t('hubs.clubsFound')}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              {t('common.sortBy')}
            </span>
            {SORT_IDS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSort(s.id)
                  setPage(1)
                }}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  sort === s.id
                    ? 'bg-zinc-800 text-white ring-1 ring-white/10'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                {t(s.key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Left filter console */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-3 sm:p-4 lg:sticky lg:top-20">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {t('hubs.filterConsole')}
            </p>

            <FilterSection title={t('hubs.searchClub')}>
              <input
                value={filters.query}
                onChange={(e) => patch({ query: e.target.value })}
                placeholder={t('hubs.searchClubPh')}
                className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/30 focus:outline-none"
              />
            </FilterSection>

            <FilterSection title={t('hubs.leagueComp')}>
              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                {CLUB_SCOUT_LEAGUES.map((league) => {
                  const on = filters.leagues.includes(league)
                  return (
                    <label
                      key={league}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-xs text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleLeague(league)}
                        className="size-3 rounded border-white/20 bg-zinc-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="truncate">{league}</span>
                    </label>
                  )
                })}
              </div>
            </FilterSection>

            <FilterSection title={t('hubs.squadValueM')}>
              <div className="flex items-center justify-between text-[11px] tabular-nums text-zinc-400">
                <span>€{filters.valueMin}M</span>
                <span>{filters.valueMax >= 1000 ? '€1B+' : `€${filters.valueMax}M`}</span>
              </div>
              <label className="mt-2 block text-[10px] text-zinc-600">{t('hubs.minTotal')}</label>
              <input
                type="range"
                min={0}
                max={1000}
                step={25}
                value={filters.valueMin}
                onChange={(e) =>
                  patch({ valueMin: Math.min(Number(e.target.value), filters.valueMax) })
                }
                className="w-full accent-emerald-400"
              />
              <label className="mt-1 block text-[10px] text-zinc-600">{t('hubs.maxTotal')}</label>
              <input
                type="range"
                min={0}
                max={1000}
                step={25}
                value={filters.valueMax}
                onChange={(e) =>
                  patch({ valueMax: Math.max(Number(e.target.value), filters.valueMin) })
                }
                className="w-full accent-emerald-400"
              />
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={2000}
                  value={filters.valueMin}
                  onChange={(e) => patch({ valueMin: Number(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  max={2000}
                  value={filters.valueMax}
                  onChange={(e) => patch({ valueMax: Number(e.target.value) || 1000 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
                />
              </div>
            </FilterSection>

            <FilterSection title={t('hubs.avgAgeBracket')}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={18}
                  max={35}
                  step={0.1}
                  value={filters.ageMin}
                  onChange={(e) => patch({ ageMin: Number(e.target.value) || 20 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
                />
                <span className="text-zinc-600">–</span>
                <input
                  type="number"
                  min={18}
                  max={35}
                  step={0.1}
                  value={filters.ageMax}
                  onChange={(e) => patch({ ageMax: Number(e.target.value) || 32 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
                />
              </div>
            </FilterSection>

            <FilterSection title={t('hubs.foreignerRatio')}>
              <div className="flex items-center justify-between text-[11px] tabular-nums text-zinc-400">
                <span>{filters.foreignMin}%</span>
                <span>{filters.foreignMax}%</span>
              </div>
              <label className="mt-2 block text-[10px] text-zinc-600">{t('hubs.minPct')}</label>
              <input
                type="range"
                min={0}
                max={100}
                value={filters.foreignMin}
                onChange={(e) =>
                  patch({ foreignMin: Math.min(Number(e.target.value), filters.foreignMax) })
                }
                className="w-full accent-sky-400"
              />
              <label className="mt-1 block text-[10px] text-zinc-600">{t('hubs.maxPct')}</label>
              <input
                type="range"
                min={0}
                max={100}
                value={filters.foreignMax}
                onChange={(e) =>
                  patch({ foreignMax: Math.max(Number(e.target.value), filters.foreignMin) })
                }
                className="w-full accent-sky-400"
              />
            </FilterSection>
          </div>
        </aside>

        {/* Right data table */}
        <section className="min-w-0 lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/40">
            <div className="w-full">
              <table className="data-table w-full table-fixed">
                <colgroup>
                  <col className="w-[6%]" />
                  <col className="w-[22%]" />
                  <col className="w-[16%]" />
                  <col className="w-[8%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-[9px] uppercase tracking-wide text-zinc-500">
                    <th className="px-1 py-2 text-left font-medium">{t('common.rank')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableClub')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableLeague')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableSquad')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableAge')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableFor')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableStadium')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableSmv')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-xs text-zinc-500">
                        {t('hubs.noClubs')}
                      </td>
                    </tr>
                  )}
                  {pageRows.map((r) => {
                    const canClub = Boolean(r.clubId)
                    return (
                      <tr
                        key={`${r.id}-${r.rank}`}
                        className="odd:bg-zinc-900/30 border-b border-white/5 transition-colors hover:bg-emerald-400/[0.04]"
                      >
                        <td className="px-1 py-1.5 font-mono text-[10px] font-semibold tabular-nums text-zinc-600">
                          {r.rank}
                        </td>
                        <td className="min-w-0 px-1 py-1.5">
                          <button
                            type="button"
                            disabled={!canClub}
                            onClick={() => canClub && setView('club', r.clubId)}
                            className={`group flex w-full min-w-0 items-center gap-1 text-left ${
                              canClub ? '' : 'cursor-default'
                            }`}
                          >
                            <Crest code={r.short} size="xs" />
                            <span
                              className={`truncate text-[11px] font-medium text-zinc-100 ${
                                canClub ? 'transition-colors group-hover:text-emerald-300' : ''
                              }`}
                            >
                              {r.name}
                            </span>
                          </button>
                        </td>
                        <td className="min-w-0 px-1 py-1.5">
                          <button
                            type="button"
                            onClick={() => openLeague(r)}
                            className="block w-full truncate text-left text-zinc-400 transition-colors hover:text-sky-300"
                          >
                            {r.league}
                          </button>
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-300">{r.squadSize}</td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">
                          {r.avgAge.toFixed(1)}
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">
                          {r.foreignersPct}%
                        </td>
                        <td className="min-w-0 px-1 py-1.5">
                          <span className="block truncate text-zinc-300">{r.stadium}</span>
                          <span className="font-mono text-[9px] tabular-nums text-zinc-600">
                            {r.capacity.toLocaleString('en-US')}
                          </span>
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono text-[12px] font-bold tabular-nums text-emerald-400">
                          {formatSquadValue(r.squadValue)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={safePage}
              totalPages={isOpenSearch ? Math.ceil(GLOBAL_CLUB_INDEX / PAGE_SIZE) : Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
              onPage={setPage}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
