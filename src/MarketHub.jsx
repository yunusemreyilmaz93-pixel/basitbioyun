import { useMemo, useState } from 'react'
import { Avatar, Crest, euros, fold, ScoreBadge } from './ui.jsx'
import {
  MARKET_LEAGUES,
  POS_GROUPS,
  TRANSFER_TYPES,
  TRANSFER_LEDGER,
  RUMOR_MILL,
  VALUE_RISERS,
  VALUE_DROPPERS,
  TOP_SPENDING_LEAGUES,
  DOMINANT_AGENCIES,
  matchesMarketFilters,
} from './marketDirectory.js'
import { MATCHES } from './homeData.js'
import { useI18n } from './i18n/I18nProvider.jsx'

const defaultFilters = () => ({
  query: '',
  league: 'All leagues',
  posGroups: [],
  transferType: 'all',
})

function formatPath(oldV, newV) {
  return `€${Number(oldV).toFixed(0)}M ➔ €${Number(newV).toFixed(0)}M`
}

function probBarColor(p) {
  if (p >= 65) return 'bg-emerald-400'
  if (p >= 40) return 'bg-amber-400'
  if (p >= 20) return 'bg-orange-400'
  return 'bg-zinc-500'
}

function TierBadge({ tier }) {
  const styles = {
    1: 'bg-cyan-400/15 text-cyan-300 ring-cyan-400/40',
    2: 'bg-sky-400/10 text-sky-300/90 ring-sky-400/25',
    3: 'bg-zinc-800 text-zinc-500 ring-white/10',
  }
  return (
    <span
      className={`inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
        styles[tier] || styles[3]
      }`}
    >
      Tier {tier}
    </span>
  )
}

function PosBadge({ pos }) {
  return (
    <span className="inline-flex shrink-0 rounded bg-white/5 px-1.5 py-0.5 font-display text-[10px] font-bold tabular-nums text-zinc-400 ring-1 ring-white/10">
      {pos}
    </span>
  )
}

function ClubHop({ fromCode, toCode, fromClubId, toClubId, setView }) {
  const open = (id, e) => {
    if (!id) return
    e.stopPropagation()
    setView('club', id)
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        role={fromClubId ? 'link' : undefined}
        tabIndex={fromClubId ? 0 : undefined}
        onClick={(e) => open(fromClubId, e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && fromClubId) open(fromClubId, e)
        }}
        className={fromClubId ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}
        title={fromCode}
      >
        <Crest code={fromCode || '—'} size="sm" />
      </span>
      <span className="font-display text-xs font-bold text-zinc-500" aria-hidden="true">
        ➔
      </span>
      <span
        role={toClubId ? 'link' : undefined}
        tabIndex={toClubId ? 0 : undefined}
        onClick={(e) => open(toClubId, e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && toClubId) open(toClubId, e)
        }}
        className={toClubId ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}
        title={toCode}
      >
        <Crest code={toCode || '—'} size="sm" />
      </span>
    </span>
  )
}

function ColumnShell({ title, subtitle, count, accent = 'emerald', headerExtra, children }) {
  const accents = {
    emerald: 'text-emerald-400/90',
    cyan: 'text-cyan-400/90',
    sky: 'text-sky-400/90',
    rose: 'text-rose-400/90',
  }
  return (
    <section className="flex min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 lg:max-h-[min(42rem,calc(100vh-12rem))]">
      <header className="shrink-0 border-b border-white/5 bg-zinc-900/50 px-3.5 py-3">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${accents[accent]}`}>
          {subtitle}
        </p>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-white">{title}</h2>
          <span className="text-[11px] tabular-nums text-zinc-500">{count}</span>
        </div>
        {headerExtra}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  )
}

function EmptyCol({ label }) {
  return <p className="px-4 py-12 text-center text-xs text-zinc-600">{label}</p>
}

function MarketAnalyticsStrip() {
  const { t } = useI18n()
  const maxSpend = Math.max(...TOP_SPENDING_LEAGUES.map((l) => l.spent), 1)

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Card 1 — Top Spending Leagues */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400/90">
              {t('market.windowBalance')}
            </p>
            <h3 className="mt-0.5 font-display text-sm font-semibold text-white">
              {t('market.topSpending')}
            </h3>
          </div>
          <span className="text-[10px] tabular-nums text-zinc-600">{t('market.netSpend')}</span>
        </div>
        <ul className="mt-3 space-y-2.5">
          {TOP_SPENDING_LEAGUES.map((l) => {
            const pct = Math.round((l.spent / maxSpend) * 100)
            return (
              <li key={l.league}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Crest code={l.code} size="xs" />
                    <span className="truncate font-medium text-zinc-200">{l.league}</span>
                  </span>
                  <span className="shrink-0 font-display text-sm font-bold tabular-nums text-emerald-400">
                    €{l.spent}M
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full ${l.color} shadow-[0_0_12px_rgba(52,211,153,0.25)] transition-[width] duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Card 2 — Dominant Agencies */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400/90">
              {t('market.representation')}
            </p>
            <h3 className="mt-0.5 font-display text-sm font-semibold text-white">
              {t('market.agencies')}
            </h3>
          </div>
          <span className="text-[10px] tabular-nums text-zinc-600">{t('market.valueMoved')}</span>
        </div>
        <ol className="mt-3 space-y-2">
          {DOMINANT_AGENCIES.map((a) => (
            <li
              key={a.name}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/10"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 font-display text-xs font-bold tabular-nums text-zinc-300 ring-1 ring-white/10">
                {a.rank}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{a.name}</span>
                <span className="text-[11px] text-zinc-500">
                  {a.deals} deals · <span className="text-zinc-400">{a.tag}</span>
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-display text-sm font-bold tabular-nums text-sky-300">
                  €{a.volume}M
                </span>
                <span className="text-[10px] text-zinc-600">volume</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function LiveMatchSync({ setView }) {
  const { t } = useI18n()
  const rows = MATCHES.filter((m) => m.status === 'live' || m.status === 'ft').slice(0, 5)

  return (
    <section className="mt-5">
      <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-400/90">
            {t('market.liveSync')}
          </p>
          <h3 className="mt-0.5 font-display text-sm font-semibold text-white">
            {t('market.scoresOpen')}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
          <span className="size-1.5 rounded-full bg-red-500 animate-value-pulse" aria-hidden="true" />
          {MATCHES.filter((m) => m.status === 'live').length} {t('market.live')}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => {
          const played = m.status !== 'upcoming'
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/40 px-3 py-2.5 transition-colors hover:border-red-400/20 hover:bg-red-500/[0.03]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {m.league}
                  {m.status === 'live' && (
                    <span className="ml-1.5 text-red-400">· {m.clock}</span>
                  )}
                  {m.status === 'ft' && <span className="ml-1.5 text-zinc-600">· FT</span>}
                </p>
                <p className="mt-0.5 truncate text-xs font-medium text-zinc-200">
                  {m.home} <span className="text-zinc-600">vs</span> {m.away}
                </p>
              </div>
              {played ? (
                <ScoreBadge
                  matchId={m.id}
                  homeScore={m.hs}
                  awayScore={m.as}
                  setView={setView}
                  size="md"
                />
              ) : (
                <span className="text-xs tabular-nums text-sky-300">{m.kickoff}</span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/**
 * MarketHub — multi-dimensional global transfer trading floor.
 */
export default function MarketHubPage({ setView }) {
  const { t } = useI18n()
  const [filters, setFilters] = useState(defaultFilters)
  const [moverTab, setMoverTab] = useState('risers')

  const patch = (partial) => setFilters((f) => ({ ...f, ...partial }))

  const reset = () => {
    setFilters(defaultFilters())
    setMoverTab('risers')
  }

  const typeLabels = {
    all: t('market.all'),
    permanent: t('market.permanent'),
    loan: t('market.loan'),
    free: t('market.freeTransfers'),
  }

  const togglePos = (id) => {
    setFilters((f) => {
      const on = f.posGroups.includes(id)
      return {
        ...f,
        posGroups: on ? f.posGroups.filter((x) => x !== id) : [...f.posGroups, id],
      }
    })
  }

  const activeCount =
    (filters.query.trim() ? 1 : 0) +
    (filters.league !== 'All leagues' ? 1 : 0) +
    (filters.posGroups.length ? 1 : 0) +
    (filters.transferType !== 'all' ? 1 : 0)

  const filterCtx = useMemo(() => {
    const q = fold(filters.query.trim())
    return {
      query: q,
      league: filters.league,
      posGroups: filters.posGroups,
      transferType: filters.transferType,
      foldHay: fold,
    }
  }, [filters])

  const ledger = useMemo(
    () => TRANSFER_LEDGER.filter((r) => matchesMarketFilters(r, filterCtx)),
    [filterCtx],
  )

  const rumors = useMemo(() => {
    if (filters.transferType === 'loan' || filters.transferType === 'free') return []
    const ctx = { ...filterCtx, transferType: 'all' }
    return RUMOR_MILL.filter((r) => matchesMarketFilters({ ...r, type: 'permanent' }, ctx))
  }, [filterCtx, filters.transferType])

  const movers = useMemo(() => {
    const base = moverTab === 'risers' ? VALUE_RISERS : VALUE_DROPPERS
    const ctx = { ...filterCtx, transferType: 'all' }
    return base.filter((r) => matchesMarketFilters(r, ctx))
  }, [filterCtx, moverTab])

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-4 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {t('market.globalFloor')}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t('market.marketTitle') === 'market.marketTitle' ? t('hubs.marketTitle') : t('hubs.marketTitle')}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">{t('hubs.marketSub')}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-sky-400/30 hover:text-sky-300"
          >
            {t('market.resetFilters')}
            {activeCount > 0 && (
              <span className="ml-1.5 rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-sky-300">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced trading filter dock */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/40 p-3.5">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <input
              value={filters.query}
              onChange={(e) => patch({ query: e.target.value })}
              placeholder={t('market.searchPlaceholder')}
              className="w-full rounded-lg border border-white/10 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/30 focus:outline-none lg:max-w-[16rem]"
            />

            <select
              value={filters.league}
              onChange={(e) => patch({ league: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-400/30 focus:outline-none lg:max-w-[13rem]"
            >
              {MARKET_LEAGUES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                {t('market.pos')}
              </span>
              {POS_GROUPS.map((g) => {
                const on = filters.posGroups.includes(g.id)
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => togglePos(g.id)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
                      on
                        ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-white/[0.03] text-zinc-400 ring-1 ring-white/5 hover:text-zinc-200'
                    }`}
                  >
                    {g.label}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 lg:ml-auto">
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                {t('market.transferType')}
              </span>
              {TRANSFER_TYPES.map((tt) => (
                <button
                  key={tt.id}
                  type="button"
                  onClick={() => patch({ transferType: tt.id })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filters.transferType === tt.id
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'bg-white/[0.04] text-zinc-400 ring-1 ring-white/10 hover:text-zinc-200'
                  }`}
                >
                  {typeLabels[tt.id] || tt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market analytics — between filters and columns */}
      <MarketAnalyticsStrip />

      {/* 3-column trading floor */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Column 1 — Live Transfer Ledger */}
        <ColumnShell
          title={t('market.ledger')}
          subtitle={t('market.confirmed')}
          count={`${ledger.length} ${t('market.dealsCount')}`}
          accent="emerald"
        >
          {ledger.length === 0 && <EmptyCol label={t('market.noDeals')} />}
          <ul className="divide-y divide-white/5">
            {ledger.map((t) => {
              const canPlayer = Boolean(t.playerId)
              return (
                <li key={t.id}>
                  <div
                    className="flex cursor-default items-center gap-3 px-3.5 py-3 transition-colors hover:bg-emerald-400/[0.04]"
                    onClick={() => canPlayer && setView('player', t.playerId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canPlayer) setView('player', t.playerId)
                    }}
                    role={canPlayer ? 'link' : undefined}
                    tabIndex={canPlayer ? 0 : undefined}
                  >
                    <Avatar name={t.name} size="md" />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-semibold text-white ${
                          canPlayer ? 'hover:text-emerald-300' : ''
                        }`}
                      >
                        {t.name}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-400">
                        <PosBadge pos={t.pos} />
                        {t.type === 'loan' && (
                          <span className="text-[10px] font-semibold text-sky-400">Loan</span>
                        )}
                        {t.type === 'free' && (
                          <span className="text-[10px] font-semibold text-amber-300">Free</span>
                        )}
                        <span className="truncate text-zinc-600">
                          {t.from} ➔ {t.to}
                        </span>
                      </span>
                    </span>

                    <ClubHop
                      fromCode={t.fromCode}
                      toCode={t.toCode}
                      fromClubId={t.fromClubId}
                      toClubId={t.toClubId}
                      setView={setView}
                    />

                    <span
                      className={`w-16 shrink-0 text-right font-display text-sm font-bold tabular-nums ${
                        t.fee > 0 ? 'text-emerald-400' : 'text-zinc-400'
                      }`}
                      title={`${t.from} → ${t.to}`}
                    >
                      {t.feeDisplay}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </ColumnShell>

        {/* Column 2 — Algorithmic Rumor Mill */}
        <ColumnShell
          title={t('market.rumorMill')}
          subtitle={t('market.activeIntel')}
          count={`${rumors.length} ${t('market.signals')}`}
          accent="cyan"
          headerExtra={
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{t('market.tierLegend')}</p>
          }
        >
          {rumors.length === 0 && <EmptyCol label={t('market.noRumors')} />}
          <ul className="divide-y divide-white/5">
            {rumors.map((r) => {
              const canPlayer = Boolean(r.playerId)
              return (
                <li key={r.id}>
                  <div
                    className="px-3.5 py-3 transition-colors hover:bg-cyan-400/[0.04]"
                    onClick={() => canPlayer && setView('player', r.playerId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canPlayer) setView('player', r.playerId)
                    }}
                    role={canPlayer ? 'link' : undefined}
                    tabIndex={canPlayer ? 0 : undefined}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={r.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`truncate text-sm font-semibold text-white ${
                              canPlayer ? 'hover:text-cyan-300' : ''
                            }`}
                          >
                            {r.name}
                          </span>
                          <PosBadge pos={r.pos} />
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                          <ClubHop
                            fromCode={r.fromCode}
                            toCode={r.toCode}
                            fromClubId={r.fromClubId}
                            toClubId={r.toClubId}
                            setView={setView}
                          />
                          <span className="truncate text-zinc-500">
                            {r.fromCode} ➔ {r.toCode}
                          </span>
                        </span>
                      </span>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="font-display text-sm font-bold tabular-nums text-zinc-100">
                          {r.probability}%
                        </span>
                        <TierBadge tier={r.tier} />
                      </div>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${probBarColor(r.probability)}`}
                        style={{ width: `${Math.min(100, r.probability)}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                      <span className="truncate">{r.source}</span>
                      {r.fee != null && (
                        <span className="tabular-nums text-zinc-400">ask {euros(r.fee)}</span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </ColumnShell>

        {/* Column 3 — Market Value Movers */}
        <ColumnShell
          title={t('market.movers')}
          subtitle={t('market.analytics')}
          count={`${movers.length}`}
          accent={moverTab === 'risers' ? 'emerald' : 'rose'}
          headerExtra={
            <div className="mt-2.5 flex gap-1.5">
              <button
                type="button"
                onClick={() => setMoverTab('risers')}
                className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  moverTab === 'risers'
                    ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30'
                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                }`}
              >
                {t('market.risers')}
              </button>
              <button
                type="button"
                onClick={() => setMoverTab('droppers')}
                className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  moverTab === 'droppers'
                    ? 'bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/30'
                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                }`}
              >
                {t('market.droppers')}
              </button>
            </div>
          }
        >
          {movers.length === 0 && <EmptyCol label={t('market.noMovers')} />}
          <ul className="divide-y divide-white/5">
            {movers.map((m) => {
              const canPlayer = Boolean(m.playerId)
              const up = m.direction === 'up'
              return (
                <li key={m.id}>
                  <div
                    className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-white/[0.03]"
                    onClick={() => canPlayer && setView('player', m.playerId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canPlayer) setView('player', m.playerId)
                    }}
                    role={canPlayer ? 'link' : undefined}
                    tabIndex={canPlayer ? 0 : undefined}
                  >
                    <Avatar name={m.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-semibold text-white ${
                          canPlayer ? 'hover:text-sky-300' : ''
                        }`}
                      >
                        {m.name}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                        <span
                          role={m.clubId ? 'link' : undefined}
                          tabIndex={m.clubId ? 0 : undefined}
                          onClick={(e) => {
                            if (!m.clubId) return
                            e.stopPropagation()
                            setView('club', m.clubId)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && m.clubId) {
                              e.stopPropagation()
                              setView('club', m.clubId)
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 ${
                            m.clubId ? 'cursor-pointer hover:text-sky-300' : ''
                          }`}
                        >
                          <Crest code={m.clubCode} size="sm" />
                          <span className="max-w-[7rem] truncate">{m.club}</span>
                        </span>
                        <PosBadge pos={m.pos} />
                      </span>
                      <span className="mt-1 block text-xs tabular-nums text-zinc-500">
                        {formatPath(m.oldValue, m.value)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-display text-sm font-bold tabular-nums text-zinc-100">
                        {euros(m.value)}
                      </span>
                      <span
                        className={`font-display text-xs font-bold tabular-nums ${
                          up ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {up ? '+' : ''}
                        {m.deltaPct.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </ColumnShell>
      </div>

      {/* Live match sync with ScoreBadge → setView('match') */}
      <LiveMatchSync setView={setView} />
    </main>
  )
}
