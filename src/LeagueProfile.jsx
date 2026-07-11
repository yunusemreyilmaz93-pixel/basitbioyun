import { Fragment, useEffect, useMemo, useState } from 'react'
import { Avatar, Crest, Card, CardLabel, ScoreBadge } from './ui.jsx'
import { matchesForLeague } from './matchData.js'
import { translateZoneLabel, useI18n } from './i18n/I18nProvider.jsx'

/* ================================================================== */
/*  Shared                                                             */
/* ================================================================== */

function FormDots({ form }) {
  const color = { W: 'bg-emerald-400', D: 'bg-zinc-500', L: 'bg-red-400' }
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Form ${form.join(' ')}`}>
      {form.map((f, i) => (
        <span key={i} title={f} className={`size-1.5 rounded-full ${color[f] || 'bg-zinc-600'}`} />
      ))}
    </span>
  )
}

function LeagueLogo({ code }) {
  let h = 0
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 360
  return (
    <div
      className="flex size-24 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-bold tracking-tight text-white/90 ring-1 ring-white/15 sm:size-28 sm:text-2xl"
      style={{
        background: `linear-gradient(145deg, hsl(${h} 48% 36%), hsl(${(h + 40) % 360} 52% 14%))`,
      }}
      aria-hidden="true"
    >
      {code}
    </div>
  )
}

function FlagButton({ code, nationId, setView }) {
  return (
    <button
      type="button"
      onClick={() => nationId && setView('nation', nationId)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 transition-colors hover:border-sky-400/30 hover:bg-sky-500/10"
      title={code}
    >
      <span className="rounded-sm bg-white/10 px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wide text-zinc-200">
        {code}
      </span>
      <span className="text-[10px] font-medium text-sky-400">↗</span>
    </button>
  )
}

/* ================================================================== */
/*  1 — Hero                                                           */
/* ================================================================== */

function HeroStat({ label, children, accent = false }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-0.5 font-display text-sm font-semibold tabular-nums ${accent ? 'text-emerald-400' : 'text-zinc-100'}`}>
        {children}
      </p>
    </div>
  )
}

function LeagueHero({ league, setView }) {
  const { t } = useI18n()
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 p-5 backdrop-blur-md sm:p-7">
      <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-sky-400/[0.06] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 bottom-0 size-56 rounded-full bg-emerald-400/[0.05] blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-5">
          <LeagueLogo code={league.code} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <FlagButton code={league.nationCode} nationId={league.nationId} setView={setView} />
              <span className="text-xs text-zinc-400">{league.country}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-xs text-zinc-500">
                {t('common.est')} {league.founded}
              </span>
              {league.type === 'international' && (
                <span className="rounded-md bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300 ring-1 ring-sky-400/25">
                  {t('hubs.continentalOnly')}
                </span>
              )}
            </div>
            <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {league.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">{league.fullName}</p>

            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-300/80">
                {t('league.totalMarket')}
              </p>
              <p className="mt-0.5 font-display text-3xl font-bold tabular-nums tracking-tight text-emerald-400 sm:text-4xl">
                €{league.totalValue.toFixed(2)}
                <span className="text-xl text-zinc-500">bn</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[340px] lg:grid-cols-2">
          <HeroStat label={t('league.teams')}>{league.teams}</HeroStat>
          <HeroStat label={t('league.totalPlayers')}>{league.players}</HeroStat>
          <HeroStat label={t('league.foreigners')}>{league.foreignersPct}%</HeroStat>
          <HeroStat label={t('league.avgPlayerAge')}>{league.avgAge.toFixed(1)}</HeroStat>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  2 — Standings + All-time tabs                                      */
/* ================================================================== */

function zoneClass(pos, zones) {
  if (pos <= zones.ucl.max) return 'border-l-2 border-l-sky-400'
  if (zones.uel && pos >= zones.uel.min && pos <= zones.uel.max) return 'border-l-2 border-l-violet-400'
  if (zones.uecl && pos >= zones.uecl.min && pos <= zones.uecl.max) return 'border-l-2 border-l-cyan-500/70'
  if (pos >= zones.relegation.min) return 'border-l-2 border-l-red-500'
  return 'border-l-2 border-l-transparent'
}

function zoneDividerAfter(pos, zones) {
  if (pos === zones.ucl.max) return { raw: zones.ucl.label, color: 'text-sky-400' }
  if (zones.uel && pos === zones.uel.max) return { raw: zones.uel.label, color: 'text-violet-400' }
  if (zones.uecl && pos === zones.uecl.max) return { raw: zones.uecl.label, color: 'text-cyan-400' }
  if (pos === zones.relegation.min - 1) return { raw: zones.relegation.label, color: 'text-red-400' }
  return null
}

function StandingsTable({ league, setView }) {
  const { t } = useI18n()
  return (
    <div className="w-full">
      <table className="data-table w-full table-fixed">
        <colgroup>
          <col className="w-[5%]" />
          <col className="w-[26%]" />
          <col className="w-[6%]" />
          <col className="w-[6%]" />
          <col className="w-[6%]" />
          <col className="w-[6%]" />
          <col className="w-[12%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
          <col className="w-[17%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-white/5 text-[9px] uppercase tracking-wide text-zinc-500">
            <th className="px-1 py-2 text-left font-medium" title={t('standings.tipRank')}>
              {t('standings.rank')}
            </th>
            <th className="px-1 py-2 text-left font-medium">{t('standings.club')}</th>
            <th className="px-1 py-2 text-right font-medium" title={t('standings.tipPlayed')}>
              {t('standings.o')}
            </th>
            <th className="px-1 py-2 text-right font-medium" title={t('standings.tipWon')}>
              {t('standings.g')}
            </th>
            <th className="px-1 py-2 text-right font-medium" title={t('standings.tipDrawn')}>
              {t('standings.b')}
            </th>
            <th className="px-1 py-2 text-right font-medium" title={t('standings.tipLost')}>
              {t('standings.m')}
            </th>
            <th className="px-1 py-2 text-right font-medium" title={t('standings.tipGfGa')}>
              {t('standings.agyg')}
            </th>
            <th className="px-1 py-2 text-right font-medium" title={t('standings.tipGd')}>
              {t('standings.av')}
            </th>
            <th className="px-1 py-2 text-right font-medium" title={t('standings.tipPts')}>
              {t('standings.p')}
            </th>
            <th className="px-1 py-2 text-right font-medium">{t('standings.form')}</th>
          </tr>
        </thead>
        <tbody>
          {league.standings.map((r) => {
            const div = zoneDividerAfter(r.pos, league.zones)
            return (
              <Fragment key={r.code + r.pos}>
                <tr
                  className={`odd:bg-zinc-900/30 border-b border-white/5 transition-colors hover:bg-emerald-400/[0.04] ${zoneClass(r.pos, league.zones)}`}
                >
                  <td className="px-1 py-1.5 font-mono text-[11px] font-semibold tabular-nums text-zinc-500">
                    {r.pos}
                  </td>
                  <td className="min-w-0 px-1 py-1.5">
                    <button
                      type="button"
                      disabled={!r.clubId}
                      onClick={() => r.clubId && setView('club', r.clubId)}
                      className={`inline-flex w-full min-w-0 items-center gap-1 text-left ${
                        r.clubId ? 'group cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <Crest code={r.code} size="xs" />
                      <span
                        className={`truncate text-[11px] font-medium text-zinc-100 ${
                          r.clubId ? 'transition-colors group-hover:text-emerald-300' : ''
                        }`}
                      >
                        {r.club}
                      </span>
                    </button>
                  </td>
                  <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">{r.pld}</td>
                  <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-300">{r.w}</td>
                  <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">{r.d}</td>
                  <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">{r.l}</td>
                  <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">
                    {r.gf}:{r.ga}
                  </td>
                  <td
                    className={`px-1 py-1.5 text-right font-mono tabular-nums ${
                      r.gd > 0 ? 'text-emerald-400' : r.gd < 0 ? 'text-red-400' : 'text-zinc-500'
                    }`}
                  >
                    {r.gd > 0 ? `+${r.gd}` : r.gd}
                  </td>
                  <td className="px-1 py-1.5 text-right font-mono text-[12px] font-bold tabular-nums text-white">
                    {r.pts}
                  </td>
                  <td className="px-1 py-1.5 text-right">
                    <FormDots form={r.form} />
                  </td>
                </tr>
                {div && (
                  <tr className="border-b border-white/10">
                    <td colSpan={10} className="px-1 py-1">
                      <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${div.color}`}>
                        ▸ {translateZoneLabel(t, div.raw)}
                      </span>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AllTimeTable({ league, setView }) {
  const { t } = useI18n()
  return (
    <div className="w-full">
      <table className="data-table w-full table-fixed">
        <colgroup>
          <col className="w-[8%]" />
          <col className="w-[40%]" />
          <col className="w-[17%]" />
          <col className="w-[20%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-white/5 text-[9px] uppercase tracking-wide text-zinc-500">
            <th className="px-1 py-2 text-left font-medium">{t('standings.rank')}</th>
            <th className="px-1 py-2 text-left font-medium">{t('standings.club')}</th>
            <th className="px-1 py-2 text-right font-medium">{t('league.seasons')}</th>
            <th className="px-1 py-2 text-right font-medium">{t('standings.p')}</th>
            <th className="px-1 py-2 text-right font-medium">{t('league.titles')}</th>
          </tr>
        </thead>
        <tbody>
          {league.allTime.map((r, i) => (
            <tr
              key={r.code}
              className="odd:bg-zinc-900/30 border-b border-white/5 transition-colors hover:bg-sky-400/[0.04]"
            >
              <td className="px-1 py-1.5 font-mono text-[11px] font-semibold tabular-nums text-zinc-500">
                {i + 1}
              </td>
              <td className="min-w-0 px-1 py-1.5">
                <button
                  type="button"
                  disabled={!r.clubId}
                  onClick={() => r.clubId && setView('club', r.clubId)}
                  className={`inline-flex w-full min-w-0 items-center gap-1 text-left ${r.clubId ? 'group cursor-pointer' : ''}`}
                >
                  <Crest code={r.code} size="xs" />
                  <span
                    className={`truncate text-[11px] font-medium text-zinc-100 ${
                      r.clubId ? 'transition-colors group-hover:text-sky-300' : ''
                    }`}
                  >
                    {r.club}
                  </span>
                </button>
              </td>
              <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">{r.seasons}</td>
              <td className="px-1 py-1.5 text-right font-mono font-semibold tabular-nums text-sky-300">
                {r.points.toLocaleString('en-US')}
              </td>
              <td className="px-1 py-1.5 text-right font-mono font-semibold tabular-nums text-emerald-400">
                {r.titles}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StandingsPanel({ league, setView }) {
  const { t } = useI18n()
  const [tab, setTab] = useState('current')

  useEffect(() => {
    setTab('current')
  }, [league.id])

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <CardLabel>{t('league.standingsCenter')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">{t('league.standings')}</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-white/5 p-1">
          {[
            { id: 'current', label: t('league.current') },
            { id: 'alltime', label: t('league.allTime') },
          ].map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === tb.id
                  ? 'bg-zinc-800 text-white shadow-sm shadow-black/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zone legend */}
      {tab === 'current' && (
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-sky-400" /> {translateZoneLabel(t, league.zones.ucl.label)}
          </span>
          {league.zones.uel && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-0.5 bg-violet-400" /> {translateZoneLabel(t, league.zones.uel.label)}
            </span>
          )}
          {league.zones.uecl && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-0.5 bg-cyan-500" /> {translateZoneLabel(t, league.zones.uecl.label)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-red-500" /> {translateZoneLabel(t, league.zones.relegation.label)}
          </span>
        </div>
      )}

      <div className="mt-3">
        {tab === 'current' ? (
          <StandingsTable league={league} setView={setView} />
        ) : (
          <AllTimeTable league={league} setView={setView} />
        )}
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  4 — Statistical leaders                                            */
/* ================================================================== */

const LEADER_META = [
  { key: 'scorers', labelKey: 'player.goals', unit: 'G', accent: 'text-emerald-400' },
  { key: 'assists', labelKey: 'player.assists', unit: 'A', accent: 'text-sky-300' },
  { key: 'cleanSheets', labelKey: 'common.matches', unit: 'CS', accent: 'text-emerald-400' },
  { key: 'cards', labelKey: 'player.yellowCards', unit: 'YC', accent: 'text-amber-300' },
]

function LeaderBox({ title, unit, accent, rows, setView }) {
  return (
    <Card className="p-4">
      <CardLabel>{title}</CardLabel>
      <ul className="mt-3 space-y-1">
        {rows.map((r) => (
          <li key={`${title}-${r.rank}-${r.name}`}>
            <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/[0.03]">
              <span className="w-4 font-display text-[11px] font-bold tabular-nums text-zinc-600">
                {r.rank}
              </span>
              <Avatar name={r.name} size="sm" />
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  disabled={!r.playerId}
                  onClick={() => r.playerId && setView('player', r.playerId)}
                  className={`block truncate text-[13px] font-medium text-zinc-100 ${
                    r.playerId ? 'transition-colors hover:text-emerald-300' : ''
                  }`}
                >
                  {r.name}
                </button>
                <button
                  type="button"
                  disabled={!r.clubId}
                  onClick={() => r.clubId && setView('club', r.clubId)}
                  className={`flex items-center gap-1 text-[11px] text-zinc-500 ${
                    r.clubId ? 'hover:text-sky-300' : ''
                  }`}
                >
                  <Crest code={r.code} size="xs" />
                  {r.club}
                </button>
              </div>
              <span className={`font-display text-sm font-bold tabular-nums ${accent}`}>
                {r.stat}
                <span className="ml-0.5 text-[10px] font-medium text-zinc-600">{unit}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function LeadersGrid({ league, setView }) {
  const { t } = useI18n()
  return (
    <section>
      <div className="mb-3">
        <CardLabel>{t('league.statisticalLeaders')}</CardLabel>
        <p className="mt-0.5 text-xs text-zinc-400">{t('league.leadersSub')}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {LEADER_META.map((m) => (
          <LeaderBox
            key={m.key}
            title={t(m.labelKey)}
            unit={m.unit}
            accent={m.accent}
            rows={league.leaders[m.key]}
            setView={setView}
          />
        ))}
      </div>
    </section>
  )
}

/* ================================================================== */
/*  5 — Smart Value Best XI                                            */
/* ================================================================== */

function BestXIPitch({ league, setView }) {
  const { t } = useI18n()
  const total = league.bestXI.reduce((a, p) => a + p.value, 0)

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-4 py-3">
        <div>
          <CardLabel>{t('league.bestXi')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">{t('league.bestXiSub')}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-bold tabular-nums text-emerald-400">€{total}M</p>
          <p className="text-[10px] text-zinc-500">{t('league.xiTotal')}</p>
        </div>
      </div>

      <div className="relative aspect-[5/7] w-full max-h-[480px] bg-gradient-to-b from-[#0d3323] to-[#0a2419] p-3 sm:p-4">
        <div className="pointer-events-none absolute inset-3 rounded-lg border border-white/15 sm:inset-4" aria-hidden="true">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
          <div className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 sm:size-20" />
          <div className="absolute left-1/2 top-0 h-12 w-[42%] -translate-x-1/2 border border-t-0 border-white/15 sm:h-14" />
          <div className="absolute bottom-0 left-1/2 h-12 w-[42%] -translate-x-1/2 border border-b-0 border-white/15 sm:h-14" />
        </div>

        {league.bestXI.map((pl) => {
          const canPlayer = Boolean(pl.playerId)
          return (
            <button
              key={`${pl.pos}-${pl.name}`}
              type="button"
              onClick={() => {
                if (canPlayer) setView('player', pl.playerId)
                else if (pl.clubId) setView('club', pl.clubId)
              }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pl.x}%`, top: `${(pl.y / 140) * 100}%` }}
              title={`${pl.name} · ${pl.pos} · €${pl.value}M`}
            >
              <span className="group flex flex-col items-center gap-0.5">
                <span className="flex size-9 flex-col items-center justify-center rounded-full border border-sky-400/40 bg-zinc-950/90 shadow-lg shadow-black/40 ring-2 ring-sky-400/20 transition-transform group-hover:scale-110 sm:size-10">
                  <span className="font-display text-[10px] font-bold leading-none text-sky-300">{pl.pos}</span>
                  <span className="font-display text-[9px] font-semibold tabular-nums leading-none text-emerald-400">
                    €{pl.value}M
                  </span>
                </span>
                <span className="max-w-[5rem] truncate rounded bg-zinc-950/85 px-1 py-0.5 text-center text-[9px] font-medium text-zinc-200 ring-1 ring-white/10 sm:text-[10px]">
                  {pl.name}
                </span>
                <span className="text-[8px] text-zinc-500">{pl.code}</span>
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

function MatchdayResults({ league, setView }) {
  const { t } = useI18n()
  const rows = useMemo(() => matchesForLeague(league), [league])
  if (!rows.length) return null

  return (
    <Card className="p-4 sm:p-5">
      <CardLabel>{t('league.matchFeed')}</CardLabel>
      <p className="mt-0.5 text-xs text-zinc-400">{t('league.matchFeedSub')}</p>
      <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => {
          const played = m.status !== 'upcoming'
          const scoreLabel =
            played && m.home.score != null && m.away.score != null
              ? `${m.home.score}–${m.away.score}`
              : null
          return (
            <li key={m.id}>
              <div
                className="flex items-center gap-2 rounded-xl border border-white/5 bg-zinc-950/40 px-2.5 py-2 text-xs transition-colors hover:border-red-400/20 hover:bg-red-500/[0.04]"
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
                  <p className="text-[10px] text-zinc-500">
                    {m.status === 'live'
                      ? `${t('common.live')} ${m.clock || ''}`
                      : m.status === 'ft'
                        ? t('common.ft')
                        : m.kickoff || t('common.upcoming')}
                  </p>
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

/**
 * LeagueProfile — deep data command center for a domestic/international competition.
 * Critical links use setView('club'|'player'|'nation'|'match', id).
 */
export default function LeagueProfile({ league, onBack, setView }) {
  const { t } = useI18n()

  if (!league) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-zinc-400">{t('league.unavailable')}</p>
      </main>
    )
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

      <LeagueHero league={league} setView={setView} />

      <div className="mt-6">
        <MatchdayResults league={league} setView={setView} />
      </div>

      <div className="mt-6">
        <StandingsPanel league={league} setView={setView} />
      </div>

      <div className="mt-6">
        <LeadersGrid league={league} setView={setView} />
      </div>

      <div className="mt-6">
        <BestXIPitch league={league} setView={setView} />
      </div>
    </main>
  )
}
