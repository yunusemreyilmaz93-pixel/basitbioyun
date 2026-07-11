import { useEffect, useMemo, useState } from 'react'
import { Avatar, Crest, Card, CardLabel, TrendChip, eurosLong, euros, Tip } from './ui.jsx'
import { PLAYERS, DETAILS, CURRENT_SEASON, enrichPlayerFromWarehouse } from './dataLayer.js'
import { POS, POS_LABEL } from './playerDetails.js'
import { AiBadge } from './smart.jsx'
import { translateSmartText, useI18n } from './i18n/I18nProvider.jsx'

/* ================================================================== */
/*  Shared bits                                                        */
/* ================================================================== */

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

/** Animated progress bar width on mount */
function useBarWidth(pct) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])
  return w
}

function minPerGoal(min, goals) {
  if (!goals) return '–'
  return `${Math.round(min / goals)}'`
}

function CardCount({ n, color }) {
  if (!n) return <span className="text-zinc-600">–</span>
  return (
    <span className="inline-flex items-center gap-1 tabular-nums text-zinc-300">
      <span className={`inline-block h-3 w-2 rounded-[1px] ${color}`} aria-hidden="true" />
      {n}
    </span>
  )
}

function formatMv(v) {
  if (v == null) return '–'
  if (v < 1) return `€${(v * 1000).toFixed(0)}k`
  return eurosLong(v)
}

function PlayerPhoto({ name, shirt, src }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
  return (
    <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/10 sm:size-32">
      {src ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center font-display text-4xl font-semibold text-zinc-300"
          aria-hidden="true"
        >
          {initials}
        </div>
      )}
      {shirt != null && shirt !== '' && (
        <span className="absolute bottom-1.5 right-1.5 flex size-7 items-center justify-center rounded-lg bg-zinc-950/80 font-display text-xs font-bold text-emerald-400 ring-1 ring-white/10">
          {shirt}
        </span>
      )}
    </div>
  )
}

/* ---- 5-year Smart Value sparkline ---- */

function ValueChart({ history, height = 118, chartId = 'pv' }) {
  const { t } = useI18n()
  const [hover, setHover] = useState(null)
  const W = 480
  const H = height
  const PAD = { top: 14, bottom: 20, left: 6, right: 6 }
  const values = history.map((h) => h.value)
  const niceMax = Math.max(50, Math.ceil(Math.max(...values) / 50) * 50)

  const px = (i) => PAD.left + (i / (history.length - 1)) * (W - PAD.left - PAD.right)
  const py = (v) => PAD.top + (1 - v / niceMax) * (H - PAD.top - PAD.bottom)

  const pts = history.map((h, i) => [px(i), py(h.value)])
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0]},${H - PAD.bottom} L${pts[0][0]},${H - PAD.bottom} Z`

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Smart market value from ${euros(values[0])} to ${euros(values.at(-1))}`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`${chartId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((i) => {
          const y = PAD.top + (i / 2) * (H - PAD.top - PAD.bottom)
          return <line key={i} x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />
        })}
        <path d={area} fill={`url(#${chartId}-fill)`} />
        <path d={line} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" />
        {history.map((h, i) => {
          const [x, y] = pts[i]
          const bandW = (W - PAD.left - PAD.right) / (history.length - 1)
          return (
            <g key={h.year}>
              <rect x={x - bandW / 2} y={0} width={bandW} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
              {hover === i && (
                <line x1={x} x2={x} y1={PAD.top} y2={H - PAD.bottom} stroke="rgba(52,211,153,0.3)" strokeDasharray="3 3" />
              )}
              <circle
                cx={x}
                cy={y}
                r={hover === i ? 5 : 3.5}
                fill={hover === i ? '#34d399' : '#0f0f12'}
                stroke="#34d399"
                strokeWidth="2"
                style={{ transition: 'r 150ms' }}
              />
              <text
                x={x}
                y={H - 4}
                textAnchor={i === 0 ? 'start' : i === history.length - 1 ? 'end' : 'middle'}
                fill={hover === i ? '#34d399' : 'rgba(255,255,255,0.35)'}
                fontSize="10"
                fontFamily="Inter, sans-serif"
              >
                {h.year}
              </text>
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-zinc-900/95 px-2.5 py-1.5 shadow-lg shadow-black/40 backdrop-blur-sm"
          style={{ left: `${(px(hover) / W) * 100}%`, top: `${(py(history[hover].value) / H) * 100 - 4}%` }}
        >
          <p className="font-display text-sm font-semibold tabular-nums text-emerald-400">{euros(history[hover].value)}</p>
          <p className="text-[10px] text-zinc-500">{t('common.june')} {history[hover].year}</p>
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  1 — Profile Hero                                                   */
/* ================================================================== */

function MetaCell({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-zinc-200">{children}</div>
    </div>
  )
}

function ProfileHero({ p, d, setView }) {
  const { t } = useI18n()
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 p-5 backdrop-blur-md sm:p-7">
      <div className="pointer-events-none absolute -left-24 -top-32 size-80 rounded-full bg-emerald-400/[0.06] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 top-0 size-64 rounded-full bg-sky-400/[0.05] blur-3xl" aria-hidden="true" />

      <div className="relative grid grid-cols-1 gap-7 lg:grid-cols-[1.05fr_1fr]">
        {/* Left — identity */}
        <div>
          <div className="flex gap-5">
            <PlayerPhoto name={p.name} shirt={p.shirt} src={p.imageUrl || d?.imageUrl} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!p.nationId}
                  onClick={() => p.nationId && setView?.('nation', p.nationId)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-1.5 py-0.5 ${
                    p.nationId ? 'transition-colors hover:border-sky-400/30 hover:bg-sky-500/10' : ''
                  }`}
                >
                  <span className="rounded-sm bg-white/10 px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wide text-zinc-200">
                    {p.nation.code}
                  </span>
                  <span className="text-xs text-zinc-400">{p.nation.name}</span>
                </button>
                <span className="text-zinc-700">·</span>
                <span className="text-xs text-zinc-400">#{p.shirt}</span>
              </div>
              <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {p.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-zinc-400">
                <span className="font-medium text-emerald-400">{POS_LABEL[d.positions.main] || p.position}</span>
                <span className="text-zinc-600">·</span>
                <button
                  type="button"
                  disabled={!p.clubId}
                  onClick={() => p.clubId && setView?.('club', p.clubId)}
                  className={`inline-flex items-center gap-1.5 ${
                    p.clubId ? 'font-medium text-zinc-200 transition-colors hover:text-sky-300' : ''
                  }`}
                >
                  <Crest code={p.clubShort} size="xs" />
                  {p.club}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-white/5 pt-5 sm:grid-cols-3">
            <MetaCell label={t('common.age')}>
              {p.age} {t('player.years')}
            </MetaCell>
            <MetaCell label={t('player.height')}>{d.height}</MetaCell>
            <MetaCell label={t('player.preferredFoot')}>{p.foot}</MetaCell>
            <MetaCell label={t('player.agent')}>{d.agent}</MetaCell>
            <MetaCell label={t('player.contractUntilLabel')}>
              {t('common.june')} {p.contractUntil}
            </MetaCell>
            <MetaCell label={t('player.currentClub')}>
              {p.clubId ? (
                <button type="button" onClick={() => setView?.('club', p.clubId)} className="transition-colors hover:text-sky-300">
                  {p.club}
                </button>
              ) : (
                p.club
              )}
            </MetaCell>
          </div>
        </div>

        {/* Right — massive Smart Market Value */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/[0.08] via-zinc-950/40 to-sky-500/[0.06] p-5 shadow-[0_0_40px_-16px_rgba(52,211,153,0.35)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400/90">
                  {t('player.smartMarketValue')}
                </p>
                <AiBadge />
              </div>
              <p className="mt-1 font-display text-4xl font-bold tabular-nums tracking-tight text-emerald-400 sm:text-[2.85rem] sm:leading-none">
                {eurosLong(p.smv?.value ?? p.value)}
              </p>
              {p.smv && (
                <p className="mt-1 text-[11px] tabular-nums text-zinc-400">
                  {t('player.range')} €{p.smv.low}–{p.smv.high}M
                  <span className="mx-1.5 text-zinc-600">·</span>
                  <span className="text-sky-300/90">
                    {p.smv.confidence}% {t('player.conf')}
                  </span>
                  <span className="mx-1.5 text-zinc-600">·</span>
                  <span className="text-zinc-500">
                    {t('player.asOf')} {p.smv.asOf}
                  </span>
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TrendChip pct={p.trendPct} />
                <span className="text-[11px] text-zinc-500">{t('player.vsLastSeason')}</span>
                {p.seasonId && (
                  <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-400 ring-1 ring-white/10">
                    {CURRENT_SEASON.label}
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                {t('player.highestEver')}
              </p>
              <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-zinc-100">
                {eurosLong(d.highest.value)}
              </p>
              <p className="text-[10px] text-zinc-500">{d.highest.date}</p>
            </div>
          </div>
          <div className="mt-3 border-t border-emerald-400/10 pt-2">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              {t('player.valueProgression')}
            </p>
            <ValueChart history={p.valueHistory} height={118} chartId={`smv-${p.id}`} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  Tab 1 — Overview                                                   */
/* ================================================================== */

function Pitch({ positions }) {
  const all = [{ code: positions.main, main: true }, ...positions.others.map((c) => ({ code: c, main: false }))]
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full" role="img" aria-label={`Main position ${POS_LABEL[positions.main]}`}>
      <defs>
        <linearGradient id="turf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d3323" />
          <stop offset="100%" stopColor="#0a2419" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="140" fill="url(#turf)" rx="4" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="2" y={2 + i * 22.6} width="96" height="11.3" fill="#ffffff" opacity="0.025" />
      ))}
      <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" fill="none">
        <rect x="2" y="2" width="96" height="136" rx="2" />
        <line x1="2" y1="70" x2="98" y2="70" />
        <circle cx="50" cy="70" r="11" />
        <rect x="26" y="2" width="48" height="20" />
        <rect x="26" y="118" width="48" height="20" />
        <rect x="40" y="2" width="20" height="7" />
        <rect x="40" y="131" width="20" height="7" />
      </g>
      <circle cx="50" cy="70" r="1.2" fill="rgba(255,255,255,0.25)" />
      {all.map(({ code, main }) => {
        const [x, y] = POS[code] || [50, 70]
        return (
          <g key={code}>
            {main && <circle cx={x} cy={y} r="8.5" fill="#34d399" opacity="0.15" />}
            <circle
              cx={x}
              cy={y}
              r="5.5"
              fill={main ? '#34d399' : 'rgba(24,24,27,0.9)'}
              stroke={main ? '#a7f3d0' : 'rgba(52,211,153,0.5)'}
              strokeWidth="0.8"
            />
            <text
              x={x}
              y={y + 1.8}
              textAnchor="middle"
              fontSize="4.4"
              fontWeight="700"
              fontFamily="Space Grotesk, sans-serif"
              fill={main ? '#052e1a' : '#a7f3d0'}
            >
              {code}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function CardSquare({ color = 'amber' }) {
  return (
    <span
      className={`inline-block size-2.5 shrink-0 rounded-[2px] ring-1 ring-black/20 ${
        color === 'red' ? 'bg-red-500' : 'bg-amber-400'
      }`}
      aria-hidden="true"
    />
  )
}

function StatBox({ value, label, tip, icon }) {
  const n = useCountUp(value ?? 0)
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-3.5 text-center transition-colors hover:border-white/10">
      <p className="font-display text-xl font-semibold tabular-nums text-white sm:text-2xl">
        {n.toLocaleString('en-US')}
      </p>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
        {icon}
        {tip ? <Tip label={tip}>{label}</Tip> : label}
      </p>
    </div>
  )
}

function OverviewTab({ p, d }) {
  const { t } = useI18n()
  const stats = p.seasonStats
  // Prefer seasonStats (API-ready); else competition rollups
  const cards = useMemo(() => {
    if (stats.yellow != null || stats.red != null) {
      return { yellow: stats.yellow ?? 0, red: stats.red ?? 0 }
    }
    if (d?.cardTotals) return d.cardTotals
    const comps = d?.competitions || []
    return comps.reduce(
      (a, c) => ({
        yellow: a.yellow + (c.yellow || 0),
        red: a.red + (c.red || 0),
      }),
      { yellow: 0, red: 0 },
    )
  }, [d?.competitions, d?.cardTotals, stats.yellow, stats.red])

  return (
    <div className="space-y-6">
      <div>
        <CardLabel>
          {t('player.currentSeason')} · {CURRENT_SEASON.label}
        </CardLabel>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7">
          <StatBox value={stats.matches} label={t('player.matches')} tip={t('player.tipMatches')} />
          <StatBox
            value={stats.starts ?? stats.matches}
            label={t('player.starts')}
            tip={t('player.tipStarts')}
          />
          <StatBox value={stats.goals} label={t('player.goals')} tip={t('player.tipGoals')} />
          <StatBox value={stats.assists} label={t('player.assists')} tip={t('player.tipAssists')} />
          <StatBox value={stats.minutes} label={t('player.minsPlayed')} tip={t('player.tipMin')} />
          <StatBox
            value={cards.yellow}
            label={t('player.yellowCards')}
            tip={t('player.tipYellow')}
            icon={<CardSquare color="amber" />}
          />
          <StatBox
            value={cards.red}
            label={t('player.redCards')}
            tip={t('player.tipRed')}
            icon={<CardSquare color="red" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,200px)_1fr]">
        <div>
          <CardLabel>{t('player.positions')}</CardLabel>
          <div className="mt-2 h-64 overflow-hidden rounded-xl border border-white/5 sm:h-72">
            <Pitch positions={d.positions} />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="size-2 rounded-full bg-emerald-400" />
              {t('player.main')} · {d.positions.main}
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="size-2 rounded-full border border-emerald-400/50" />
              {t('player.secondary')} · {d.positions.others.join(', ')}
            </span>
          </div>
        </div>

        <div>
          <CardLabel>{t('player.seasonByComp')}</CardLabel>
          <div className="mt-2 overflow-hidden rounded-xl border border-white/5">
            <table className="data-table w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2 text-left font-medium">{t('player.competition')}</th>
                  <th className="px-2 py-2 text-right font-medium">{t('player.apps')}</th>
                  <th className="px-2 py-2 text-right font-medium">{t('player.colG')}</th>
                  <th className="px-2 py-2 text-right font-medium">{t('player.colA')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('player.colMin')}</th>
                </tr>
              </thead>
              <tbody>
                {d.competitions.map((c) => (
                  <tr key={c.code} className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]">
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <Crest code={c.code} size="xs" />
                        <span className="text-zinc-200">{c.comp}</span>
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-zinc-300">{c.matches}</td>
                    <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-emerald-400">{c.goals}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-zinc-200">{c.assists}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-xs text-zinc-400">
                      {c.minutes.toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Tab 2 — Detailed Stats (flat high-density career table)            */
/* ================================================================== */

function DetailedStatsTab({ d }) {
  const tot = useMemo(
    () =>
      d.career.reduce(
        (a, s) => ({
          mp: a.mp + s.mp,
          g: a.g + s.g,
          a: a.a + s.a,
          y: a.y + s.y,
          r: a.r + s.r,
          min: a.min + s.min,
        }),
        { mp: 0, g: 0, a: 0, y: 0, r: 0, min: 0 },
      ),
    [d.career],
  )

  const { t } = useI18n()

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <CardLabel>{t('player.detailedStatsTitle')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">
            {t('player.detailedStatsSub', { n: d.career.length })}
          </p>
        </div>
      </div>

      <div className="mt-3 max-h-[640px] w-full overflow-y-auto rounded-xl border border-white/5">
        <table className="data-table w-full table-fixed">
          <colgroup>
            <col className="w-[9%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm">
            <tr className="border-b border-white/5 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <th className="px-1.5 py-2.5 text-left">
                <Tip label={t('player.tipSeason')} align="left">
                  {t('player.colSeason')}
                </Tip>
              </th>
              <th className="px-1.5 py-2.5 text-left">
                <Tip label={t('player.tipClub')} align="left">
                  {t('player.colClub')}
                </Tip>
              </th>
              <th className="px-1.5 py-2.5 text-left">
                <Tip label={t('player.tipComp')} align="left">
                  {t('player.colComp')}
                </Tip>
              </th>
              <th className="px-1.5 py-2.5 text-right">
                <Tip label={t('player.tipMatches')} align="right">
                  {t('player.colM')}
                </Tip>
              </th>
              <th className="px-1.5 py-2.5 text-right">
                <Tip label={t('player.tipGoals')} align="right">
                  {t('player.colG')}
                </Tip>
              </th>
              <th className="px-1.5 py-2.5 text-right">
                <Tip label={t('player.tipAssists')} align="right">
                  {t('player.colA')}
                </Tip>
              </th>
              <th className="px-1 py-2.5 text-center">
                <Tip label={t('player.tipYellow')}>
                  <span className="inline-block h-2.5 w-2 rounded-[1px] bg-amber-400" aria-label="Y" />
                </Tip>
              </th>
              <th className="border-r border-zinc-800/60 px-1 py-2.5 pr-2 text-center">
                <Tip label={t('player.tipRed')}>
                  <span className="inline-block h-2.5 w-2 rounded-[1px] bg-red-500" aria-label="R" />
                </Tip>
              </th>
              <th className="px-1.5 py-2.5 pl-2 text-right">
                <Tip label={t('player.tipMin')} align="right">
                  {t('player.colMin')}
                </Tip>
              </th>
              <th className="px-1.5 py-2.5 text-right">
                <Tip label={t('player.tipMinG')} align="right">
                  {t('player.colMinG')}
                </Tip>
              </th>
            </tr>
          </thead>
          <tbody>
            {d.career.map((s, i) => (
              <tr
                key={`${s.season}-${s.cc}-${s.code}-${i}`}
                className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-1.5 py-3 font-mono font-medium tabular-nums text-zinc-100">
                  {s.season}
                </td>
                <td className="min-w-0 px-1.5 py-3">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Crest code={s.cc} size="xs" />
                    <span className="truncate text-zinc-200">{s.club}</span>
                  </span>
                </td>
                <td className="min-w-0 px-1.5 py-3">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Crest code={s.code} size="xs" />
                    <span className="truncate text-zinc-400">{s.comp}</span>
                  </span>
                </td>
                <td className="px-1.5 py-3 text-right font-mono tabular-nums text-zinc-300">{s.mp}</td>
                <td className="px-1.5 py-3 text-right font-mono font-semibold tabular-nums text-emerald-400">
                  {s.g}
                </td>
                <td className="px-1.5 py-3 text-right font-mono tabular-nums text-zinc-200">{s.a}</td>
                <td className="px-1 py-3 text-center">
                  <CardCount n={s.y} color="bg-amber-400" />
                </td>
                <td className="border-r border-zinc-800/60 px-1 py-3 pr-2 text-center">
                  <CardCount n={s.r} color="bg-red-500" />
                </td>
                <td className="px-1.5 py-3 pl-2 text-right font-mono tabular-nums text-zinc-400">
                  {s.min.toLocaleString('en-US')}
                </td>
                <td className="px-1.5 py-3 text-right font-mono tabular-nums text-zinc-400">
                  {minPerGoal(s.min, s.g)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-sm">
            <tr className="border-t border-white/10 font-semibold">
              <td className="px-1.5 py-3 text-[10px] uppercase tracking-wide text-zinc-400" colSpan={3}>
                {t('common.careerTotal')}
              </td>
              <td className="px-1.5 py-3 text-right font-mono tabular-nums text-zinc-200">{tot.mp}</td>
              <td className="px-1.5 py-3 text-right font-mono tabular-nums text-emerald-400">{tot.g}</td>
              <td className="px-1.5 py-3 text-right font-mono tabular-nums text-zinc-200">{tot.a}</td>
              <td className="px-1 py-3 text-center font-mono tabular-nums text-zinc-300">{tot.y}</td>
              <td className="border-r border-zinc-800/60 px-1 py-3 pr-2 text-center font-mono tabular-nums text-zinc-300">
                {tot.r || '–'}
              </td>
              <td className="px-1.5 py-3 pl-2 text-right font-mono tabular-nums text-zinc-300">
                {tot.min.toLocaleString('en-US')}
              </td>
              <td className="px-1.5 py-3 text-right font-mono tabular-nums text-zinc-300">
                {minPerGoal(tot.min, tot.g)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Tab 3 — Transfer History                                           */
/* ================================================================== */

function FeeBadge({ transfer }) {
  const { t } = useI18n()
  if (transfer.fee != null) {
    return (
      <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 font-display text-xs font-semibold tabular-nums text-emerald-400">
        {eurosLong(transfer.fee)}
      </span>
    )
  }
  const label =
    transfer.type === 'Free'
      ? t('common.free')
      : transfer.type === 'Loan'
        ? t('common.loan')
        : transfer.type || t('common.unknown')
  const cls =
    transfer.type === 'Loan'
      ? 'bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20'
      : transfer.type === 'Free'
        ? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20'
        : 'bg-white/5 text-zinc-400'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{label}</span>
}

function TransfersTab({ p }) {
  const { t } = useI18n()
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <CardLabel>{t('player.transferHistory')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">{t('player.transferSub')}</p>
        </div>
        <span className="text-[11px] tabular-nums text-zinc-500">
          {p.transfers.length} {t('player.moves')}
        </span>
      </div>

      {/* High-density transfer table — single source of truth */}
      <div className="mt-4 w-full rounded-xl border border-white/5">
        <table className="data-table w-full table-fixed">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[26%]" />
            <col className="w-[26%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/5 text-[9px] uppercase tracking-wide text-zinc-500">
              <th className="px-1.5 py-2 text-left font-medium">{t('player.date')}</th>
              <th className="px-1.5 py-2 text-left font-medium">{t('player.from')}</th>
              <th className="px-1.5 py-2 text-left font-medium">{t('player.to')}</th>
              <th className="px-1.5 py-2 text-right font-medium">
                <Tip label={t('player.mv')} align="right">
                  {t('player.mv')}
                </Tip>
              </th>
              <th className="px-1.5 py-2 text-right font-medium">{t('player.fee')}</th>
            </tr>
          </thead>
          <tbody>
            {p.transfers.map((t, i) => (
              <tr
                key={t.date + t.to + i}
                className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-1.5 py-2">
                  <p className="font-mono text-[11px] font-semibold tabular-nums text-zinc-100">
                    {t.year ?? t.date}
                  </p>
                  <p className="truncate text-[10px] text-zinc-500">{t.date}</p>
                </td>
                <td className="min-w-0 truncate px-1.5 py-2 text-zinc-400">{t.from}</td>
                <td className="min-w-0 truncate px-1.5 py-2 font-medium text-zinc-100">{t.to}</td>
                <td className="px-1.5 py-2 text-right font-mono tabular-nums text-zinc-400">
                  {formatMv(t.marketValue)}
                </td>
                <td className="px-1.5 py-2 text-right">
                  <FeeBadge transfer={t} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Tab 4 — Injury & Suspensions                                       */
/* ================================================================== */

function InjuryTab({ d }) {
  const { t } = useI18n()
  const rows = d.injuries ?? []
  const totals = useMemo(
    () =>
      rows.reduce(
        (a, r) => ({ days: a.days + r.days, matches: a.matches + r.matches }),
        { days: 0, matches: 0 },
      ),
    [rows],
  )

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <CardLabel>{t('player.injuryTitle')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">{t('player.injurySub')}</p>
        </div>
        {rows.length > 0 && (
          <p className="text-xs text-zinc-400">
            <span className="font-display font-semibold tabular-nums text-zinc-200">{totals.days}</span>{' '}
            {t('common.days')} ·{' '}
            <span className="font-display font-semibold tabular-nums text-zinc-200">{totals.matches}</span>{' '}
            {t('common.matches')}
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          {t('player.noInjuries')}
        </div>
      ) : (
        <div className="mt-3 w-full rounded-xl border border-white/5">
          <table className="data-table w-full table-fixed">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[28%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/5 text-[9px] uppercase tracking-wide text-zinc-500">
                <th className="px-1.5 py-2 text-left font-medium">{t('player.colSeason')}</th>
                <th className="px-1.5 py-2 text-left font-medium">{t('common.type')}</th>
                <th className="px-1.5 py-2 text-left font-medium">{t('player.from')}</th>
                <th className="px-1.5 py-2 text-left font-medium">{t('player.to')}</th>
                <th className="px-1.5 py-2 text-right font-medium">
                  <Tip label={t('player.tipDays')} align="right">{t('player.daysMissed')}</Tip>
                </th>
                <th className="px-1.5 py-2 text-right font-medium">
                  <Tip label={t('player.tipMatchesMissed')} align="right">{t('player.matchesMissed')}</Tip>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.season}-${r.type}-${i}`}
                  className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-1.5 py-1.5 font-mono tabular-nums text-zinc-100">{r.season}</td>
                  <td className="min-w-0 px-1.5 py-1.5">
                    <span className="flex min-w-0 items-center gap-1">
                      <span
                        className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                          r.kind === 'suspension'
                            ? 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/20'
                            : 'bg-red-400/15 text-red-300 ring-1 ring-red-400/20'
                        }`}
                      >
                        {r.kind === 'suspension' ? t('player.suspension') : t('player.injury')}
                      </span>
                      <span className="truncate text-zinc-200">{r.type}</span>
                    </span>
                  </td>
                  <td className="truncate px-1.5 py-1.5 font-mono tabular-nums text-[10px] text-zinc-400">{r.from}</td>
                  <td className="truncate px-1.5 py-1.5 font-mono tabular-nums text-[10px] text-zinc-400">{r.to}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono tabular-nums text-zinc-200">{r.days}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono tabular-nums text-zinc-200">{r.matches}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 bg-white/[0.02] font-semibold">
                <td className="px-1.5 py-2 text-[9px] uppercase tracking-wide text-zinc-400" colSpan={4}>
                  {t('common.total')}
                </td>
                <td className="px-1.5 py-2 text-right font-mono tabular-nums text-zinc-200">{totals.days}</td>
                <td className="px-1.5 py-2 text-right font-mono tabular-nums text-zinc-200">{totals.matches}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Tab 5 — National Team                                              */
/* ================================================================== */

function NationalTeamTab({ d }) {
  const { t } = useI18n()
  const nt = d.nationalTeam
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-sm bg-white/10 px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wide text-zinc-200">
              {nt.code}
            </span>
            <h3 className="font-display text-xl font-semibold text-white">{nt.name}</h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {t('common.debutAge')} {nt.debut} · {t('nation.coach')} {nt.coach}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
          <p className="font-display text-2xl font-semibold tabular-nums text-white">{nt.caps}</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            <Tip label={t('common.caps')}>{t('common.caps')}</Tip>
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
          <p className="font-display text-2xl font-semibold tabular-nums text-emerald-400">{nt.goals}</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">{t('player.goals')}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
          <p className="font-display text-2xl font-semibold tabular-nums text-zinc-100">{nt.assists ?? '–'}</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">{t('player.assists')}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
          <p className="font-display text-2xl font-semibold tabular-nums text-zinc-100">
            {(nt.minutes ?? 0).toLocaleString('en-US')}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">{t('common.minutes')}</p>
        </div>
      </div>

      {nt.seasons?.length > 0 && (
        <div>
          <CardLabel>{t('player.capsBySeason')}</CardLabel>
          <div className="mt-2 w-full rounded-xl border border-white/5">
            <table className="data-table w-full table-fixed">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[24%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-wide text-zinc-500">
                  <th className="px-1.5 py-1.5 text-left font-medium">{t('player.colSeason')}</th>
                  <th className="px-1.5 py-1.5 text-right font-medium">{t('common.caps')}</th>
                  <th className="px-1.5 py-1.5 text-right font-medium">{t('player.colG')}</th>
                  <th className="px-1.5 py-1.5 text-right font-medium">{t('player.colA')}</th>
                  <th className="px-1.5 py-1.5 text-right font-medium">{t('player.colMin')}</th>
                </tr>
              </thead>
              <tbody>
                {nt.seasons.map((s) => (
                  <tr key={s.season} className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]">
                    <td className="px-1.5 py-1.5 font-mono tabular-nums text-zinc-200">{s.season}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono tabular-nums text-zinc-300">{s.caps}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono font-semibold tabular-nums text-emerald-400">{s.goals}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono tabular-nums text-zinc-200">{s.assists}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono tabular-nums text-zinc-400">
                      {s.minutes.toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {nt.tournaments?.length > 0 && (
        <div>
          <CardLabel>{t('player.majorTournaments')}</CardLabel>
          <ul className="mt-2 space-y-2">
            {nt.tournaments.map((tour) => (
              <li
                key={tour.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/10"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">{tour.name}</p>
                  <p className="text-xs text-zinc-500">{tour.result}</p>
                </div>
                <div className="flex gap-4 text-right text-xs text-zinc-400">
                  <span>
                    <span className="tabular-nums text-zinc-200">{tour.caps}</span> {t('common.caps')}
                  </span>
                  <span>
                    <span className="tabular-nums text-emerald-400">{tour.goals}</span> {t('player.colG')}
                  </span>
                  <span>
                    <span className="tabular-nums text-zinc-200">{tour.assists}</span> {t('player.colA')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Sidebar — Algorithmic Breakdown                                    */
/* ================================================================== */

function SmartBar({ label, value, pct, note, tip }) {
  const width = useBarWidth(pct)
  return (
    <li>
      <div className="flex items-baseline justify-between gap-2">
        <Tip label={tip} align="left">
          <span className="text-[13px] font-medium text-zinc-200">{label}</span>
        </Tip>
        <span className="font-display text-xs font-semibold tabular-nums text-sky-300">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300 transition-[width] duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">{note}</p>
    </li>
  )
}

function AlgorithmBreakdown({ p, d }) {
  const { t } = useI18n()
  const s = d.smart
  const factors = [
    {
      label: t('smart.leagueCoeff'),
      value: `×${s.league.mult.toFixed(2)}`,
      pct: s.league.pct,
      note: translateSmartText(t, s.league.note),
      tip: t('smart.leagueCoeffTip'),
    },
    {
      label: t('smart.ageCurve'),
      value: translateSmartText(t, s.age.label),
      pct: s.age.pct,
      note: translateSmartText(t, s.age.note),
      tip: t('smart.ageCurveTip'),
    },
    {
      label: t('smart.matchRatings'),
      value: s.form.rating.toFixed(2),
      pct: s.form.pct,
      note: translateSmartText(t, s.form.note),
      tip: t('smart.matchRatingsTip'),
    },
    {
      label: t('smart.capMultiplier'),
      value: translateSmartText(t, s.nt.label),
      pct: s.nt.pct,
      note: translateSmartText(t, s.nt.note),
      tip: t('smart.capMultiplierTip'),
    },
  ]

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-sky-400/15 bg-gradient-to-br from-sky-500/[0.1] to-transparent p-5">
        <CardLabel>{t('player.algorithmicBreakdown')}</CardLabel>
        <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-emerald-400">
          {eurosLong(p.value)}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          {t('player.valuationSub')}
        </p>
      </div>
      <ul className="space-y-4 p-5">
        {factors.map((f) => (
          <SmartBar key={f.label} {...f} />
        ))}
      </ul>
      <div className="border-t border-white/5 px-5 py-3 text-[10px] text-zinc-600">
        {t('smart.weightsNote')}
      </div>
    </Card>
  )
}

function RelatedPlayers({ current, onOpenPlayer }) {
  const { t } = useI18n()
  const related = Object.values(PLAYERS)
    .filter((x) => x.id !== current.id)
    .sort((a, b) => Math.abs(a.value - current.value) - Math.abs(b.value - current.value))
    .slice(0, 4)

  return (
    <Card className="p-5">
      <CardLabel>{t('player.compare')}</CardLabel>
      <ul className="mt-4 space-y-1">
        {related.map((x) => {
          const diff = x.value - current.value
          return (
            <li key={x.id}>
              <button
                onClick={() => onOpenPlayer(x.id)}
                className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
              >
                <Avatar name={x.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-zinc-100 transition-colors group-hover:text-emerald-300">
                    {x.name}
                  </span>
                  <span className="block truncate text-xs text-zinc-400">
                    {x.position} · {x.club}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-display text-sm font-semibold tabular-nums text-emerald-400">
                    {euros(x.value)}
                  </span>
                  <span
                    className={`block text-[10px] font-semibold tabular-nums ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {diff >= 0 ? '+' : '−'}€{Math.abs(diff)}M
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

const TAB_IDS = [
  { id: 'overview', key: 'overview' },
  { id: 'stats', key: 'stats' },
  { id: 'transfers', key: 'transfers' },
  { id: 'injuries', key: 'injuries' },
  { id: 'national', key: 'national' },
]

export default function PlayerProfile({ player, onBack, onOpenPlayer, setView }) {
  const { t } = useI18n()
  const p = player
  const d = DETAILS[p.id]
  const [tab, setTab] = useState('overview')
  const [, bump] = useState(0)
  const view = setView || ((type, id) => type === 'player' && onOpenPlayer?.(id))

  useEffect(() => {
    setTab('overview')
  }, [p.id])

  // Lazy-load transfers + valuation history from warehouse
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await enrichPlayerFromWarehouse(p.id)
        if (!cancelled) bump((n) => n + 1)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [p.id])

  if (!d) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-zinc-400">{t('player.detailsUnavailable')}</p>
      </main>
    )
  }

  const tabs = TAB_IDS.map((x) => ({ id: x.id, label: t(`player.${x.key}`) }))

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

      <ProfileHero p={p} d={d} setView={view} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <div
            className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-white/5 p-1"
            role="tablist"
            aria-label={t('player.sections')}
          >
            {tabs.map((tb) => (
              <button
                key={tb.id}
                role="tab"
                aria-selected={tab === tb.id}
                onClick={() => setTab(tb.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm ${
                  tab === tb.id
                    ? 'bg-zinc-800 text-white shadow-sm shadow-black/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          <Card className="mt-4 p-5 sm:p-6">
            {tab === 'overview' && <OverviewTab p={p} d={d} />}
            {tab === 'stats' && <DetailedStatsTab d={d} />}
            {tab === 'transfers' && <TransfersTab p={p} />}
            {tab === 'injuries' && <InjuryTab d={d} />}
            {tab === 'national' && <NationalTeamTab d={d} />}
          </Card>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <AlgorithmBreakdown p={p} d={d} />
          <RelatedPlayers current={p} onOpenPlayer={(id) => view('player', id)} />
        </aside>
      </div>
    </main>
  )
}
