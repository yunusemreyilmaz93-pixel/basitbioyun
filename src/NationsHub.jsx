import { useMemo, useState } from 'react'
import { fold } from './ui.jsx'
import {
  NATION_DIRECTORY,
  GLOBAL_NATION_INDEX,
  CONFEDERATIONS,
  FIFA_RANK_PRESETS,
  formatSquadValueBn,
} from './nationDirectory.js'
import { useI18n } from './i18n/I18nProvider.jsx'

const PAGE_SIZE = 25

const SORT_IDS = [
  { id: 'value', key: 'hubs.sortNationValue' },
  { id: 'fifa', key: 'hubs.sortFifa' },
  { id: 'foreign', key: 'hubs.sortLegion' },
  { id: 'youngest', key: 'hubs.sortYoungestNation' },
]

const FIFA_PRESET_KEYS = {
  all: 'hubs.allTeams',
  top10: 'hubs.top10',
  top30: 'hubs.top30',
  top50: 'hubs.top50',
  top100: 'hubs.top100',
}

const defaultFilters = () => ({
  query: '',
  confederations: [], // empty = all
  maxFifaRank: 211,
  valueMin: 0, // €bn
  valueMax: 2.5, // €bn
  ageMin: 22,
  ageMax: 32,
})

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-white/5 py-3 last:border-0">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</p>
      {children}
    </div>
  )
}

function ToggleChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
        active
          ? 'bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/30'
          : 'bg-white/[0.03] text-zinc-400 ring-1 ring-white/5 hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  )
}

function FlagMark({ code }) {
  let h = 0
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 360
  return (
    <span
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md font-display text-[8px] font-bold tracking-wide text-white/90 ring-1 ring-white/15"
      style={{
        background: `linear-gradient(145deg, hsl(${h} 48% 36%), hsl(${(h + 40) % 360} 46% 16%))`,
      }}
      aria-hidden="true"
    >
      {code}
    </span>
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
  if (f.confederations.length) n++
  if (f.maxFifaRank < 211) n++
  if (f.valueMin > 0 || f.valueMax < 2.5) n++
  if (f.ageMin > 22 || f.ageMax < 32) n++
  return n
}

/**
 * NationsHub — high-density national teams directory (PlayersHub architecture).
 */
export default function NationsHub({ setView }) {
  const { t } = useI18n()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState('fifa')
  const [page, setPage] = useState(1)

  const patch = (partial) => {
    setFilters((f) => ({ ...f, ...partial }))
    setPage(1)
  }

  const toggleConf = (id) => {
    setFilters((f) => {
      const on = f.confederations.includes(id)
      return {
        ...f,
        confederations: on
          ? f.confederations.filter((x) => x !== id)
          : [...f.confederations, id],
      }
    })
    setPage(1)
  }

  const reset = () => {
    setFilters(defaultFilters())
    setSort('fifa')
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = fold(filters.query.trim())
    let rows = NATION_DIRECTORY.filter((r) => {
      if (q && !fold(r.name).includes(q) && !fold(r.code).includes(q)) return false
      if (filters.confederations.length && !filters.confederations.includes(r.confederation)) {
        return false
      }
      if (r.fifaRank > filters.maxFifaRank) return false
      if (r.squadValue < filters.valueMin) return false
      if (filters.valueMax < 2.5 && r.squadValue > filters.valueMax) return false
      if (r.avgAge < filters.ageMin || r.avgAge > filters.ageMax) return false
      return true
    })

    rows = [...rows].sort((a, b) => {
      if (sort === 'value') return b.squadValue - a.squadValue
      if (sort === 'foreign') return b.foreignPct - a.foreignPct
      if (sort === 'youngest') return a.avgAge - b.avgAge
      // Best FIFA ranking = lowest rank number
      return a.fifaRank - b.fifaRank
    })
    return rows
  }, [filters, sort])

  const isOpenSearch =
    !filters.query &&
    !filters.confederations.length &&
    filters.maxFifaRank >= 211 &&
    filters.valueMin <= 0 &&
    filters.valueMax >= 2.5 &&
    filters.ageMin <= 22 &&
    filters.ageMax >= 32

  const foundDisplay = isOpenSearch ? GLOBAL_NATION_INDEX : filtered.length
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
      if (rank > GLOBAL_NATION_INDEX) return null
      if (safePage === 1 && i < reals.length) {
        return { ...reals[i], rank: i + 1 }
      }
      const base = filtered[rank % filtered.length]
      return {
        ...base,
        id: `nation-page-${safePage}-${i}`,
        nationId: base.real && safePage === 1 ? base.nationId : null,
        rank,
      }
    }).filter(Boolean)
  }, [filtered, safePage, isOpenSearch])

  const showingFrom = foundDisplay === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(safePage * PAGE_SIZE, foundDisplay)

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Top bar */}
      <div className="mb-5 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {t('hubs.nationsSub')}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t('hubs.nationsTitle')}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {t('hubs.nationsHint', { n: GLOBAL_NATION_INDEX.toLocaleString('en-US') })}
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
            {t('hubs.nationalTeams')}
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
        {/* Left filter console — 1/4 */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-3 sm:p-4 lg:sticky lg:top-20">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {t('hubs.filterConsole')}
            </p>

            <FilterSection title={t('hubs.searchNation')}>
              <input
                value={filters.query}
                onChange={(e) => patch({ query: e.target.value })}
                placeholder={t('hubs.searchNationPh')}
                className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-400/30 focus:outline-none"
              />
            </FilterSection>

            <FilterSection title={t('hubs.confederation')}>
              <div className="flex flex-wrap gap-1.5">
                {CONFEDERATIONS.map((c) => (
                  <ToggleChip
                    key={c.id}
                    active={filters.confederations.includes(c.id)}
                    onClick={() => toggleConf(c.id)}
                  >
                    {c.label}
                  </ToggleChip>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-zinc-600">{t('hubs.confHint')}</p>
            </FilterSection>

            <FilterSection title={t('hubs.fifaRanking')}>
              <div className="flex items-center justify-between text-[11px] tabular-nums text-zinc-400">
                <span>
                  {filters.maxFifaRank >= 211
                    ? t('hubs.allRanks')
                    : FIFA_PRESET_KEYS[`top${filters.maxFifaRank}`]
                      ? t(FIFA_PRESET_KEYS[`top${filters.maxFifaRank}`])
                      : `#1–${filters.maxFifaRank}`}
                </span>
                <span className="text-zinc-600">1 – 211</span>
              </div>
              <input
                type="range"
                min={10}
                max={211}
                step={1}
                value={filters.maxFifaRank}
                onChange={(e) => patch({ maxFifaRank: Number(e.target.value) })}
                className="mt-2 w-full accent-violet-400"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {FIFA_RANK_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => patch({ maxFifaRank: p.maxRank })}
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                      filters.maxFifaRank === p.maxRank
                        ? 'bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/25'
                        : 'bg-white/[0.03] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t(FIFA_PRESET_KEYS[p.id] || 'hubs.allTeams')}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title={t('hubs.squadValueBn')}>
              <div className="flex items-center justify-between text-[11px] tabular-nums text-zinc-400">
                <span>€{filters.valueMin.toFixed(2)}bn</span>
                <span>{filters.valueMax >= 2.5 ? '€2.5bn+' : `€${filters.valueMax.toFixed(2)}bn`}</span>
              </div>
              <label className="mt-2 block text-[10px] text-zinc-600">{t('hubs.minTotal')}</label>
              <input
                type="range"
                min={0}
                max={2.5}
                step={0.05}
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
                max={2.5}
                step={0.05}
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
                  max={5}
                  step={0.05}
                  value={filters.valueMin}
                  onChange={(e) => patch({ valueMin: Number(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.05}
                  value={filters.valueMax}
                  onChange={(e) => patch({ valueMax: Number(e.target.value) || 2.5 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
                />
              </div>
            </FilterSection>

            <FilterSection title={t('hubs.avgSquadAge')}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={35}
                  step={0.1}
                  value={filters.ageMin}
                  onChange={(e) => patch({ ageMin: Number(e.target.value) || 22 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-violet-400/30 focus:outline-none"
                />
                <span className="text-zinc-600">–</span>
                <input
                  type="number"
                  min={20}
                  max={35}
                  step={0.1}
                  value={filters.ageMax}
                  onChange={(e) => patch({ ageMax: Number(e.target.value) || 32 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-violet-400/30 focus:outline-none"
                />
              </div>
              <input
                type="range"
                min={22}
                max={32}
                step={0.1}
                value={filters.ageMax}
                onChange={(e) => patch({ ageMax: Number(e.target.value) })}
                className="mt-2 w-full accent-violet-400"
              />
            </FilterSection>
          </div>
        </aside>

        {/* Right data table — 3/4 */}
        <section className="min-w-0 lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/40">
            <div className="w-full">
              <table className="data-table w-full table-fixed">
                <colgroup>
                  <col className="w-[8%]" />
                  <col className="w-[28%]" />
                  <col className="w-[16%]" />
                  <col className="w-[10%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-[9px] uppercase tracking-wide text-zinc-500">
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableFifa')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableNation')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableConf')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableSquad')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableAge')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableLej')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableSmv')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-10 text-center text-xs text-zinc-500">
                        {t('hubs.noNations')}
                      </td>
                    </tr>
                  )}
                  {pageRows.map((r) => {
                    const canNation = Boolean(r.nationId)
                    return (
                      <tr
                        key={`${r.id}-${r.rank}`}
                        className="odd:bg-zinc-900/30 border-b border-white/5 transition-colors hover:bg-violet-400/[0.04]"
                      >
                        <td className="px-1 py-1.5 font-mono text-[11px] font-semibold tabular-nums text-sky-300/90">
                          {r.fifaRank < 999 ? r.fifaRank : '—'}
                        </td>
                        <td className="min-w-0 px-1 py-1.5">
                          <button
                            type="button"
                            disabled={!canNation}
                            onClick={() => canNation && setView('nation', r.nationId)}
                            className={`group flex w-full min-w-0 items-center gap-1.5 text-left ${
                              canNation ? '' : 'cursor-default'
                            }`}
                          >
                            <FlagMark code={r.code} />
                            <span
                              className={`truncate text-[11px] font-medium text-zinc-100 ${
                                canNation
                                  ? 'transition-colors group-hover:text-violet-300'
                                  : ''
                              }`}
                            >
                              {r.name}
                            </span>
                          </button>
                        </td>
                        <td className="min-w-0 px-1 py-1.5">
                          <span className="inline-flex max-w-full truncate rounded bg-white/[0.04] px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-white/10">
                            {r.confederation}
                          </span>
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-300">
                          {r.squadSize || '—'}
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">
                          {r.avgAge ? r.avgAge.toFixed(1) : '—'}
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-300">
                          {r.foreignPct}%
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono text-[12px] font-bold tabular-nums text-emerald-400">
                          {formatSquadValueBn(r.squadValue)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={safePage}
              totalPages={
                isOpenSearch
                  ? Math.ceil(GLOBAL_NATION_INDEX / PAGE_SIZE)
                  : Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
              }
              onPage={setPage}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
