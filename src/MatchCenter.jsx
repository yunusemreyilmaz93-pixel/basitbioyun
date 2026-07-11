import { useMemo } from 'react'
import { Crest, Card, CardLabel } from './ui.jsx'
import { LEAGUE_CODE_TO_ID, LEAGUE_NAME_TO_ID } from './leagueData.js'
import { useI18n } from './i18n/I18nProvider.jsx'

/* ================================================================== */
/*  Icons & tiny primitives                                            */
/* ================================================================== */

function BallIcon({ className = 'size-3' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5l1.8 4.2H14L10.6 8.5l1.4 4.5L8 10.5 4 13l1.4-4.5L2 5.7h4.2L8 1.5z" opacity="0.9" />
    </svg>
  )
}

function CardIcon({ color = 'amber' }) {
  return (
    <span
      className={`inline-block h-3 w-2 rounded-[2px] ${color === 'red' ? 'bg-red-500' : 'bg-amber-400'} ring-1 ring-black/20`}
      aria-hidden="true"
    />
  )
}

function SubIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3 text-sky-300" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 11h7M7 7l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function shortName(name) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 10)
  return parts[parts.length - 1].slice(0, 10)
}

function ratingFor(player, matchId) {
  if (player.rating != null) return +Number(player.rating).toFixed(1)
  const h = hashStr(`${matchId}:${player.name}:${player.shirt}`)
  // 5.8 – 9.1 range, slightly reward known stars
  const boost = player.playerId ? 0.4 : 0
  return +Math.min(9.1, Math.max(5.8, 5.8 + (h % 320) / 100 + boost)).toFixed(1)
}

function ratingTone(r) {
  if (r >= 8.0) return 'excellent'
  if (r >= 7.0) return 'good'
  if (r >= 6.5) return 'avg'
  return 'poor'
}

function RatingBadge({ rating, size = 'sm' }) {
  const tone = ratingTone(rating)
  const cls = {
    excellent: 'bg-emerald-400 text-zinc-950 shadow-[0_0_10px_rgba(52,211,153,0.55)] ring-emerald-300/50',
    good: 'bg-emerald-400/20 text-emerald-300 ring-emerald-400/35',
    avg: 'bg-zinc-700/80 text-zinc-200 ring-white/15',
    poor: 'bg-zinc-800 text-zinc-500 ring-white/10',
  }[tone]
  const sz = size === 'xs' ? 'min-w-[1.35rem] px-0.5 text-[9px]' : 'min-w-[1.5rem] px-1 text-[10px]'
  return (
    <span
      className={`inline-flex items-center justify-center rounded font-display font-bold tabular-nums ring-1 ${sz} ${cls}`}
    >
      {rating.toFixed(1)}
    </span>
  )
}

/* Pitch coordinates by position group — side: home (bottom half) | away (top half) */
function pitchCoords(pos, side, indexInGroup) {
  const p = (pos || 'CM').toUpperCase()
  // x 8–92, y: home 52–94 (attacking up), away 6–48 (attacking down)
  const mapHome = {
    GK: [[50, 92]],
    CB: [[38, 80], [62, 80], [50, 82]],
    LB: [[14, 78]],
    RB: [[86, 78]],
    LWB: [[12, 72]],
    RWB: [[88, 72]],
    DM: [[38, 68], [62, 68], [50, 70]],
    CM: [[32, 62], [50, 60], [68, 62]],
    AM: [[50, 54]],
    LM: [[16, 58]],
    RM: [[84, 58]],
    LW: [[18, 52]],
    RW: [[82, 52]],
    ST: [[50, 48]],
    CF: [[50, 48]],
    FW: [[40, 50], [60, 50]],
  }
  const key =
    mapHome[p] ? p
    : /GK/.test(p) ? 'GK'
    : /LB|LWB/.test(p) ? 'LB'
    : /RB|RWB/.test(p) ? 'RB'
    : /CB|SW/.test(p) ? 'CB'
    : /DM|CDM/.test(p) ? 'DM'
    : /AM|CAM|SS/.test(p) ? 'AM'
    : /LW|LM/.test(p) ? 'LW'
    : /RW|RM/.test(p) ? 'RW'
    : /ST|CF|FW/.test(p) ? 'ST'
    : 'CM'
  const slots = mapHome[key] || mapHome.CM
  const [x, yHome] = slots[indexInGroup % slots.length]
  if (side === 'home') return { x, y: yHome }
  // Mirror away onto top half
  return { x, y: 100 - yHome }
}

const CORE_STAT_DEFS = [
  { key: 'possession', labelKey: 'match.possession', fallback: [55, 45], unit: '%', decimals: 0 },
  { key: 'xg', labelKey: 'match.xg', fallback: [1.5, 1.0], unit: '', decimals: 2 },
  { key: 'shots', labelKey: 'match.totalShots', fallback: [12, 9], unit: '', decimals: 0 },
  { key: 'sot', labelKey: 'match.shotsOnTarget', fallback: [5, 3], unit: '', decimals: 0 },
  { key: 'freekicks', labelKey: 'match.freekicks', fallback: [11, 9], unit: '', decimals: 0 },
  { key: 'corners', labelKey: 'match.corners', fallback: [5, 4], unit: '', decimals: 0 },
  { key: 'bigChances', labelKey: 'match.bigChances', fallback: [3, 2], unit: '', decimals: 0 },
]

function buildCoreStats(match, t) {
  const byKey = Object.fromEntries((match.stats || []).map((s) => [s.key, s]))
  return CORE_STAT_DEFS.map((def) => {
    const label = t(def.labelKey)
    const raw = byKey[def.key]
    if (raw) {
      return {
        key: def.key,
        label,
        home: raw.home,
        away: raw.away,
        unit: raw.unit ?? def.unit,
        decimals: raw.decimals ?? def.decimals,
      }
    }
    return {
      key: def.key,
      label,
      home: def.fallback[0],
      away: def.fallback[1],
      unit: def.unit,
      decimals: def.decimals,
    }
  })
}

/** SofaScore-style momentum bars from events + match seed */
function buildMomentum(match, buckets = 45) {
  const seed = hashStr(match.id || 'match')
  const bars = Array.from({ length: buckets }, (_, i) => {
    const t = (i / (buckets - 1)) * 90
    let v = ((Math.sin(i * 0.55 + seed) + Math.cos(i * 0.31)) * 0.35)
    // Bias by possession if available
    const poss = (match.stats || []).find((s) => s.key === 'possession')
    if (poss) v += (poss.home - 50) / 80
    return { t, v: 0, minute: Math.round(t) }
  })

  // Apply event spikes
  for (const e of match.events || []) {
    if (e.minute == null || e.team === 'neutral') continue
    const idx = Math.min(buckets - 1, Math.max(0, Math.round((e.minute / 90) * (buckets - 1))))
    const amp = e.type === 'goal' ? 1.1 : e.type === 'yellow' || e.type === 'red' ? 0.35 : e.type === 'sub' ? 0.2 : 0.15
    const sign = e.team === 'home' ? 1 : -1
    bars[idx].v += sign * amp
    if (idx > 0) bars[idx - 1].v += sign * amp * 0.45
    if (idx < buckets - 1) bars[idx + 1].v += sign * amp * 0.45
  }

  // Normalize to -1..1 with slight noise fill
  let max = 0.35
  for (const b of bars) {
    b.v += ((hashStr(`${match.id}:${b.minute}`) % 20) - 10) / 80
    max = Math.max(max, Math.abs(b.v))
  }
  return bars.map((b) => ({ ...b, v: Math.max(-1, Math.min(1, b.v / max)) }))
}

/* ================================================================== */
/*  1 — Scoreboard Command Bar                                         */
/* ================================================================== */

function StatusBadge({ match }) {
  const { t } = useI18n()
  if (match.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/15 px-2 py-0.5 text-[11px] font-bold tabular-nums text-red-400 ring-1 ring-red-500/30">
        <span className="size-1.5 rounded-full bg-red-500 animate-value-pulse" aria-hidden="true" />
        {t('common.live').toUpperCase()} {match.clock}
      </span>
    )
  }
  if (match.status === 'ft') {
    return (
      <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-white/10">
        {t('common.ft')}
      </span>
    )
  }
  return (
    <span className="rounded-md bg-sky-400/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-sky-300 ring-1 ring-sky-400/25">
      {match.kickoff || t('common.upcoming')}
    </span>
  )
}

function TeamCommand({ team, align, onOpenClub }) {
  const clickable = Boolean(team.clubId && onOpenClub)
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onOpenClub(team.clubId)}
      className={`flex min-w-0 flex-1 items-center gap-2.5 ${align === 'right' ? 'flex-row-reverse text-right' : 'text-left'} ${
        clickable ? 'group' : 'cursor-default'
      }`}
    >
      <Crest code={team.short} size="md" />
      <div className="min-w-0">
        <p
          className={`truncate font-display text-sm font-semibold text-white sm:text-base ${
            clickable ? 'transition-colors group-hover:text-emerald-300' : ''
          }`}
        >
          {team.name}
        </p>
        <p className="text-[10px] tabular-nums text-zinc-500">{team.formation}</p>
      </div>
    </button>
  )
}

function ScoreboardHeader({ match, onOpenClub, setView }) {
  const { t } = useI18n()
  const leagueId =
    match.leagueId || LEAGUE_CODE_TO_ID[match.leagueCode] || LEAGUE_NAME_TO_ID[match.league] || null
  const att = match.venue?.attendance
  const cap = match.venue?.capacity

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/60 px-3 py-3 sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
        <button
          type="button"
          disabled={!leagueId}
          onClick={() => leagueId && setView?.('league', leagueId)}
          className={`rounded bg-white/10 px-1.5 py-0.5 font-display font-bold text-zinc-200 ${
            leagueId ? 'hover:bg-sky-500/15 hover:text-sky-300' : ''
          }`}
        >
          {match.leagueCode}
        </button>
        <button
          type="button"
          disabled={!leagueId}
          onClick={() => leagueId && setView?.('league', leagueId)}
          className={`text-zinc-400 ${leagueId ? 'hover:text-sky-300' : ''}`}
        >
          {match.league}
        </button>
        {match.matchday != null && (
          <span className="text-zinc-600">
            {t('match.md')} {match.matchday}
          </span>
        )}
        <StatusBadge match={match} />
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <TeamCommand team={match.home} align="left" onOpenClub={onOpenClub} />
        <div className="flex flex-col items-center px-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-display text-3xl font-bold tabular-nums tracking-tight text-white sm:text-4xl">
              {match.home.score != null ? match.home.score : '–'}
            </span>
            <span className="font-display text-xl font-semibold text-zinc-600">–</span>
            <span className="font-display text-3xl font-bold tabular-nums tracking-tight text-white sm:text-4xl">
              {match.away.score != null ? match.away.score : '–'}
            </span>
          </div>
        </div>
        <TeamCommand team={match.away} align="right" onOpenClub={onOpenClub} />
      </div>

      {/* Scorers strip */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-white/5 pt-2 text-[11px]">
        <div className="space-y-0.5">
          {(match.scorers?.home || []).map((s, i) => (
            <p key={`hs-${i}`} className="truncate text-zinc-400">
              <span className="text-emerald-400">⚽</span> {s.name}{' '}
              <span className="tabular-nums text-zinc-600">{s.minute}</span>
            </p>
          ))}
        </div>
        <div className="space-y-0.5 text-right">
          {(match.scorers?.away || []).map((s, i) => (
            <p key={`as-${i}`} className="truncate text-zinc-400">
              <span className="tabular-nums text-zinc-600">{s.minute}</span> {s.name}{' '}
              <span className="text-emerald-400">⚽</span>
            </p>
          ))}
        </div>
      </div>

      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 border-t border-white/5 pt-2 text-[11px] text-zinc-500">
        <span>
          {match.venue?.stadium}
          {match.venue?.city ? ` · ${match.venue.city}` : ''}
        </span>
        <span className="tabular-nums">
          {t('match.att')} {att != null ? att.toLocaleString('en-US') : '—'}
          {cap != null ? ` / ${cap.toLocaleString('en-US')}` : ''}
        </span>
        <span>
          {t('match.ref')}{' '}
          <span className="text-zinc-300">{match.referee?.name || 'TBD'}</span>
          {match.referee?.nation && (
            <span className="ml-1 rounded bg-white/5 px-1 font-display text-[9px] font-bold text-zinc-500">
              {match.referee.nation}
            </span>
          )}
        </span>
      </p>
    </section>
  )
}

/* ================================================================== */
/*  2a — Attack Momentum (fintech chart)                               */
/* ================================================================== */

function AttackMomentum({ match }) {
  const { t } = useI18n()
  const bars = useMemo(() => buildMomentum(match), [match])

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-2.5 sm:p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{t('match.attackMomentum')}</p>
          <p className="text-[10px] text-zinc-600">{t('match.pressureFlow')}</p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-semibold">
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="size-1.5 rounded-sm bg-emerald-400" /> {match.home.short}
          </span>
          <span className="inline-flex items-center gap-1 text-sky-400">
            <span className="size-1.5 rounded-sm bg-sky-400" /> {match.away.short}
          </span>
        </div>
      </div>

      <div className="relative h-28 w-full overflow-hidden rounded-lg bg-zinc-950/80 ring-1 ring-white/5">
        {/* zero line */}
        <div className="absolute inset-x-0 top-1/2 z-10 h-px bg-white/15" aria-hidden="true" />
        {/* grid */}
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          {[25, 50, 75].map((p) => (
            <div key={p} className="absolute bottom-0 top-0 w-px bg-white/10" style={{ left: `${p}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-stretch gap-px px-0.5 py-1">
          {bars.map((b, i) => {
            const up = b.v >= 0
            const h = Math.max(4, Math.abs(b.v) * 48)
            return (
              <div key={i} className="relative flex min-w-0 flex-1 flex-col items-center justify-center">
                {up ? (
                  <div
                    className="absolute bottom-1/2 w-full max-w-[6px] rounded-t-sm bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.35)]"
                    style={{ height: `${h}%` }}
                    title={`${b.minute}' home pressure`}
                  />
                ) : (
                  <div
                    className="absolute top-1/2 w-full max-w-[6px] rounded-b-sm bg-gradient-to-b from-sky-400 to-sky-600 shadow-[0_0_6px_rgba(56,189,248,0.3)]"
                    style={{ height: `${h}%` }}
                    title={`${b.minute}' away pressure`}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="pointer-events-none absolute inset-x-1 bottom-0.5 flex justify-between text-[8px] tabular-nums text-zinc-600">
          <span>0′</span>
          <span>45′</span>
          <span>90′</span>
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  2b — Core match stats                                              */
/* ================================================================== */

function StatCompareRow({ stat }) {
  const total = (stat.home || 0) + (stat.away || 0) || 1
  const homePct = ((stat.home || 0) / total) * 100
  const awayPct = ((stat.away || 0) / total) * 100
  const homeWins = (stat.home || 0) > (stat.away || 0)
  const awayWins = (stat.away || 0) > (stat.home || 0)
  const fmt = (v) =>
    stat.decimals ? Number(v).toFixed(stat.decimals) : Number(v).toLocaleString('en-US')

  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
        <span
          className={`font-display font-bold tabular-nums ${homeWins ? 'text-white' : 'text-zinc-500'}`}
        >
          {fmt(stat.home)}
          {stat.unit === '%' ? '%' : ''}
        </span>
        <span className="text-center text-[10px] font-medium text-zinc-500">{stat.label}</span>
        <span
          className={`font-display font-bold tabular-nums ${awayWins ? 'text-white' : 'text-zinc-500'}`}
        >
          {fmt(stat.away)}
          {stat.unit === '%' ? '%' : ''}
        </span>
      </div>
      <div className="flex h-1.5 gap-0.5">
        <div className="flex flex-1 justify-end overflow-hidden rounded-l-full bg-white/[0.04]">
          <div
            className={`h-full rounded-l-full ${homeWins ? 'bg-emerald-400' : 'bg-zinc-600'}`}
            style={{ width: `${homePct}%` }}
          />
        </div>
        <div className="flex flex-1 overflow-hidden rounded-r-full bg-white/[0.04]">
          <div
            className={`h-full rounded-r-full ${awayWins ? 'bg-sky-400' : 'bg-zinc-600'}`}
            style={{ width: `${awayPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function CoreStats({ match }) {
  const { t } = useI18n()
  const stats = useMemo(() => buildCoreStats(match, t), [match, t])
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-2.5 sm:p-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {t('match.coreStats')}
      </p>
      <div className="divide-y divide-white/5">
        {stats.map((s) => (
          <StatCompareRow key={s.key} stat={s} />
        ))}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  2c — Dual tactical pitch                                           */
/* ================================================================== */

function PlayerNode({ player, side, setView, matchId }) {
  const rating = ratingFor(player, matchId)
  const can = Boolean(player.playerId && setView)
  const open = () => can && setView('player', player.playerId)

  return (
    <button
      type="button"
      disabled={!can}
      onClick={open}
      className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${can ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ left: `${player._x}%`, top: `${player._y}%` }}
      title={`${player.name} · ${player.pos} · ${rating.toFixed(1)}`}
    >
      <span className="group flex flex-col items-center gap-0.5">
        <span className="relative">
          <span
            className={`flex size-7 items-center justify-center rounded-full border bg-zinc-950/90 font-display text-[10px] font-bold shadow-lg shadow-black/50 ring-2 transition-transform group-hover:scale-110 sm:size-8 sm:text-[11px] ${
              side === 'home'
                ? 'border-emerald-400/50 text-emerald-300 ring-emerald-400/25'
                : 'border-sky-400/50 text-sky-300 ring-sky-400/25'
            }`}
          >
            {player.shirt}
          </span>
          <span className="absolute -bottom-1 -right-1.5">
            <RatingBadge rating={rating} size="xs" />
          </span>
          {player.captain && (
            <span className="absolute -left-1 -top-1 flex size-3 items-center justify-center rounded bg-amber-400/90 font-display text-[7px] font-bold text-zinc-950">
              C
            </span>
          )}
        </span>
        <span className="max-w-[3.6rem] truncate rounded bg-zinc-950/85 px-1 py-px text-center text-[9px] font-medium leading-tight text-zinc-100 ring-1 ring-white/10 sm:max-w-[4.2rem] sm:text-[10px]">
          {shortName(player.name)}
        </span>
      </span>
    </button>
  )
}

function DualTacticalPitch({ match, setView }) {
  const { t } = useI18n()
  const { homePlayers, awayPlayers } = useMemo(() => {
    const place = (list, side) => {
      const groupCount = {}
      return (list || []).map((p) => {
        const key = (p.pos || 'CM').toUpperCase()
        const idx = groupCount[key] || 0
        groupCount[key] = idx + 1
        const { x, y } = pitchCoords(p.pos, side, idx)
        return { ...p, _x: x, _y: y }
      })
    }
    return {
      homePlayers: place(match.lineups?.home?.starting, 'home'),
      awayPlayers: place(match.lineups?.away?.starting, 'away'),
    }
  }, [match])

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/60 sm:min-h-[480px]">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Crest code={match.away.short} size="xs" />
          <span className="text-[11px] font-semibold text-zinc-200">{match.away.short}</span>
          <span className="text-[10px] text-zinc-600">{match.away.formation}</span>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          {t('match.tacticalPitch')}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-600">{match.home.formation}</span>
          <span className="text-[11px] font-semibold text-zinc-200">{match.home.short}</span>
          <Crest code={match.home.short} size="xs" />
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-gradient-to-b from-[#0a2e1c] via-[#0d3a24] to-[#0a2e1c]">
        {/* Pitch markings */}
        <div className="pointer-events-none absolute inset-2 rounded-md border border-white/20 sm:inset-3" aria-hidden="true">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/25" />
          <div className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 sm:size-16" />
          <div className="absolute left-1/2 top-0 h-10 w-[38%] -translate-x-1/2 border border-t-0 border-white/20 sm:h-12" />
          <div className="absolute bottom-0 left-1/2 h-10 w-[38%] -translate-x-1/2 border border-b-0 border-white/20 sm:h-12" />
          <div className="absolute left-1/2 top-0 h-4 w-[18%] -translate-x-1/2 border border-t-0 border-white/15" />
          <div className="absolute bottom-0 left-1/2 h-4 w-[18%] -translate-x-1/2 border border-b-0 border-white/15" />
        </div>
        {/* Soft side tints */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-sky-400/[0.03]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-emerald-400/[0.04]" aria-hidden="true" />

        {awayPlayers.map((p) => (
          <PlayerNode
            key={`a-${p.shirt}-${p.name}`}
            player={p}
            side="away"
            setView={setView}
            matchId={match.id}
          />
        ))}
        {homePlayers.map((p) => (
          <PlayerNode
            key={`h-${p.shirt}-${p.name}`}
            player={p}
            side="home"
            setView={setView}
            matchId={match.id}
          />
        ))}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  3a — Substitutes & managers                                        */
/* ================================================================== */

function BenchTable({ team, lineup, match, setView, side }) {
  const { t } = useI18n()
  const subbedInNames = useMemo(() => {
    const set = new Set()
    for (const e of match.events || []) {
      if (e.type === 'sub' && e.team === side && e.playerIn) set.add(e.playerIn)
    }
    return set
  }, [match.events, side])

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Crest code={team.short} size="xs" />
        <span className="text-[11px] font-semibold text-zinc-200">{team.short}</span>
        <span className="text-[10px] text-zinc-600">{t('match.bench')}</span>
      </div>
      <ul className="space-y-0.5">
        {(lineup?.bench || []).map((p) => {
          const played = [...subbedInNames].some(
            (n) => n === p.name || shortName(n) === shortName(p.name) || n.includes(shortName(p.name)),
          )
          const rating = played ? ratingFor(p, match.id) : null
          const can = Boolean(p.playerId && setView)
          return (
            <li key={`b-${team.short}-${p.shirt}-${p.name}`}>
              <button
                type="button"
                disabled={!can}
                onClick={() => can && setView('player', p.playerId)}
                className={`flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-[11px] ${
                  can ? 'hover:bg-white/5' : 'cursor-default'
                }`}
              >
                <span className="w-5 shrink-0 font-display text-[10px] font-bold tabular-nums text-zinc-500">
                  {p.shirt}
                </span>
                <span className="min-w-0 flex-1 truncate text-zinc-300">{p.name}</span>
                <span className="shrink-0 text-[9px] text-zinc-600">{p.pos}</span>
                {rating != null ? (
                  <RatingBadge rating={rating} size="xs" />
                ) : (
                  <span className="w-6 text-center text-[9px] text-zinc-700">–</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 border-t border-white/5 pt-1.5 text-[10px] text-zinc-500">
        {t('match.manager')}{' '}
        <span className="font-medium text-zinc-300">{team.manager || '—'}</span>
      </p>
    </div>
  )
}

function SubsManagers({ match, setView }) {
  const { t } = useI18n()
  return (
    <Card className="p-3">
      <CardLabel>{t('match.substitutes')}</CardLabel>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BenchTable
          team={match.home}
          lineup={match.lineups?.home}
          match={match}
          setView={setView}
          side="home"
        />
        <BenchTable
          team={match.away}
          lineup={match.lineups?.away}
          match={match}
          setView={setView}
          side="away"
        />
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  3b — Horizontal match timeline                                     */
/* ================================================================== */

function HorizontalTimeline({ match, setView }) {
  const { t } = useI18n()
  const nodes = useMemo(() => {
    return (match.events || [])
      .filter((e) => e.type === 'goal' || e.type === 'yellow' || e.type === 'red' || e.type === 'sub')
      .map((e, i) => ({
        ...e,
        key: `${e.minute}-${e.type}-${e.player || e.playerIn || i}`,
        pct: Math.min(98, Math.max(2, ((e.minute || 0) / 90) * 100)),
      }))
  }, [match.events])

  const icon = (e) => {
    if (e.type === 'goal') return <BallIcon className="size-3 text-emerald-300" />
    if (e.type === 'yellow') return <CardIcon color="amber" />
    if (e.type === 'red') return <CardIcon color="red" />
    return <SubIcon />
  }

  const tip = (e) => {
    if (e.type === 'goal') return `${e.minute}' ⚽ ${e.player}${e.score ? ` (${e.score})` : ''}`
    if (e.type === 'sub') return `${e.minute}' ⇄ ${e.playerIn} → ${e.playerOut}`
    if (e.type === 'yellow') return `${e.minute}' ▮ ${e.player}`
    if (e.type === 'red') return `${e.minute}' ▮ ${e.player}`
    return `${e.minute}'`
  }

  return (
    <Card className="p-3 sm:p-4">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <CardLabel>{t('match.timeline')}</CardLabel>
          <p className="mt-0.5 text-[10px] text-zinc-500">{t('match.timelineSub')}</p>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-zinc-500">
          <span className="inline-flex items-center gap-0.5">⚽ {t('match.goal')}</span>
          <span className="inline-flex items-center gap-0.5">▮ {t('match.card')}</span>
          <span className="inline-flex items-center gap-0.5">⇄ {t('match.sub')}</span>
        </div>
      </div>

      <div className="relative mx-1 h-14">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-white/10" />
        <div className="absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-zinc-500" />
        <div className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-zinc-500" />
        {/* HT marker */}
        <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-white/25" />
        <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[8px] font-semibold text-zinc-600">
          HT
        </span>

        {nodes.map((e) => {
          const isHome = e.team === 'home'
          const can =
            (e.playerId && setView) || (e.playerInId && setView)
          return (
            <button
              key={e.key}
              type="button"
              title={tip(e)}
              disabled={!can}
              onClick={() => {
                if (e.playerId) setView?.('player', e.playerId)
                else if (e.playerInId) setView?.('player', e.playerInId)
              }}
              className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center ${
                isHome ? 'top-[28%]' : 'top-[72%]'
              } ${can ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ left: `${e.pct}%` }}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full ring-1 ${
                  e.type === 'goal'
                    ? 'bg-emerald-400/15 ring-emerald-400/40'
                    : e.type === 'yellow'
                      ? 'bg-amber-400/15 ring-amber-400/40'
                      : e.type === 'red'
                        ? 'bg-red-500/15 ring-red-500/40'
                        : 'bg-sky-400/15 ring-sky-400/40'
                }`}
              >
                {icon(e)}
              </span>
              <span className="mt-0.5 font-display text-[8px] font-bold tabular-nums text-zinc-500">
                {e.minute}′
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-1 flex justify-between px-0.5 text-[9px] tabular-nums text-zinc-600">
        <span>0′</span>
        <span>45′</span>
        <span>90′</span>
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function MatchCenter({ match, onBack, onOpenPlayer, onOpenClub, setView }) {
  const { t } = useI18n()

  if (!match) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-zinc-400">{t('match.unavailable')}</p>
      </main>
    )
  }

  const view = setView || (() => {})
  const openPlayer = (id) => (setView ? setView('player', id) : onOpenPlayer?.(id))
  const openClub = (id) => (setView ? setView('club', id) : onOpenClub?.(id))

  // Bridge openPlayer for timeline/pitch when only setView is used
  const setViewBridge = (v, id) => {
    if (v === 'player') openPlayer(id)
    else if (v === 'club') openClub(id)
    else if (v === 'league') view(v, id)
    else view(v, id)
  }

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t('match.back')}
      </button>

      {/* 1 — Command bar scoreboard */}
      <ScoreboardHeader match={match} onOpenClub={openClub} setView={setViewBridge} />

      {/* 2 — Pulse + pitch */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="flex min-w-0 flex-col gap-3 lg:col-span-2">
          <AttackMomentum match={match} />
          <CoreStats match={match} />
        </div>
        <div className="min-w-0 lg:col-span-3">
          <DualTacticalPitch match={match} setView={setViewBridge} />
        </div>
      </div>

      {/* 3 — Bench + horizontal timeline */}
      <div className="mt-3 space-y-3">
        <SubsManagers match={match} setView={setViewBridge} />
        <HorizontalTimeline match={match} setView={setViewBridge} />
      </div>
    </main>
  )
}
