import { useMemo, useState } from 'react'
import { Avatar, Crest, Card, CardLabel, euros, ScoreBadge } from './ui.jsx'
import { AiBadge } from './smart.jsx'
import {
  FEATURED, NEWS, MATCHES, LATEST_TRANSFERS, RUMORS,
  SMART_RISERS, MOST_SEARCHED, EXPIRING, LEAGUES,
} from './homeData.js'
import { useI18n } from './i18n/I18nProvider.jsx'
import { LEAGUES_DETAIL } from './dataLayer.js'

/* ------------------------------------------------------------------ */
/*  Shared tiny bits — existing design tokens                          */
/* ------------------------------------------------------------------ */

const TAG_COLOR = {
  'Model Insight': 'bg-sky-400/15 text-sky-300 ring-sky-400/25',
  Transfer: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/20',
  Injury: 'bg-red-400/15 text-red-300 ring-red-400/20',
  Contract: 'bg-violet-400/15 text-violet-300 ring-violet-400/20',
  Rumor: 'bg-amber-400/15 text-amber-300 ring-amber-400/20',
  Market: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/20',
  Loan: 'bg-zinc-400/15 text-zinc-300 ring-zinc-400/20',
  Deal: 'bg-sky-400/15 text-sky-300 ring-sky-400/20',
}

function Tag({ children }) {
  const cls = TAG_COLOR[children] || 'bg-zinc-400/15 text-zinc-300 ring-zinc-400/20'
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${cls}`}>
      {children}
    </span>
  )
}

function TrendArrow({ pct }) {
  const up = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 font-display text-[11px] font-semibold tabular-nums ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      <svg viewBox="0 0 12 12" className={`size-2.5 ${up ? '' : 'rotate-180'}`} fill="currentColor" aria-hidden="true">
        <path d="M6 2l4 5H8v3H4V7H2l4-5z" />
      </svg>
      {up ? '+' : ''}{pct.toFixed(1)}%
    </span>
  )
}

function daysUntil(isoDate) {
  const end = new Date(`${isoDate}T00:00:00Z`)
  const now = new Date()
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.ceil((end.getTime() - startOfToday) / 86_400_000)
}

function formatCountdown(days, t) {
  if (days < 0) return { label: t('home.freeAgentNow'), urgent: true, done: true }
  if (days === 0) return { label: t('home.expiresToday'), urgent: true, done: false }
  if (days < 30) return { label: `${days} ${t('home.dLeft')}`, urgent: true, done: false }
  if (days < 365) {
    const mo = Math.round(days / 30)
    return { label: `${mo} ${t('home.moLeft')}`, urgent: days < 120, done: false }
  }
  const y = Math.floor(days / 365)
  const mo = Math.round((days % 365) / 30)
  return {
    label: mo > 0 ? `${y}y ${mo}mo` : `${y} ${t('home.yLeft')}`,
    urgent: false,
    done: false,
  }
}

/* ------------------------------------------------------------------ */
/*  1 — Hero bento                                                     */
/* ------------------------------------------------------------------ */

function FeaturedCard({ onOpenPlayer }) {
  const { t } = useI18n()
  const progress = Math.min(100, Math.round((FEATURED.currentValue / FEATURED.targetValue) * 100))
  return (
    <button
      onClick={() => FEATURED.playerId && onOpenPlayer(FEATURED.playerId)}
      className="group relative flex min-h-[280px] w-full flex-col justify-end overflow-hidden rounded-2xl border border-white/10 text-left lg:min-h-[320px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-zinc-900 to-zinc-950" aria-hidden="true" />
      <div className="absolute -right-16 -top-10 size-64 rounded-full bg-sky-400/20 blur-3xl transition-transform duration-700 group-hover:scale-110" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" aria-hidden="true" />

      {/* Glassmorphism value chip */}
      <div className="absolute right-4 top-4 hidden rounded-xl border border-white/10 bg-zinc-950/45 px-3 py-2 shadow-lg shadow-black/20 backdrop-blur-md sm:block">
        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{t('home.smartPath')}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="font-display text-lg font-bold tabular-nums text-emerald-400">{euros(FEATURED.currentValue)}</span>
          <span className="text-xs text-zinc-500">→</span>
          <span className="font-display text-lg font-bold tabular-nums text-sky-300">{euros(FEATURED.targetValue)}</span>
        </div>
        <div className="mt-2 h-1 w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-zinc-400">{FEATURED.confidence}% {t('home.modelConfidence')}</p>
      </div>

      {/* Glassmorphism content overlay */}
      <div className="relative m-3 rounded-xl border border-white/10 bg-zinc-950/40 p-4 shadow-xl shadow-black/20 backdrop-blur-md sm:m-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
          <Tag>{FEATURED.tag}</Tag>
          <span className="text-zinc-600">·</span>
          <span>{FEATURED.source}</span>
          <span className="text-zinc-600">·</span>
          <span className="tabular-nums">{FEATURED.time}</span>
        </div>
        <h3 className="mt-2.5 font-display text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl lg:text-[1.65rem]">
          {FEATURED.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm text-zinc-400">{FEATURED.excerpt}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {FEATURED.signals.map((s) => (
            <span
              key={s.label}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-[11px]"
            >
              <span className="text-zinc-500">{s.label}</span>
              <span className="font-display font-semibold tabular-nums text-emerald-400">{s.delta}</span>
            </span>
          ))}
        </div>

        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-sky-400">
          {t('home.readBreakdown')}
          <svg viewBox="0 0 24 24" className="size-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </button>
  )
}

function NewsTicker() {
  const { t } = useI18n()
  const items = [...NEWS, ...NEWS]
  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <CardLabel>{t('home.liveNews')}</CardLabel>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-value-pulse" aria-hidden="true" />
          {t('home.liveFeed')}
        </span>
      </div>
      <div className="news-viewport relative h-[252px] overflow-hidden lg:h-[292px]">
        <ul className="news-track px-2">
          {items.map((n, i) => (
            <li key={i} aria-hidden={i >= NEWS.length ? true : undefined}>
              <button className="group flex w-full flex-col gap-1 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-white/5">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <Tag>{n.tag}</Tag>
                  <span className="ml-auto shrink-0 tabular-nums text-zinc-400">{n.time}</span>
                </div>
                <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-200 transition-colors group-hover:text-white">
                  {n.title}
                </p>
                <p className="text-xs text-zinc-400">{n.source}</p>
              </button>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-zinc-900/80 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-zinc-900/80 to-transparent" aria-hidden="true" />
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  2 — Middle widgets                                                 */
/* ------------------------------------------------------------------ */

function StatusPill({ m }) {
  const { t } = useI18n()
  if (m.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-red-400">
        <span className="size-1.5 rounded-full bg-red-500 animate-value-pulse" aria-hidden="true" />
        {m.clock}
      </span>
    )
  }
  if (m.status === 'ft') {
    return <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">{t('common.ft')}</span>
  }
  return <span className="rounded-md bg-sky-400/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-sky-300">{m.kickoff}</span>
}

function MatchRow({ m, onOpenMatch }) {
  const played = m.status !== 'upcoming'
  const clickable = Boolean(m.id && onOpenMatch)
  return (
    <li>
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? () => onOpenMatch(m.id) : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpenMatch(m.id)
                }
              }
            : undefined
        }
        className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
          clickable ? 'cursor-pointer hover:bg-white/5' : 'hover:bg-white/5'
        }`}
      >
        <div className="w-12 shrink-0">
          <StatusPill m={m} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Crest code={m.hc} size="xs" />
            <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">{m.home}</span>
          </div>
          <div className="flex items-center gap-2">
            <Crest code={m.ac} size="xs" />
            <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">{m.away}</span>
          </div>
        </div>
        <div className="flex w-[4.25rem] shrink-0 flex-col items-end justify-center gap-0.5">
          {played ? (
            <ScoreBadge
              matchId={m.id}
              homeScore={m.hs}
              awayScore={m.as}
              onOpenMatch={onOpenMatch}
              size="sm"
            />
          ) : (
            <span className="font-display text-xs tabular-nums text-sky-300">{m.kickoff || '–'}</span>
          )}
        </div>
        <span className="hidden w-16 shrink-0 truncate text-right text-[10px] text-zinc-500 sm:block" title={m.league}>
          {m.league}
        </span>
      </div>
    </li>
  )
}

function MatchesWidget({ onOpenMatch }) {
  const { t } = useI18n()
  const liveCount = MATCHES.filter((m) => m.status === 'live').length
  return (
    <Card className="flex flex-col p-4 lg:col-span-5">
      <div className="flex items-center justify-between">
        <CardLabel>{t('home.liveMatches')}</CardLabel>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
          <span className="size-1.5 rounded-full bg-red-500 animate-value-pulse" aria-hidden="true" />
          {liveCount} {t('home.live')}
        </span>
      </div>
      <ul className="mt-3 divide-y divide-white/5">
        {MATCHES.map((m, i) => (
          <MatchRow key={m.id || i} m={m} onOpenMatch={onOpenMatch} />
        ))}
      </ul>
    </Card>
  )
}

function TransferRow({ row, onOpenPlayer }) {
  const { t } = useI18n()
  const free = row.fee === 0
  return (
    <li>
      <button
        onClick={() => onOpenPlayer(row.playerId)}
        className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
      >
        <Avatar name={row.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-zinc-100 transition-colors group-hover:text-emerald-300">{row.name}</p>
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-zinc-400">
            <span className="truncate">{row.from}</span>
            <span className="text-zinc-600">➔</span>
            <span className="truncate">{row.to}</span>
          </p>
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">
          <Crest code={row.fc} size="xs" />
          <svg viewBox="0 0 24 24" className="size-3 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          <Crest code={row.tc} size="xs" />
        </div>
        <span className={`w-16 shrink-0 text-right font-display text-sm font-semibold tabular-nums ${free ? 'text-zinc-400' : 'text-emerald-400'}`}>
          {free ? t('common.free') : euros(row.fee)}
        </span>
      </button>
    </li>
  )
}

function RumorRow({ r, onOpenPlayer }) {
  const hot = r.probability >= 50
  return (
    <li>
      <button
        onClick={() => onOpenPlayer(r.playerId)}
        className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
      >
        <Avatar name={r.player} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-zinc-100 transition-colors group-hover:text-emerald-300">{r.player}</p>
          <p className="flex items-center gap-1.5 truncate text-xs text-zinc-400">
            <Crest code={r.from} size="xs" />
            <span className="text-zinc-600">➔</span>
            <Crest code={r.to} size="xs" />
            <span className="text-zinc-600">·</span>
            <span className="tabular-nums">{euros(r.fee)}</span>
          </p>
        </div>
        <div className="flex w-28 shrink-0 flex-col items-end gap-1 sm:w-32">
          <div className="flex w-full items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${hot ? 'bg-gradient-to-r from-emerald-500 to-emerald-300' : 'bg-gradient-to-r from-amber-500 to-amber-300'}`}
                style={{ width: `${r.probability}%` }}
              />
            </div>
            <span className={`font-display text-xs font-semibold tabular-nums ${hot ? 'text-emerald-400' : 'text-amber-300'}`}>
              {r.probability}%
            </span>
          </div>
          <span className="text-[10px] text-zinc-500">{r.source}</span>
        </div>
      </button>
    </li>
  )
}

function RiserRow({ r, onOpenPlayer }) {
  const { t } = useI18n()
  return (
    <li>
      <button
        onClick={() => onOpenPlayer(r.playerId)}
        className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
      >
        <Avatar name={r.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-zinc-100 transition-colors group-hover:text-emerald-300">{r.name}</p>
          <p className="flex items-center gap-1.5 truncate text-xs text-zinc-400">
            <Crest code={r.cc} size="xs" />
            {r.pos} · {r.age}
          </p>
        </div>
        <div className="hidden text-right text-xs text-zinc-400 sm:block">
          <span className="tabular-nums">{r.caps} {t('common.caps')}</span>
          <span className="mx-1 text-zinc-700">·</span>
          <span className="tabular-nums text-zinc-300">{r.rating.toFixed(2)}</span>
        </div>
        <div className="w-28 shrink-0 text-right">
          <span className="font-display text-sm font-semibold tabular-nums text-emerald-400">{euros(r.value)}</span>
          <div className="mt-0.5 flex justify-end">
            <TrendArrow pct={r.trend} />
          </div>
        </div>
      </button>
    </li>
  )
}

function MarketHub({ onOpenPlayer }) {
  const { t } = useI18n()
  const [tab, setTab] = useState('transfers')
  const marketTabs = [
    { id: 'transfers', label: t('home.latestTransfers') },
    { id: 'rumors', label: t('home.trendingRumors') },
    { id: 'risers', label: t('home.smartValueRisers') },
  ]
  const count =
    tab === 'transfers' ? LATEST_TRANSFERS.length : tab === 'rumors' ? RUMORS.length : SMART_RISERS.length

  return (
    <Card className="flex flex-col p-4 lg:col-span-7">
      <div className="flex items-center justify-between gap-2">
        <CardLabel>{t('home.marketHub')}</CardLabel>
        <span className="text-xs text-zinc-400">Summer 2026 · {count} rows</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-white/5 p-1">
        {marketTabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`rounded-lg px-1.5 py-1.5 text-[11px] font-medium leading-tight transition-colors sm:text-xs ${
              tab === tabItem.id ? 'bg-zinc-800 text-white shadow-sm shadow-black/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>
      <ul className="mt-2 divide-y divide-white/5">
        {tab === 'transfers' &&
          LATEST_TRANSFERS.map((row) => (
            <TransferRow key={row.playerId + row.fee} row={row} onOpenPlayer={onOpenPlayer} />
          ))}
        {tab === 'rumors' && RUMORS.map((r) => <RumorRow key={r.playerId} r={r} onOpenPlayer={onOpenPlayer} />)}
        {tab === 'risers' && SMART_RISERS.map((r) => <RiserRow key={r.playerId} r={r} onOpenPlayer={onOpenPlayer} />)}
      </ul>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  3 — Netflix-style horizontal rows                                  */
/* ------------------------------------------------------------------ */

function ScrollRow({ label, hint, children }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <CardLabel>{label}</CardLabel>
          {hint && <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>}
        </div>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">{children}</div>
    </section>
  )
}

function SearchedCard({ p, onOpenPlayer }) {
  const clickable = Boolean(p.playerId && onOpenPlayer)
  const Comp = clickable ? 'button' : 'div'
  return (
    <Comp
      onClick={clickable ? () => onOpenPlayer(p.playerId) : undefined}
      className={`relative flex w-48 shrink-0 flex-col rounded-2xl border border-white/5 bg-zinc-900/60 p-4 text-left transition-colors ${
        clickable ? 'group cursor-pointer hover:border-white/10 hover:bg-zinc-900' : ''
      }`}
    >
      <span className="absolute right-3 top-2 font-display text-3xl font-bold tabular-nums leading-none text-white/[0.08] transition-colors group-hover:text-white/[0.14]">
        {String(p.rank).padStart(2, '0')}
      </span>
      <div className="flex items-center gap-2">
        <Avatar name={p.name} size="md" />
        <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-display text-[10px] font-bold tabular-nums text-zinc-400">
          #{p.rank}
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-emerald-300">
        {p.name}
      </p>
      <p className="flex items-center gap-1.5 truncate text-xs text-zinc-400">
        <Crest code={p.cc} size="xs" />
        {p.pos} · {p.age}
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="font-display text-sm font-semibold tabular-nums text-emerald-400">{euros(p.value)}</span>
        <TrendArrow pct={p.trend} />
      </div>
    </Comp>
  )
}

function ExpiringCard({ p, onOpenPlayer }) {
  const { t } = useI18n()
  const countdown = useMemo(() => formatCountdown(daysUntil(p.endDate), t), [p.endDate, t])
  const clickable = Boolean(p.playerId && onOpenPlayer)
  const Comp = clickable ? 'button' : 'div'
  return (
    <Comp
      onClick={clickable ? () => onOpenPlayer(p.playerId) : undefined}
      className={`flex w-52 shrink-0 flex-col rounded-2xl border border-white/5 bg-zinc-900/60 p-4 text-left transition-colors ${
        clickable ? 'group cursor-pointer hover:border-white/10 hover:bg-zinc-900' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar name={p.name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-emerald-300">
            {p.name}
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs text-zinc-400">
            <Crest code={p.cc} size="xs" />
            {p.pos} · {p.age}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between border-t border-white/5 pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">{t('common.smv')}</p>
          <p className="font-display text-sm font-semibold tabular-nums text-emerald-400">{euros(p.value)}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block rounded-md px-2 py-1 text-[10px] font-semibold tabular-nums ${
              countdown.done
                ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20'
                : countdown.urgent
                  ? 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/20'
                  : 'bg-white/5 text-zinc-400'
            }`}
          >
            {countdown.label}
          </span>
          <p className="mt-1 text-[10px] text-zinc-500">→ {p.expires}</p>
        </div>
      </div>
    </Comp>
  )
}

/* ------------------------------------------------------------------ */
/*  4 — Top 5 league grid                                              */
/* ------------------------------------------------------------------ */

/* Homepage league cards → resolve live warehouse ids when available */
const LEAGUE_ID_FALLBACK = {
  ENG: 'premier-league',
  ESP: 'la-liga',
  GER: 'bundesliga',
  ITA: 'serie-a',
  FRA: 'ligue-1',
}

function resolveHomeLeagueId(code, name) {
  const fallback = LEAGUE_ID_FALLBACK[code]
  if (fallback && LEAGUES_DETAIL[fallback]) return fallback
  // TM codes often used as ids after hydrate
  const codeMap = { ENG: 'GB1', ESP: 'ES1', GER: 'L1', ITA: 'IT1', FRA: 'FR1' }
  const tm = codeMap[code]
  if (tm && LEAGUES_DETAIL[tm]) return tm
  const needle = String(name || '').toLowerCase()
  const hit = Object.values(LEAGUES_DETAIL).find((x) => {
    const n = String(x.name || '').toLowerCase()
    const id = String(x.id || '').toLowerCase()
    return (
      (needle && n.includes(needle.split(' ')[0])) ||
      (code === 'ENG' && (n.includes('premier') || id.includes('gb1'))) ||
      (code === 'ESP' && (n.includes('liga') || id.includes('es1'))) ||
      (code === 'GER' && (n.includes('bundes') || id === 'l1')) ||
      (code === 'ITA' && (n.includes('serie') || id.includes('it1'))) ||
      (code === 'FRA' && (n.includes('ligue') || id.includes('fr1')))
    )
  })
  return hit?.id || fallback || null
}

function LeagueCard({ l, onOpenLeague }) {
  const { t } = useI18n()
  const up = l.trend >= 0
  const leagueId = resolveHomeLeagueId(l.code, l.name)
  const clickable = Boolean(leagueId && onOpenLeague)
  const Wrapper = clickable ? 'button' : 'div'
  return (
    <Wrapper
      type={clickable ? 'button' : undefined}
      onClick={clickable ? () => onOpenLeague(leagueId) : undefined}
      className={`w-full text-left ${clickable ? 'group' : ''}`}
    >
      <Card className={`p-4 ${clickable ? 'transition-colors group-hover:border-white/15' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 font-display text-[10px] font-bold tracking-wide text-zinc-200 ring-1 ring-white/10">
            {l.code}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">{l.name}</p>
            <p className="text-[10px] text-zinc-500">{l.continent}</p>
          </div>
        </div>
        <p className="mt-3 font-display text-2xl font-bold tabular-nums tracking-tight text-emerald-400">
          €{l.value.toFixed(2)}
          <span className="text-base font-semibold text-zinc-500">bn</span>
        </p>
        <p className="mt-0.5 text-xs text-zinc-400">{t('home.algorithmicLeague')}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">{t('home.clubs')}</p>
            <p className="font-display text-sm font-semibold tabular-nums text-zinc-200">{l.clubs}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">{t('home.players')}</p>
            <p className="font-display text-sm font-semibold tabular-nums text-zinc-200">{l.players}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {clickable && (
            <span className="text-[10px] font-medium text-sky-400/80 opacity-0 transition-opacity group-hover:opacity-100">
              {t('common.open')} →
            </span>
          )}
          <span className={`ml-auto inline-flex items-center gap-0.5 font-semibold tabular-nums ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            <svg viewBox="0 0 12 12" className={`size-2.5 ${up ? '' : 'rotate-180'}`} fill="currentColor" aria-hidden="true">
              <path d="M6 2l4 5H8v3H4V7H2l4-5z" />
            </svg>
            {up ? '+' : ''}
            {l.trend}%
          </span>
        </div>
      </Card>
    </Wrapper>
  )
}

/* ------------------------------------------------------------------ */
/*  HomepageDashboard                                                  */
/* ------------------------------------------------------------------ */

export default function HomepageDashboard({ onOpenPlayer, onOpenClub, onOpenMatch, onOpenLeague }) {
  const { t, locale } = useI18n()
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Hero slogan */}
      <div className="mb-6 border-b border-white/5 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {t('home.terminal')}
            </p>
            <h1 className="mt-1.5 font-display text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
              {t('home.title')}
            </h1>
            <p className="mt-1.5 text-sm font-medium text-zinc-400">{t('home.tagline')}</p>
            <p className="mt-2.5">
              <AiBadge />
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">
              {new Date('2026-07-11T12:00:00Z').toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="mt-0.5 text-[10px] tabular-nums text-zinc-600">{t('home.dataRefresh')} · 00:04 UTC</p>
          </div>
        </div>
      </div>

      {/* Hero bento */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeaturedCard onOpenPlayer={onOpenPlayer} />
        </div>
        <NewsTicker />
      </div>

      {/* Middle widgets: Live Matches + Market Hub */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <MatchesWidget onOpenMatch={onOpenMatch} />
        <MarketHub onOpenPlayer={onOpenPlayer} />
      </div>

      {/* Horizontal scroll rows */}
      <ScrollRow
        label={t('home.mostSearched')}
        hint={t('home.mostSearchedHint')}
      >
        {MOST_SEARCHED.map((p) => (
          <SearchedCard key={`${p.rank}-${p.name}`} p={p} onOpenPlayer={onOpenPlayer} />
        ))}
      </ScrollRow>

      <ScrollRow
        label={t('home.expiring')}
        hint={t('home.expiringHint')}
      >
        {EXPIRING.map((p, i) => (
          <ExpiringCard key={`${p.name}-${i}`} p={p} onOpenPlayer={onOpenPlayer} />
        ))}
      </ScrollRow>

      {/* Bottom league grid */}
      <section className="mt-8 pb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <CardLabel>{t('home.leagues')}</CardLabel>
            <p className="mt-0.5 text-xs text-zinc-400">
              {t('home.clubs')} · {t('home.players')} · {t('home.algorithmicLeague')}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-[11px] font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            {t('hubs.allCompetitions')}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {LEAGUES.map((l) => (
            <LeagueCard key={l.code} l={l} onOpenLeague={onOpenLeague} />
          ))}
        </div>
      </section>
    </main>
  )
}

export { HomepageDashboard }
