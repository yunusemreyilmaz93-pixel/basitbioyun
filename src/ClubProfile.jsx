import { useEffect, useMemo, useState } from 'react'
import { Avatar, Crest, Card, CardLabel, euros, eurosLong, ScoreBadge } from './ui.jsx'
import { LEAGUE_CODE_TO_ID, LEAGUE_NAME_TO_ID } from './leagueData.js'
import { CLUB_BY_SHORT } from './clubData.js'
import { matchesForClub } from './matchData.js'
import { useI18n } from './i18n/I18nProvider.jsx'

/* ================================================================== */
/*  Shared bits                                                        */
/* ================================================================== */

function formatBn(m) {
  if (m >= 1000) return `€${(m / 1000).toFixed(2)}bn`
  return eurosLong(m)
}

function FeeLabel({ fee, type }) {
  const { t } = useI18n()
  if (type === 'Loan') {
    return (
      <span className="rounded-full bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold text-sky-300 ring-1 ring-sky-400/20">
        {t('common.loan')}
      </span>
    )
  }
  if (fee === 0 || type === 'Free') {
    return (
      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
        {t('common.free')}
      </span>
    )
  }
  if (fee == null) {
    return <span className="text-xs text-zinc-500">{t('common.unknown')}</span>
  }
  return (
    <span className="font-display text-xs font-semibold tabular-nums text-emerald-400">
      {euros(fee)}
    </span>
  )
}

function FormDots({ form }) {
  const color = { W: 'bg-emerald-400', D: 'bg-zinc-500', L: 'bg-red-400' }
  return (
    <span className="inline-flex items-center gap-px" aria-label={`Form ${form.join(' ')}`}>
      {form.map((f, i) => (
        <span
          key={i}
          title={f}
          className={`size-1.5 shrink-0 rounded-full ${color[f] || 'bg-zinc-600'}`}
        />
      ))}
    </span>
  )
}

function GiantCrest({ code }) {
  let h = 0
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 360
  return (
    <div
      className="flex size-24 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold tracking-tight text-white/90 ring-1 ring-white/15 sm:size-28 sm:text-3xl"
      style={{
        background: `linear-gradient(145deg, hsl(${h} 42% 34%), hsl(${(h + 28) % 360} 48% 16%))`,
      }}
      aria-hidden="true"
    >
      {code}
    </div>
  )
}

/* ================================================================== */
/*  1 — Club Header                                                    */
/* ================================================================== */

function StatPill({ label, children }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-zinc-100">{children}</p>
    </div>
  )
}

function resolveLeagueId(club) {
  return (
    club.leagueId ||
    LEAGUE_CODE_TO_ID[club.leagueCode] ||
    LEAGUE_NAME_TO_ID[club.league] ||
    null
  )
}

function LeagueLink({ club, setView, className = '' }) {
  const leagueId = resolveLeagueId(club)
  if (!leagueId || !setView) {
    return <span className={className}>{club.league}</span>
  }
  return (
    <button
      type="button"
      onClick={() => setView('league', leagueId)}
      className={`transition-colors hover:text-sky-300 ${className}`}
    >
      {club.league}
    </button>
  )
}

function ClubHeader({ club, setView }) {
  const { t } = useI18n()
  const leagueId = resolveLeagueId(club)
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 p-5 backdrop-blur-md sm:p-7">
      <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-emerald-400/[0.06] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 bottom-0 size-56 rounded-full bg-sky-400/[0.05] blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-5">
          <GiantCrest code={club.short} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!leagueId}
                onClick={() => leagueId && setView?.('league', leagueId)}
                className={`rounded-sm bg-white/10 px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wide text-zinc-200 ${
                  leagueId ? 'transition-colors hover:bg-sky-500/15 hover:text-sky-300' : ''
                }`}
              >
                {club.leagueCode}
              </button>
              <LeagueLink club={club} setView={setView} className="text-xs text-zinc-400" />
              <span className="text-zinc-700">·</span>
              <span className="text-xs text-zinc-500">
                {t('common.est')} {club.founded}
              </span>
            </div>
            <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {club.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {club.stadium.city}, {club.country}
            </p>

            <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400/80">
                  {t('club.squadValue')}
                </p>
                <p className="mt-0.5 font-display text-3xl font-bold tabular-nums tracking-tight text-emerald-400 sm:text-4xl">
                  {formatBn(club.squadValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[320px] lg:grid-cols-2">
          <StatPill label={t('club.squadSize')}>{club.squadSize}</StatPill>
          <StatPill label={t('club.averageAge')}>{club.avgAge.toFixed(1)}</StatPill>
          <StatPill label={t('club.foreigners')}>{club.foreignersPct}%</StatPill>
          <StatPill label={t('club.stadium')}>{club.stadium.name}</StatPill>
          <StatPill label={t('club.capacity')}>{club.stadium.capacity.toLocaleString('en-US')}</StatPill>
          <StatPill label={t('club.pitch')}>{club.stadium.pitch}</StatPill>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  2 — Squad Directory (collapsible position groups)                  */
/* ================================================================== */

const SQUAD_GROUPS = [
  { key: 'GK', label: 'Goalkeepers' },
  { key: 'DEF', label: 'Defenders' },
  { key: 'MID', label: 'Midfielders' },
  { key: 'FWD', label: 'Forwards' },
]

function SquadGroup({ groupKey, label, players, open, onToggle, onOpenPlayer }) {
  const { t } = useI18n()
  const total = players.reduce((a, p) => a + p.value, 0)

  return (
    <div className="overflow-hidden rounded-xl border border-white/5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <svg
            viewBox="0 0 12 12"
            className={`size-3 text-zinc-500 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4 2l5 4-5 4V2z" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{label}</span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-500">
            {players.length}
          </span>
        </span>
        <span className="font-display text-xs font-semibold tabular-nums text-emerald-400">
          {euros(total)}
        </span>
      </button>

      {open && (
        <div className="w-full">
          <table className="data-table w-full table-fixed">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[34%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="border-t border-white/5 text-[9px] uppercase tracking-wide text-zinc-500">
                <th className="px-1 py-1.5 text-left font-medium">{t('common.rank')}</th>
                <th className="px-1 py-1.5 text-left font-medium">{t('hubs.tablePlayer')}</th>
                <th className="px-1 py-1.5 text-right font-medium">{t('common.age')}</th>
                <th className="px-1 py-1.5 text-left font-medium">{t('common.nation')}</th>
                <th className="px-1 py-1.5 text-left font-medium">{t('hubs.tableCtr')}</th>
                <th className="px-1 py-1.5 text-right font-medium">{t('common.smv')}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((pl) => {
                const clickable = Boolean(pl.playerId)
                const RowTag = clickable ? 'button' : 'div'
                return (
                  <tr
                    key={`${groupKey}-${pl.shirt}-${pl.name}`}
                    className="odd:bg-zinc-900/30 border-t border-white/5 transition-colors hover:bg-emerald-400/[0.04]"
                  >
                    <td className="px-1 py-1.5 font-mono text-[11px] font-semibold tabular-nums text-zinc-500">
                      {pl.shirt}
                    </td>
                    <td className="min-w-0 px-1 py-1.5">
                      <RowTag
                        type={clickable ? 'button' : undefined}
                        onClick={clickable ? () => onOpenPlayer(pl.playerId) : undefined}
                        className={`flex w-full min-w-0 items-center gap-1.5 text-left ${clickable ? 'group cursor-pointer' : ''}`}
                      >
                        <Avatar name={pl.name} size="xs" />
                        <span
                          className={`truncate text-[11px] font-medium text-zinc-100 ${clickable ? 'transition-colors group-hover:text-emerald-300' : ''}`}
                        >
                          {pl.name}
                        </span>
                      </RowTag>
                    </td>
                    <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">{pl.age}</td>
                    <td className="px-1 py-1.5">
                      <span className="rounded-sm bg-white/10 px-1 py-px font-mono text-[9px] font-bold text-zinc-300">
                        {pl.nation}
                      </span>
                    </td>
                    <td className="truncate px-1 py-1.5 font-mono text-[10px] tabular-nums text-zinc-400">{pl.contract}</td>
                    <td className="px-1 py-1.5 text-right font-mono text-[12px] font-semibold tabular-nums text-emerald-400">
                      {euros(pl.value)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SquadDirectory({ club, onOpenPlayer }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(() => new Set(SQUAD_GROUPS.map((g) => g.key)))

  useEffect(() => {
    setOpen(new Set(SQUAD_GROUPS.map((g) => g.key)))
  }, [club.id])

  const toggle = (key) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <CardLabel>{t('club.squadDirectory')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">
            {club.squadSize} {t('club.players')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(new Set(SQUAD_GROUPS.map((g) => g.key)))}
            className="rounded-lg px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            {t('common.open')}
          </button>
          <button
            type="button"
            onClick={() => setOpen(new Set())}
            className="rounded-lg px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {SQUAD_GROUPS.map((g) => (
          <SquadGroup
            key={g.key}
            groupKey={g.key}
            label={g.label}
            players={club.squad[g.key] || []}
            open={open.has(g.key)}
            onToggle={() => toggle(g.key)}
            onOpenPlayer={onOpenPlayer}
          />
        ))}
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  3 — Sidebar: Manager + Standings                                   */
/* ================================================================== */

function ManagerWidget({ manager, setView }) {
  const { t } = useI18n()
  return (
    <Card className="p-5">
      <CardLabel>{t('club.currentManager')}</CardLabel>
      <div className="mt-4 flex gap-3">
        <Avatar name={manager.name} size="md" ring />
        <div className="min-w-0">
          {manager.managerId ? (
            <button
              type="button"
              onClick={() => setView?.('manager', manager.managerId)}
              className="font-display text-base font-semibold text-white transition-colors hover:text-sky-300"
            >
              {manager.name}
            </button>
          ) : (
            <p className="font-display text-base font-semibold text-white">{manager.name}</p>
          )}
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="rounded-sm bg-white/10 px-1 py-0.5 font-display text-[10px] font-bold text-zinc-300">
              {manager.nation}
            </span>
            {t('nation.headCoach')}
          </p>
        </div>
      </div>
      <dl className="mt-4 space-y-2.5 border-t border-white/5 pt-4 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-xs text-zinc-500">{t('club.preferredFormation')}</dt>
          <dd className="font-display font-semibold tabular-nums text-emerald-400">{manager.formation}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-xs text-zinc-500">{t('club.contractUntil')}</dt>
          <dd className="tabular-nums text-zinc-200">
            {t('common.june')} {manager.contractUntil}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-xs text-zinc-500">{t('club.careerWin')}</dt>
          <dd className="font-display font-semibold tabular-nums text-zinc-100">{manager.winPct.toFixed(1)}%</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-xs text-zinc-500">{t('club.matchesManaged')}</dt>
          <dd className="tabular-nums text-zinc-400">{manager.matches}</dd>
        </div>
      </dl>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
          style={{ width: `${Math.min(100, manager.winPct)}%` }}
        />
      </div>
    </Card>
  )
}

function StandingsWidget({ club, setView }) {
  const { t } = useI18n()
  const rows = club.standings
  const leagueId = resolveLeagueId(club)
  const openLeague = () => {
    if (leagueId && setView) setView('league', leagueId)
  }
  const canOpenLeague = Boolean(leagueId && setView)

  return (
    <Card className="overflow-hidden p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <CardLabel>{t('club.leagueStandings')}</CardLabel>
          {canOpenLeague ? (
            <button
              type="button"
              onClick={openLeague}
              className="mt-0.5 block truncate text-left text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300"
              title={t('club.viewLeague')}
            >
              {club.league}
            </button>
          ) : (
            <p className="mt-0.5 truncate text-xs font-medium text-zinc-500">{club.league}</p>
          )}
        </div>
        {canOpenLeague && (
          <button
            type="button"
            onClick={openLeague}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-400/25 bg-sky-500/10 px-2 py-1.5 text-[11px] font-semibold text-sky-300 transition-colors hover:border-sky-400/40 hover:bg-sky-500/15 hover:text-sky-200"
            title={t('club.viewLeague')}
          >
            {t('club.openFullTable')}
            <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-2 w-full">
        <table className="data-table w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[28%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="text-[9px] uppercase tracking-wide text-zinc-500">
              <th className="px-0.5 py-1 text-left font-medium" title={t('standings.tipRank')}>
                {t('standings.rank')}
              </th>
              <th className="px-0.5 py-1 text-left font-medium">{t('standings.club')}</th>
              <th className="px-0.5 py-1 text-right font-medium" title={t('standings.tipPlayed')}>
                {t('standings.o')}
              </th>
              <th className="px-0.5 py-1 text-right font-medium" title={t('standings.tipWon')}>
                {t('standings.g')}
              </th>
              <th className="px-0.5 py-1 text-right font-medium" title={t('standings.tipDrawn')}>
                {t('standings.b')}
              </th>
              <th className="px-0.5 py-1 text-right font-medium" title={t('standings.tipLost')}>
                {t('standings.m')}
              </th>
              <th className="px-0.5 py-1 text-right font-medium" title={t('standings.tipGfGa')}>
                {t('standings.agyg')}
              </th>
              <th className="px-0.5 py-1 text-right font-medium" title={t('standings.tipGd')}>
                {t('standings.av')}
              </th>
              <th className="px-0.5 py-1 text-right font-medium" title={t('standings.tipPts')}>
                {t('standings.p')}
              </th>
              <th className="px-0.5 py-1 text-right font-medium">{t('standings.form')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const clubId = CLUB_BY_SHORT[r.code] || null
              const clubClickable = Boolean(clubId && setView)
              return (
                <tr
                  key={r.code}
                  className={`border-t border-white/5 ${
                    r.highlight
                      ? 'bg-emerald-400/[0.07] font-medium'
                      : 'odd:bg-zinc-900/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <td className="px-0.5 py-1 font-mono tabular-nums text-zinc-500">{r.pos}</td>
                  <td className="min-w-0 px-0.5 py-1">
                    {clubClickable ? (
                      <button
                        type="button"
                        onClick={() => setView('club', clubId)}
                        className="flex w-full min-w-0 items-center gap-0.5 text-left"
                      >
                        <Crest code={r.code} size="xs" />
                        <span
                          className={`truncate ${
                            r.highlight ? 'text-emerald-300' : 'text-zinc-200 hover:text-sky-300'
                          }`}
                        >
                          {r.club}
                        </span>
                      </button>
                    ) : (
                      <span className="flex min-w-0 items-center gap-0.5">
                        <Crest code={r.code} size="xs" />
                        <span className={`truncate ${r.highlight ? 'text-emerald-300' : 'text-zinc-200'}`}>
                          {r.club}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="px-0.5 py-1 text-right font-mono tabular-nums text-zinc-400">{r.pld}</td>
                  <td className="px-0.5 py-1 text-right font-mono tabular-nums text-zinc-300">{r.w}</td>
                  <td className="px-0.5 py-1 text-right font-mono tabular-nums text-zinc-400">{r.d}</td>
                  <td className="px-0.5 py-1 text-right font-mono tabular-nums text-zinc-400">{r.l}</td>
                  <td className="px-0.5 py-1 text-right font-mono tabular-nums text-zinc-400">
                    {r.gf}:{r.ga}
                  </td>
                  <td
                    className={`px-0.5 py-1 text-right font-mono tabular-nums ${
                      r.gd > 0 ? 'text-emerald-400' : r.gd < 0 ? 'text-red-400' : 'text-zinc-500'
                    }`}
                  >
                    {r.gd > 0 ? `+${r.gd}` : r.gd}
                  </td>
                  <td className="px-0.5 py-1 text-right font-mono text-[11px] font-bold tabular-nums text-zinc-100">
                    {r.pts}
                  </td>
                  <td className="px-0.5 py-1 text-right">
                    <FormDots form={r.form} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {canOpenLeague && (
        <button
          type="button"
          onClick={openLeague}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-sky-400/30 hover:bg-sky-500/10 hover:text-sky-300"
        >
          {t('club.openFullTable')}
          <span className="text-sky-400">→</span>
          <span className="truncate font-medium text-zinc-200">{club.league}</span>
        </button>
      )}
    </Card>
  )
}

/* ================================================================== */
/*  4 — Tactics board + Transfer ledger                                */
/* ================================================================== */

function TacticsBoard({ club, onOpenPlayer }) {
  const { t } = useI18n()
  const xi = club.startingXI
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div>
          <CardLabel>{t('club.tacticsBoard')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">
            {t('club.typicalXi')} · {club.formation}
          </p>
        </div>
        <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 font-display text-xs font-semibold tabular-nums text-emerald-300">
          {club.formation}
        </span>
      </div>
      <div className="relative min-h-[320px] flex-1 w-full bg-gradient-to-b from-[#0d3323] to-[#0a2419] p-3 sm:min-h-[380px] sm:p-4">
        {/* pitch markings */}
        <div className="pointer-events-none absolute inset-3 rounded-lg border border-white/15 sm:inset-4" aria-hidden="true">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
          <div className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 sm:size-20" />
          <div className="absolute left-1/2 top-0 h-12 w-[42%] -translate-x-1/2 border border-t-0 border-white/15 sm:h-14" />
          <div className="absolute bottom-0 left-1/2 h-12 w-[42%] -translate-x-1/2 border border-b-0 border-white/15 sm:h-14" />
        </div>

        {xi.map((pl) => {
          const clickable = Boolean(pl.playerId)
          const Tag = clickable ? 'button' : 'div'
          return (
            <Tag
              key={`${pl.shirt}-${pl.name}`}
              type={clickable ? 'button' : undefined}
              onClick={clickable ? () => onOpenPlayer(pl.playerId) : undefined}
              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${
                clickable ? 'cursor-pointer' : ''
              }`}
              style={{ left: `${pl.x}%`, top: `${(pl.y / 140) * 100}%` }}
              title={`${pl.name} · ${pl.pos}`}
            >
              <span className="group flex flex-col items-center gap-0.5">
                <span className="flex size-8 items-center justify-center rounded-full border border-emerald-400/40 bg-zinc-950/90 font-display text-[11px] font-bold text-emerald-300 shadow-lg shadow-black/40 ring-2 ring-emerald-400/20 transition-transform group-hover:scale-110 sm:size-9 sm:text-xs">
                  {pl.shirt}
                </span>
                <span className="max-w-[4.5rem] truncate rounded bg-zinc-950/80 px-1 py-0.5 text-center text-[9px] font-medium text-zinc-200 ring-1 ring-white/10 sm:text-[10px]">
                  {pl.name}
                </span>
              </span>
            </Tag>
          )
        })}
      </div>
    </Card>
  )
}

function RecentMatches({ club, setView }) {
  const { t } = useI18n()
  const rows = useMemo(() => matchesForClub(club), [club])
  if (!rows.length) return null

  return (
    <Card className="p-4 sm:p-5">
      <CardLabel>{t('club.recentResults')}</CardLabel>
      <p className="mt-0.5 text-xs text-zinc-400">{t('club.clickScore')}</p>
      <ul className="mt-3 divide-y divide-white/5">
        {rows.map((m) => {
          const played = m.status !== 'upcoming'
          const scoreLabel =
            played && m.home.score != null && m.away.score != null
              ? `${m.home.score}–${m.away.score}`
              : null
          return (
            <li key={m.id}>
              <div
                className="flex items-center gap-2 py-2 text-xs transition-colors hover:bg-white/[0.03]"
                role="button"
                tabIndex={0}
                onClick={() => setView?.('match', m.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setView?.('match', m.id)
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-zinc-100">
                    {m.home.short} <span className="text-zinc-600">{t('common.vs')}</span> {m.away.short}
                  </p>
                  <p className="truncate text-[10px] text-zinc-500">{m.league}</p>
                </div>
                {played && scoreLabel ? (
                  <ScoreBadge matchId={m.id} score={scoreLabel} setView={setView} size="sm" />
                ) : (
                  <span className="rounded-md bg-sky-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">
                    {m.kickoff || t('common.upcoming')}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function TransferLedger({ transfers, className = '' }) {
  const { t } = useI18n()
  return (
    <Card className={`flex h-full flex-col p-4 sm:p-5 ${className}`}>
      <div>
        <CardLabel>{t('club.transferLedger')}</CardLabel>
        <p className="mt-0.5 text-xs text-zinc-400">{t('club.currentWindow')}</p>
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">{t('club.arrivals')}</p>
            <span className="text-[10px] tabular-nums text-zinc-500">{transfers.arrivals.length}</span>
          </div>
          <ul className="space-y-1">
            {transfers.arrivals.map((row) => (
              <li
                key={`in-${row.name}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-emerald-400/[0.03] px-2.5 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-100">{row.name}</p>
                  <p className="truncate text-[10px] text-zinc-500">
                    {t('club.from')} {row.from}
                  </p>
                </div>
                <FeeLabel fee={row.fee} type={row.type} />
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-red-400" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-400">{t('club.departures')}</p>
            <span className="text-[10px] tabular-nums text-zinc-500">{transfers.departures.length}</span>
          </div>
          <ul className="space-y-1">
            {transfers.departures.map((row) => (
              <li
                key={`out-${row.name}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-red-400/[0.03] px-2.5 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-100">{row.name}</p>
                  <p className="truncate text-[10px] text-zinc-500">
                    {t('club.to')} {row.to}
                  </p>
                </div>
                <FeeLabel fee={row.fee} type={row.type} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function ClubProfile({ club, onBack, onOpenPlayer, setView }) {
  const { t } = useI18n()
  if (!club) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-zinc-400">{t('common.screenNotFound')}</p>
      </main>
    )
  }
  const transfers = club.transfers || { arrivals: [], departures: [] }
  const stadium = club.stadium || { name: '—', capacity: 0, city: '—', pitch: '—' }
  const netSpend = useMemo(() => {
    const inFee = (transfers.arrivals || []).reduce((a, row) => a + (row.fee || 0), 0)
    const outFee = (transfers.departures || []).reduce((a, row) => a + (row.fee || 0), 0)
    return inFee - outFee
  }, [transfers])

  const openPlayer = (id) => (setView ? setView('player', id) : onOpenPlayer?.(id))
  // soft-patch missing nested shapes for warehouse clubs
  const safeClub = {
    ...club,
    transfers,
    stadium,
    squad: club.squad || [],
    standings: club.standings || [],
    lastResults: club.lastResults || [],
    nextFixtures: club.nextFixtures || [],
    manager: club.manager || { name: '—', managerId: null },
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <svg
          viewBox="0 0 20 20"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 4l-6 6 6 6" />
        </svg>
        {t('common.backMarket')}
      </button>

      <ClubHeader club={safeClub} setView={setView} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main: squad directory */}
        <div className="min-w-0 lg:col-span-8">
          <SquadDirectory club={safeClub} onOpenPlayer={openPlayer} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:col-span-4">
          <ManagerWidget manager={safeClub.manager} setView={setView} />
          <RecentMatches club={safeClub} setView={setView} />
          <StandingsWidget club={safeClub} setView={setView} />
        </aside>
      </div>

      {/* Bottom: tactics + transfers — equal-height symmetrical pair */}
      <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <TacticsBoard club={safeClub} onOpenPlayer={openPlayer} />
        <div className="flex h-full min-h-0 flex-col">
          <TransferLedger transfers={safeClub.transfers} className="flex-1" />
          <p className="mt-2 text-right text-xs text-zinc-500">
            {t('club.arrivals')} − {t('club.departures')}{' '}
            <span
              className={`font-display font-semibold tabular-nums ${
                netSpend > 0 ? 'text-red-400' : netSpend < 0 ? 'text-emerald-400' : 'text-zinc-300'
              }`}
            >
              {netSpend > 0 ? '+' : netSpend < 0 ? '−' : ''}
              {euros(Math.abs(netSpend))}
            </span>
          </p>
        </div>
      </div>
    </main>
  )
}
