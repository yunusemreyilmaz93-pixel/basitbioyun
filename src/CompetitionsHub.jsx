import { useMemo, useState } from 'react'
import { Crest, fold } from './ui.jsx'
import {
  COMPETITION_DIRECTORY,
  CONTINENT_REGIONS,
  formatBn,
  formatPlayerValue,
} from './competitionDirectory.js'
import { useI18n } from './i18n/I18nProvider.jsx'
import { competitionDisplayName } from './lib/displayNames.js'
import { Flag } from './ui/Flag.jsx'

const CATEGORY_IDS = [
  { id: 'all', key: 'hubs.allCompetitions' },
  { id: 'domestic', key: 'hubs.domesticOnly' },
  { id: 'continental', key: 'hubs.continentalOnly' },
]

const SORT_IDS = [
  { id: 'totalValue', key: 'hubs.sortTotalValue' },
  { id: 'championValue', key: 'hubs.sortChampionValue' },
  { id: 'avgPlayerValue', key: 'hubs.sortAvgPlayer' },
]

function LogoMark({ code, large = false }) {
  let h = 0
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 360
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl font-display font-bold tracking-tight text-white/90 ring-1 ring-white/15 ${
        large ? 'size-14 text-sm sm:size-16 sm:text-base' : 'size-11 text-[11px]'
      }`}
      style={{
        background: `linear-gradient(145deg, hsl(${h} 48% 34%), hsl(${(h + 36) % 360} 52% 14%))`,
      }}
      aria-hidden="true"
    >
      {code}
    </div>
  )
}

function FlagPill({ code }) {
  if (!code) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-white/10 px-1 py-0.5 text-zinc-300">
      <Flag code={code} size={14} />
      <span className="font-display text-[9px] font-bold tracking-wide">{code}</span>
    </span>
  )
}

function TogglePill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
        active
          ? 'bg-zinc-100 text-zinc-950 ring-1 ring-white/20'
          : 'bg-white/[0.04] text-zinc-400 ring-1 ring-white/10 hover:bg-white/[0.07] hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  )
}

function sortRows(rows, sort) {
  return [...rows].sort((a, b) => {
    if (sort === 'championValue') return b.championValue - a.championValue
    if (sort === 'avgPlayerValue') return b.avgPlayerValue - a.avgPlayerValue
    return b.totalValue - a.totalValue
  })
}

/* ------------------------------------------------------------------ */
/*  Elite international cup card                                       */
/* ------------------------------------------------------------------ */

function EliteCupCard({ c, setView }) {
  const { t, locale } = useI18n()
  const title = competitionDisplayName(c, locale)
  return (
    <button
      type="button"
      onClick={() => setView('league', c.leagueId)}
      className="group relative flex min-h-[11.5rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-4 text-left transition-all hover:border-sky-400/35 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12)]"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-sky-400/[0.07] blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <LogoMark code={c.code} large />
        <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-300 ring-1 ring-sky-400/25">
          {c.confederation}
        </span>
      </div>
      <div className="relative mt-3 min-w-0 flex-1">
        <p className="font-display text-[15px] font-semibold leading-snug text-white transition-colors group-hover:text-sky-200">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-zinc-500">{c.code || c.fullName}</p>
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-2 border-t border-white/5 pt-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{t('hubs.totalValue')}</p>
          <p className="font-display text-xl font-bold tabular-nums text-emerald-400">
            {formatBn(c.totalValue)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{t('hubs.clubsLabel')}</p>
          <p className="font-display text-base font-semibold tabular-nums text-zinc-200">{c.teams}</p>
        </div>
      </div>
      <div className="relative mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
        <span className="text-zinc-600">{t('hubs.champion')}</span>
        {c.championClubId ? (
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              setView('club', c.championClubId)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation()
                setView('club', c.championClubId)
              }
            }}
            className="inline-flex items-center gap-1 font-medium text-zinc-200 transition-colors hover:text-sky-300"
          >
            <Crest code={c.championCode} size="xs" />
            <span className="truncate max-w-[7rem]">{c.champion}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-medium text-zinc-300">
            <Crest code={c.championCode} size="xs" />
            <span className="truncate max-w-[7rem]">{c.champion}</span>
          </span>
        )}
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Domestic high-density card                                         */
/* ------------------------------------------------------------------ */

function DomesticCard({ c, setView }) {
  const { t, locale } = useI18n()
  const title = competitionDisplayName(c, locale)
  return (
    <button
      type="button"
      onClick={() => setView('league', c.leagueId)}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/5 bg-zinc-950/60 px-3 py-2.5 text-left transition-colors hover:border-emerald-400/25 hover:bg-zinc-900/80"
    >
      <LogoMark code={c.code} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold text-zinc-100 transition-colors group-hover:text-emerald-300">
            {title}
          </span>
          <FlagPill code={c.nationCode || c.country} />
        </div>
        <p className="mt-0.5 truncate text-[11px] text-zinc-500">{c.country}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px]">
          <span className="tabular-nums text-zinc-300">
            <span className="text-zinc-600">{t('hubs.clubsLabel')} </span>
            {c.teams}
          </span>
          <span className="font-display text-sm font-semibold tabular-nums text-emerald-400">
            {formatBn(c.totalValue)}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1 text-zinc-400">
            <span className="shrink-0 text-zinc-600">{t('hubs.champion')}</span>
            {c.championClubId ? (
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  setView('club', c.championClubId)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                    setView('club', c.championClubId)
                  }
                }}
                className="inline-flex min-w-0 items-center gap-1 truncate font-medium text-zinc-200 hover:text-sky-300"
              >
                <Crest code={c.championCode} size="xs" />
                <span className="truncate">{c.champion}</span>
              </span>
            ) : (
              <span className="inline-flex min-w-0 items-center gap-1 truncate font-medium text-zinc-300">
                <Crest code={c.championCode} size="xs" />
                <span className="truncate">{c.champion}</span>
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">{t('hubs.sortAvgPlayer')}</p>
        <p className="font-display text-sm font-semibold tabular-nums text-sky-300">
          {formatPlayerValue(c.avgPlayerValue)}
        </p>
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Continent accordion                                                */
/* ------------------------------------------------------------------ */

function ContinentAccordion({ region, leagues, open, onToggle, setView }) {
  const { t } = useI18n()
  if (!leagues.length) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-white sm:text-base">
            {region.label}{' '}
            <span className="font-sans text-xs font-medium text-zinc-500">
              ({region.confederation})
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {leagues.length} {t('hubs.leaguesCount')} · Σ{' '}
            <span className="tabular-nums text-zinc-400">
              {formatBn(leagues.reduce((s, l) => s + l.totalValue, 0))}
            </span>
          </p>
        </div>
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-white/5 px-3 py-3 sm:px-4">
          {leagues.map((c) => (
            <DomesticCard key={c.id} c={c} setView={setView} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * CompetitionsHub — premium global tournament terminal.
 */
export default function CompetitionsHub({ setView }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('totalValue')
  const [openRegions, setOpenRegions] = useState(() => new Set(['Europe']))

  const reset = () => {
    setQuery('')
    setCategory('all')
    setSort('totalValue')
    setOpenRegions(new Set(['Europe']))
  }

  const filtered = useMemo(() => {
    const q = fold(query.trim())
    let rows = COMPETITION_DIRECTORY.filter((c) => {
      if (category === 'domestic' && c.type !== 'domestic') return false
      if (category === 'continental' && c.type !== 'continental') return false
      if (
        q &&
        !fold(c.name).includes(q) &&
        !fold(c.fullName).includes(q) &&
        !fold(c.country).includes(q) &&
        !fold(c.code).includes(q) &&
        !fold(c.champion).includes(q)
      ) {
        return false
      }
      return true
    })
    return sortRows(rows, sort)
  }, [query, category, sort])

  const eliteCups = useMemo(
    () => filtered.filter((c) => c.elite || c.type === 'continental'),
    [filtered],
  )

  const domestic = useMemo(() => filtered.filter((c) => c.type === 'domestic'), [filtered])

  const byContinent = useMemo(() => {
    const map = Object.fromEntries(CONTINENT_REGIONS.map((r) => [r.id, []]))
    for (const c of domestic) {
      const key = map[c.continent] ? c.continent : null
      if (key) map[key].push(c)
      else {
        // fallback: put unmapped under Europe
        if (!map.Europe) map.Europe = []
        // skip world-level domestics
      }
    }
    return map
  }, [domestic])

  const activeFilters =
    (query.trim() ? 1 : 0) + (category !== 'all' ? 1 : 0) + (sort !== 'totalValue' ? 1 : 0)

  const showElite = category !== 'domestic' && eliteCups.length > 0
  const showDomestic = category !== 'continental' && domestic.length > 0

  const toggleRegion = (id) => {
    setOpenRegions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Top filter & search strip */}
      <div className="mb-6 border-b border-white/5 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {t('hubs.globalTournament')}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t('hubs.competitionsTitle')}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">{t('hubs.competitionsSub')}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-sky-400/30 hover:text-sky-300"
          >
            {t('common.reset')}
            {activeFilters > 0 && (
              <span className="ml-1.5 rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-sky-300">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('hubs.searchComp')}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/70 py-2.5 pl-3 pr-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-sky-400/30 focus:outline-none sm:text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORY_IDS.map((p) => (
                <TogglePill
                  key={p.id}
                  active={category === p.id}
                  onClick={() => setCategory(p.id)}
                >
                  {t(p.key)}
                </TogglePill>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-400">
              <span className="font-semibold tabular-nums text-zinc-200">{filtered.length}</span>{' '}
              {t('hubs.competitions')}
              {query.trim() && (
                <span className="text-zinc-600"> · “{query.trim()}”</span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                {t('common.sortBy')}
              </span>
              {SORT_IDS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSort(s.id)}
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
      </div>

      <div className="space-y-8">
        {/* Section 1 — Elite international cups */}
        {showElite && (
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-400/80">
                  {t('hubs.section01')}
                </p>
                <h2 className="mt-0.5 font-display text-lg font-semibold text-white sm:text-xl">
                  {t('hubs.eliteCups')}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {t('hubs.eliteCupsSub')}
                </p>
              </div>
              <span className="hidden text-[11px] tabular-nums text-zinc-600 sm:inline">
                {eliteCups.length} {t('hubs.cups')}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {eliteCups.map((c) => (
                <EliteCupCard key={c.id} c={c} setView={setView} />
              ))}
            </div>
          </section>
        )}

        {/* Section 2 — Domestic leagues by continent */}
        {showDomestic && (
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/80">
                  {t('hubs.section02')}
                </p>
                <h2 className="mt-0.5 font-display text-lg font-semibold text-white sm:text-xl">
                  {t('hubs.domesticLeagues')}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {t('hubs.domesticSub')}
                </p>
              </div>
              <span className="hidden text-[11px] tabular-nums text-zinc-600 sm:inline">
                {domestic.length} {t('hubs.leaguesCount')}
              </span>
            </div>
            <div className="space-y-2.5">
              {CONTINENT_REGIONS.map((region) => (
                <ContinentAccordion
                  key={region.id}
                  region={region}
                  leagues={byContinent[region.id] || []}
                  open={openRegions.has(region.id)}
                  onToggle={() => toggleRegion(region.id)}
                  setView={setView}
                />
              ))}
            </div>
          </section>
        )}

        {!filtered.length && (
          <div className="rounded-2xl border border-white/5 bg-zinc-950/40 px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">{t('hubs.noCompetitions')}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 text-xs font-medium text-sky-400 hover:text-sky-300"
            >
              {t('common.reset')}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
