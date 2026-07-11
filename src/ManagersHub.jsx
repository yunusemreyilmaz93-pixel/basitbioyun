import { useMemo, useState } from 'react'
import { Avatar, Crest, fold } from './ui.jsx'
import {
  MANAGER_DIRECTORY,
  GLOBAL_MANAGER_INDEX,
  FORMATION_OPTIONS,
} from './managerDirectory.js'
import { useI18n } from './i18n/I18nProvider.jsx'

const PAGE_SIZE = 25

const SORT_IDS = [
  { id: 'ppg', key: 'hubs.sortPpg' },
  { id: 'winPct', key: 'hubs.sortWinPct' },
  { id: 'matches', key: 'hubs.sortMatches' },
  { id: 'youngest', key: 'hubs.sortYoungestAge' },
]

const defaultFilters = () => ({
  query: '',
  employed: false,
  freeAgents: false,
  formation: 'all',
  minPpg: 0,
  minWinPct: 0,
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
          ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30'
          : 'bg-white/[0.03] text-zinc-400 ring-1 ring-white/5 hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
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
  if (f.employed) n++
  if (f.freeAgents) n++
  if (f.formation !== 'all') n++
  if (f.minPpg > 0) n++
  if (f.minWinPct > 0) n++
  return n
}

/**
 * ManagersHub — high-density staff terminal (PlayersHub / ClubsHub architecture).
 */
export default function ManagersHub({ setView }) {
  const { t } = useI18n()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState('ppg')
  const [page, setPage] = useState(1)

  const patch = (partial) => {
    setFilters((f) => ({ ...f, ...partial }))
    setPage(1)
  }

  const reset = () => {
    setFilters(defaultFilters())
    setSort('ppg')
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = fold(filters.query.trim())
    let rows = MANAGER_DIRECTORY.filter((r) => {
      if (q && !fold(r.name).includes(q) && !(r.club && fold(r.club).includes(q))) return false

      // Status: if either toggle on, OR semantics
      const statusOn = filters.employed || filters.freeAgents
      if (statusOn) {
        const ok =
          (filters.employed && r.employed) || (filters.freeAgents && !r.employed)
        if (!ok) return false
      }

      if (filters.formation !== 'all' && r.formation !== filters.formation) return false
      if (r.ppg < filters.minPpg) return false
      if (r.winPct < filters.minWinPct) return false
      return true
    })

    rows = [...rows].sort((a, b) => {
      if (sort === 'winPct') return b.winPct - a.winPct
      if (sort === 'matches') return b.matches - a.matches
      if (sort === 'youngest') return a.age - b.age
      return b.ppg - a.ppg
    })
    return rows
  }, [filters, sort])

  const isOpenSearch =
    !filters.query &&
    !filters.employed &&
    !filters.freeAgents &&
    filters.formation === 'all' &&
    filters.minPpg <= 0 &&
    filters.minWinPct <= 0

  const foundDisplay = isOpenSearch ? GLOBAL_MANAGER_INDEX : filtered.length
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
      if (rank > GLOBAL_MANAGER_INDEX) return null
      if (safePage === 1 && i < reals.length) {
        return { ...reals[i], rank: i + 1 }
      }
      const base = filtered[rank % filtered.length]
      return {
        ...base,
        id: `mgr-page-${safePage}-${i}`,
        managerId: base.real && safePage === 1 ? base.managerId : null,
        clubId: base.real && safePage === 1 ? base.clubId : null,
        rank,
      }
    }).filter(Boolean)
  }, [filtered, safePage, isOpenSearch])

  const showingFrom = foundDisplay === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(safePage * PAGE_SIZE, foundDisplay)

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Top header bar */}
      <div className="mb-5 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {t('hubs.managersSub')}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t('hubs.managersTitle')}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {t('hubs.managersHint', { n: GLOBAL_MANAGER_INDEX.toLocaleString('en-US') })}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-sky-400/30 hover:text-sky-300"
          >
            {t('common.resetAll')}
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
            {t('hubs.managersFound')}
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

            <FilterSection title={t('hubs.searchManager')}>
              <input
                value={filters.query}
                onChange={(e) => patch({ query: e.target.value })}
                placeholder={t('hubs.searchManagerPh')}
                className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/30 focus:outline-none"
              />
            </FilterSection>

            <FilterSection title={t('hubs.employment')}>
              <div className="flex flex-wrap gap-1.5">
                <ToggleChip
                  active={filters.employed}
                  onClick={() => patch({ employed: !filters.employed })}
                >
                  {t('hubs.employed')}
                </ToggleChip>
                <ToggleChip
                  active={filters.freeAgents}
                  onClick={() => patch({ freeAgents: !filters.freeAgents })}
                >
                  {t('hubs.unemployed')}
                </ToggleChip>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
                {t('hubs.employmentHint')}
              </p>
            </FilterSection>

            <FilterSection title={t('hubs.tacticalSystem')}>
              <select
                value={filters.formation}
                onChange={(e) => patch({ formation: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-2 text-xs text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
              >
                {FORMATION_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id === 'all' ? t('common.all') : f.label}
                  </option>
                ))}
              </select>
            </FilterSection>

            <FilterSection title={t('hubs.minPpg')}>
              <div className="flex items-center justify-between text-[11px] tabular-nums text-zinc-400">
                <span>
                  {filters.minPpg.toFixed(2)} {t('common.ppg')}
                </span>
                <span className="text-zinc-600">{t('manager.maxPpg')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={2.5}
                step={0.05}
                value={filters.minPpg}
                onChange={(e) => patch({ minPpg: Number(e.target.value) })}
                className="mt-2 w-full accent-emerald-400"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={3}
                  step={0.05}
                  value={filters.minPpg}
                  onChange={(e) => patch({ minPpg: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
                />
                <span className="shrink-0 text-[10px] text-zinc-600">{t('hubs.ppgMin')}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {[1.5, 1.8, 2.0, 2.2, 2.5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => patch({ minPpg: v })}
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums transition-colors ${
                      Math.abs(filters.minPpg - v) < 0.001
                        ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25'
                        : 'bg-white/[0.03] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {v.toFixed(1)}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title={t('hubs.winThreshold')}>
              <div className="flex items-center justify-between text-[11px] tabular-nums text-zinc-400">
                <span>≥ {filters.minWinPct}%</span>
                <span className="text-zinc-600">0 – 80%</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={filters.minWinPct}
                onChange={(e) => patch({ minWinPct: Number(e.target.value) })}
                className="mt-2 w-full accent-sky-400"
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
                  <col className="w-[6%]" />
                  <col className="w-[26%]" />
                  <col className="w-[20%]" />
                  <col className="w-[7%]" />
                  <col className="w-[13%]" />
                  <col className="w-[10%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-[9px] uppercase tracking-wide text-zinc-500">
                    <th className="px-1 py-2 text-left font-medium">{t('common.rank')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableManager')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableStatus')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableAge')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableTactics')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableM')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableWin')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tablePpg')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-xs text-zinc-500">
                        {t('hubs.noManagers')}
                      </td>
                    </tr>
                  )}
                  {pageRows.map((r) => {
                    const canManager = Boolean(r.managerId)
                    const canClub = Boolean(r.clubId)
                    const formation = r.formationLabel || r.formation
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
                            disabled={!canManager}
                            onClick={() => canManager && setView('manager', r.managerId)}
                            className={`group flex w-full min-w-0 items-center gap-1.5 text-left ${
                              canManager ? '' : 'cursor-default'
                            }`}
                          >
                            <Avatar name={r.name} size="xs" />
                            <span className="min-w-0">
                              <span
                                className={`block truncate text-[11px] font-medium text-zinc-100 ${
                                  canManager
                                    ? 'transition-colors group-hover:text-emerald-300'
                                    : ''
                                }`}
                              >
                                {r.name}
                              </span>
                              <span className="mt-0.5 inline-flex rounded-sm bg-white/10 px-1 py-px font-mono text-[8px] font-bold text-zinc-400">
                                {r.nation.code}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="min-w-0 px-1 py-1.5">
                          {!r.employed || !r.club ? (
                            <span className="inline-flex max-w-full truncate rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-white/10">
                              {t('common.free')}
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={!canClub}
                              onClick={() => canClub && setView('club', r.clubId)}
                              className={`inline-flex w-full min-w-0 items-center gap-1 text-left ${
                                canClub
                                  ? 'text-zinc-300 transition-colors hover:text-sky-300'
                                  : 'cursor-default text-zinc-300'
                              }`}
                            >
                              <Crest code={r.clubCode || '—'} size="xs" />
                              <span className="truncate text-[11px]">{r.club}</span>
                            </button>
                          )}
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">{r.age}</td>
                        <td className="min-w-0 px-1 py-1.5">
                          <span
                            className="inline-flex max-w-full truncate rounded border border-white/20 bg-transparent px-1 py-0.5 font-mono text-[9px] font-semibold tabular-nums tracking-tight text-zinc-300"
                            title={formation}
                          >
                            {r.formation || formation}
                          </span>
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-300">
                          {r.matches.toLocaleString('en-US')}
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-300">
                          {r.winPct.toFixed(0)}%
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono text-[12px] font-bold tabular-nums text-blue-400">
                          {r.ppg.toFixed(2)}
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
                  ? Math.ceil(GLOBAL_MANAGER_INDEX / PAGE_SIZE)
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
