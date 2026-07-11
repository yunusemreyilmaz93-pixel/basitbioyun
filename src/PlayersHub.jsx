import { useMemo, useState } from 'react'
import { Avatar, Crest, euros, fold } from './ui.jsx'
import {
  SCOUT_DIRECTORY,
  SCOUT_LEAGUES,
  SUB_POSITIONS,
  GLOBAL_INDEX_SIZE,
} from './scoutDirectory.js'
import { useI18n } from './i18n/I18nProvider.jsx'
import { DATA_SOURCE } from './dataLayer.js'

const PAGE_SIZE = 25

const SORT_IDS = [
  { id: 'value', key: 'hubs.sortHighestValue' },
  { id: 'form', key: 'hubs.sortBestForm' },
  { id: 'youngest', key: 'hubs.sortYoungest' },
  { id: 'goals', key: 'hubs.sortMostGoals' },
]

const GROUP_TOGGLES = [
  { id: 'GK', label: 'GK' },
  { id: 'DEF', label: 'DEF' },
  { id: 'MID', label: 'MID' },
  { id: 'FWD', label: 'FWD' },
]

const defaultFilters = () => ({
  query: '',
  leagues: [], // empty = all
  groups: [], // empty = all
  subPositions: [],
  ageMin: 16,
  ageMax: 40,
  valueMin: 0,
  valueMax: 200,
  expiring2026: false,
  freeAgents: false,
  loanPlayers: false,
})

function formatValue(v) {
  if (v >= 200) return '€200M+'
  if (v < 1) return `€${(v * 1000).toFixed(0)}k`
  if (Number.isInteger(v)) return euros(v)
  return `€${v.toFixed(1)}M`
}

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
  const push = (n) => items.push(n)
  push(1)
  const windowStart = Math.max(2, page - 1)
  const windowEnd = Math.min(totalPages - 1, page + 1)
  if (windowStart > 2) items.push('…')
  for (let i = windowStart; i <= windowEnd; i++) push(i)
  if (windowEnd < totalPages - 1) items.push('…')
  if (totalPages > 1) push(totalPages)

  // de-dupe sequential
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

/**
 * Advanced Scouting Directory — high-density Players hub.
 */
export default function PlayersHub({ setView }) {
  const { t } = useI18n()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState('value')
  const [page, setPage] = useState(1)

  const patch = (partial) => {
    setFilters((f) => ({ ...f, ...partial }))
    setPage(1)
  }

  const toggleInArray = (key, value) => {
    setFilters((f) => {
      const arr = f[key]
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]
      return { ...f, [key]: next }
    })
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = fold(filters.query.trim())
    let rows = SCOUT_DIRECTORY.filter((r) => {
      if (q && !fold(r.name).includes(q) && !fold(r.club).includes(q)) return false
      if (filters.leagues.length && !filters.leagues.includes(r.league)) return false
      if (filters.groups.length && !filters.groups.includes(r.posGroup)) return false
      if (filters.subPositions.length && !filters.subPositions.includes(r.position)) return false
      if (r.age < filters.ageMin || r.age > filters.ageMax) return false
      if (r.value < filters.valueMin) return false
      if (filters.valueMax < 200 && r.value > filters.valueMax) return false
      // contract status filters (OR if any selected)
      const statusFilters = filters.expiring2026 || filters.freeAgents || filters.loanPlayers
      if (statusFilters) {
        const ok =
          (filters.expiring2026 && (r.status === 'expiring' || r.contractUntil === 2026)) ||
          (filters.freeAgents && r.status === 'free') ||
          (filters.loanPlayers && (r.loan || r.status === 'loan'))
        if (!ok) return false
      }
      return true
    })

    rows = [...rows].sort((a, b) => {
      if (sort === 'form') return b.form - a.form
      if (sort === 'youngest') return a.age - b.age
      if (sort === 'goals') return b.goals - a.goals
      return b.value - a.value
    })

    return rows
  }, [filters, sort])

  // Simulate massive index only in mock mode (warehouse uses real row counts)
  const isOpenSearch =
    DATA_SOURCE.mode !== 'supabase' &&
    !filters.query &&
    !filters.leagues.length &&
    !filters.groups.length &&
    !filters.subPositions.length &&
    filters.ageMin <= 16 &&
    filters.ageMax >= 40 &&
    filters.valueMin <= 0 &&
    filters.valueMax >= 200 &&
    !filters.expiring2026 &&
    !filters.freeAgents &&
    !filters.loanPlayers

  const foundDisplay = isOpenSearch ? GLOBAL_INDEX_SIZE : filtered.length
  const totalPages = Math.max(1, Math.ceil(foundDisplay / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  // Page slice: for open search, cycle pool for deep pages so UI never goes empty
  const pageRows = useMemo(() => {
    if (!filtered.length) return []
    if (!isOpenSearch) {
      const start = (safePage - 1) * PAGE_SIZE
      return filtered.slice(start, start + PAGE_SIZE).map((r, i) => ({
        ...r,
        rank: start + i + 1,
      }))
    }
    // Open search: deterministic window into full index size using pool as template
    const startRank = (safePage - 1) * PAGE_SIZE
    return Array.from({ length: PAGE_SIZE }, (_, i) => {
      const rank = startRank + i + 1
      if (rank > GLOBAL_INDEX_SIZE) return null
      const base = filtered[rank % filtered.length]
      // Keep real dossiers on first page top ranks
      if (safePage === 1 && i < filtered.filter((x) => x.real).length) {
        const reals = filtered.filter((x) => x.real)
        const row = reals[i] || base
        return { ...row, rank: i + 1 }
      }
      return {
        ...base,
        id: `page-${safePage}-${i}`,
        // only deep-link real player dossiers
        playerId: base.real && safePage === 1 ? base.playerId : base.playerId && safePage === 1 ? base.playerId : null,
        name: safePage === 1 && base.real ? base.name : base.name,
        rank,
      }
    }).filter(Boolean)
  }, [filtered, safePage, isOpenSearch])

  const showingFrom = foundDisplay === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(safePage * PAGE_SIZE, foundDisplay)

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 border-b border-white/5 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {t('hubs.playersSub')}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {t('hubs.playersTitle')}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {t('hubs.playersHint', { n: GLOBAL_INDEX_SIZE.toLocaleString() })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* ---- Left: Filter console ---- */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-3 sm:p-4 lg:sticky lg:top-20">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {t('hubs.filterConsole')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilters(defaultFilters())
                  setPage(1)
                }}
                className="text-[10px] font-medium text-sky-400 hover:text-sky-300"
              >
                {t('common.reset')}
              </button>
            </div>

            <FilterSection title={t('hubs.searchWithin')}>
              <input
                value={filters.query}
                onChange={(e) => patch({ query: e.target.value })}
                placeholder={t('hubs.searchPlayerClub')}
                className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/30 focus:outline-none"
              />
            </FilterSection>

            <FilterSection title={t('hubs.leagues')}>
              <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
                {SCOUT_LEAGUES.filter((l) => l !== 'All Leagues').map((league) => {
                  const on = filters.leagues.includes(league)
                  return (
                    <label
                      key={league}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-xs text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleInArray('leagues', league)}
                        className="size-3 rounded border-white/20 bg-zinc-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="truncate">{league}</span>
                    </label>
                  )
                })}
              </div>
            </FilterSection>

            <FilterSection title={t('hubs.positionGroup')}>
              <div className="flex flex-wrap gap-1.5">
                {GROUP_TOGGLES.map((g) => (
                  <ToggleChip
                    key={g.id}
                    active={filters.groups.includes(g.id)}
                    onClick={() => toggleInArray('groups', g.id)}
                  >
                    {g.label}
                  </ToggleChip>
                ))}
              </div>
              <p className="mb-1.5 mt-3 text-[10px] font-medium text-zinc-600">{t('hubs.subPositions')}</p>
              <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto">
                {SUB_POSITIONS.map((sp) => (
                  <ToggleChip
                    key={sp}
                    active={filters.subPositions.includes(sp)}
                    onClick={() => toggleInArray('subPositions', sp)}
                  >
                    {sp}
                  </ToggleChip>
                ))}
              </div>
            </FilterSection>

            <FilterSection title={t('hubs.ageBracket')}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={15}
                  max={45}
                  value={filters.ageMin}
                  onChange={(e) => patch({ ageMin: Number(e.target.value) || 16 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
                />
                <span className="text-zinc-600">–</span>
                <input
                  type="number"
                  min={15}
                  max={45}
                  value={filters.ageMax}
                  onChange={(e) => patch({ ageMax: Number(e.target.value) || 40 })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1.5 text-xs tabular-nums text-zinc-100 focus:border-emerald-400/30 focus:outline-none"
                />
              </div>
              <input
                type="range"
                min={16}
                max={40}
                value={filters.ageMax}
                onChange={(e) => patch({ ageMax: Number(e.target.value) })}
                className="mt-2 w-full accent-emerald-400"
              />
            </FilterSection>

            <FilterSection title={t('hubs.smartValue')}>
              <div className="flex items-center justify-between text-[11px] tabular-nums text-zinc-400">
                <span>€{filters.valueMin}M</span>
                <span>{filters.valueMax >= 200 ? '€200M+' : `€${filters.valueMax}M`}</span>
              </div>
              <label className="mt-2 block text-[10px] text-zinc-600">{t('hubs.minValue')}</label>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={filters.valueMin}
                onChange={(e) =>
                  patch({ valueMin: Math.min(Number(e.target.value), filters.valueMax) })
                }
                className="w-full accent-emerald-400"
              />
              <label className="mt-1 block text-[10px] text-zinc-600">{t('hubs.maxValue')}</label>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={filters.valueMax}
                onChange={(e) =>
                  patch({ valueMax: Math.max(Number(e.target.value), filters.valueMin) })
                }
                className="w-full accent-emerald-400"
              />
            </FilterSection>

            <FilterSection title={t('hubs.contractStatus')}>
              <div className="space-y-1.5">
                {[
                  { key: 'expiring2026', labelKey: 'hubs.expiring2026' },
                  { key: 'freeAgents', labelKey: 'hubs.freeAgents' },
                  { key: 'loanPlayers', labelKey: 'hubs.loanPlayers' },
                ].map((c) => (
                  <label
                    key={c.key}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-xs text-zinc-400 hover:bg-white/[0.03]"
                  >
                    <input
                      type="checkbox"
                      checked={filters[c.key]}
                      onChange={(e) => patch({ [c.key]: e.target.checked })}
                      className="size-3 rounded border-white/20 bg-zinc-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                    />
                    {t(c.labelKey)}
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* ---- Right: Scouting table ---- */}
        <section className="min-w-0 lg:col-span-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-400">
              {t('hubs.showingOf', {
                from: showingFrom,
                to: showingTo,
                total: foundDisplay.toLocaleString(),
              })}{' '}
              {t('hubs.playersFound')}
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

          <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/40">
            <div className="w-full">
              <table className="data-table w-full table-fixed">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[24%]" />
                  <col className="w-[16%]" />
                  <col className="w-[8%]" />
                  <col className="w-[6%]" />
                  <col className="w-[8%]" />
                  <col className="w-[6%]" />
                  <col className="w-[6%]" />
                  <col className="w-[9%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-[9px] uppercase tracking-wide text-zinc-500">
                    <th className="px-1 py-2 text-left font-medium">{t('common.rank')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tablePlayer')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tableClub')}</th>
                    <th className="px-1 py-2 text-left font-medium">{t('hubs.tablePos')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableAge')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableForm')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableG')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableA')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableCtr')}</th>
                    <th className="px-1 py-2 text-right font-medium">{t('hubs.tableSmv')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-3 py-10 text-center text-xs text-zinc-500">
                        {t('hubs.noPlayers')}
                      </td>
                    </tr>
                  )}
                  {pageRows.map((r) => {
                    const canPlayer = Boolean(r.playerId && r.real)
                    return (
                      <tr
                        key={r.id + '-' + r.rank}
                        className="odd:bg-zinc-900/30 border-b border-white/5 transition-colors hover:bg-emerald-400/[0.04]"
                      >
                        <td className="px-1 py-1.5 font-mono text-[10px] font-semibold tabular-nums text-zinc-600">
                          {r.rank}
                        </td>
                        <td className="min-w-0 px-1 py-1.5">
                          <button
                            type="button"
                            disabled={!canPlayer}
                            onClick={() => canPlayer && setView('player', r.playerId)}
                            className={`group flex w-full min-w-0 items-center gap-1.5 text-left ${
                              canPlayer ? '' : 'cursor-default'
                            }`}
                          >
                            <Avatar name={r.name} size="xs" src={r.imageUrl} />
                            <span className="min-w-0">
                              <span
                                className={`block truncate text-[11px] font-medium text-zinc-100 ${
                                  canPlayer ? 'transition-colors group-hover:text-emerald-300' : ''
                                }`}
                              >
                                {r.name}
                              </span>
                              <span className="mt-0.5 inline-flex items-center gap-1">
                                <span className="rounded-sm bg-white/10 px-1 py-px font-mono text-[8px] font-bold text-zinc-400">
                                  {r.nation.code}
                                </span>
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="min-w-0 px-1 py-1.5">
                          <button
                            type="button"
                            disabled={!r.clubId}
                            onClick={() => r.clubId && setView('club', r.clubId)}
                            className={`inline-flex w-full min-w-0 items-center gap-1 ${
                              r.clubId ? 'hover:text-sky-300' : 'cursor-default'
                            }`}
                          >
                            <Crest code={r.clubShort} size="xs" />
                            <span className="truncate text-zinc-300">{r.club}</span>
                          </button>
                        </td>
                        <td className="truncate px-1 py-1.5 text-zinc-400">{r.position}</td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">{r.age}</td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-sky-300">
                          {r.form.toFixed(2)}
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-300">{r.goals}</td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-300">{r.assists}</td>
                        <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-500">
                          {r.contractUntil}
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono text-[12px] font-semibold tabular-nums text-emerald-400">
                          {formatValue(r.value)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={safePage}
              totalPages={isOpenSearch ? Math.ceil(GLOBAL_INDEX_SIZE / PAGE_SIZE) : totalPages}
              onPage={setPage}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
