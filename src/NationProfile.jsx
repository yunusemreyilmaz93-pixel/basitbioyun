import { Avatar, Crest, Card, CardLabel, euros, ScoreBadge } from './ui.jsx'
import { useI18n } from './i18n/I18nProvider.jsx'
import { Flag } from './ui/Flag.jsx'

/* ================================================================== */
/*  Shared                                                             */
/* ================================================================== */

const SQUAD_GROUPS = [
  { key: 'GK', label: 'Goalkeepers' },
  { key: 'DEF', label: 'Defenders' },
  { key: 'MID', label: 'Midfielders' },
  { key: 'FWD', label: 'Forwards' },
]

function formatBn(v) {
  if (!v) return '—'
  return `€${v.toFixed(2)}bn`
}

function FlagBadge({ code, name, large = false }) {
  const size = large ? 80 : 40
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/15 ${
        large ? 'size-20 sm:size-24' : 'size-10'
      }`}
    >
      <Flag code={code} name={name} size={size} className="size-full rounded-2xl object-cover" />
    </div>
  )
}

function ColorSwatch({ hex, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.02] px-2 py-1">
      <span className="size-3 rounded-full ring-1 ring-white/20" style={{ background: hex }} aria-hidden="true" />
      <span className="font-mono text-[10px] tabular-nums text-zinc-400">{hex}</span>
      <span className="text-[10px] text-zinc-600">{label}</span>
    </span>
  )
}

/* Mini FIFA ranking sparkline */
function RankSparkline({ history }) {
  const { t } = useI18n()
  if (!history?.length) return null
  const W = 160
  const H = 40
  const ranks = history.map((h) => h.rank)
  const minR = Math.min(...ranks)
  const maxR = Math.max(...ranks)
  const span = Math.max(1, maxR - minR)
  // lower rank number = better → invert y
  const pts = history.map((h, i) => {
    const x = history.length === 1 ? W / 2 : (i / (history.length - 1)) * (W - 8) + 4
    const y = 4 + ((h.rank - minR) / span) * (H - 12)
    return [x, y]
  })
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const latest = history[history.length - 1]
  const prev = history[history.length - 2]
  const delta = prev ? prev.rank - latest.rank : 0

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{t('nation.fifaRank')}</p>
        {delta !== 0 && (
          <span className={`text-[10px] font-semibold tabular-nums ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {delta > 0 ? '↑' : '↓'}
            {Math.abs(delta)}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-end gap-2">
        <p className="font-display text-2xl font-bold tabular-nums text-sky-300">#{latest.rank}</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="mb-1 h-8 w-28" aria-hidden="true">
          <path d={line} fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 2.5 : 1.5} fill={i === pts.length - 1 ? '#38bdf8' : '#52525b'} />
          ))}
        </svg>
      </div>
      <p className="text-[10px] text-zinc-600">
        {history[0].year}–{latest.year}
      </p>
    </div>
  )
}

/* ================================================================== */
/*  1 — Header                                                         */
/* ================================================================== */

function NationHeader({ nation, setView }) {
  const { t } = useI18n()
  const a =
    nation.association && typeof nation.association === 'object'
      ? {
          name: nation.association.name || nation.name,
          short: nation.association.short || nation.code,
          founded: nation.association.founded,
          address: nation.association.address || '',
          colors: nation.association.colors || nation.colors || {
            primary: '#3f3f46',
            secondary: '#27272a',
            tertiary: '#18181b',
          },
        }
      : {
          name: typeof nation.association === 'string' ? nation.association : nation.name,
          short: nation.code,
          founded: null,
          address: '',
          colors: nation.colors || {
            primary: '#3f3f46',
            secondary: '#27272a',
            tertiary: '#18181b',
          },
        }
  const coach = nation.coach || { name: '—' }
  const stadium = nation.stadium || { name: '—', capacity: 0, city: '—' }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 p-5 backdrop-blur-md sm:p-7">
      <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-sky-400/[0.06] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-12 bottom-0 size-56 rounded-full bg-emerald-400/[0.05] blur-3xl" aria-hidden="true" />

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex min-w-0 gap-4 sm:gap-5">
          <FlagBadge code={nation.code} name={nation.name} large />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 font-display text-[10px] font-bold tracking-wide text-sky-300">
                {a.short}
              </span>
              <span className="text-xs text-zinc-400">{nation.confederation}</span>
              {a.founded != null && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="text-xs text-zinc-500">
                    {t('common.est')} {a.founded}
                  </span>
                </>
              )}
            </div>
            <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {nation.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">{a.name}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <ColorSwatch hex={a.colors.primary || '#3f3f46'} label="pri" />
              <ColorSwatch hex={a.colors.secondary || '#27272a'} label="sec" />
              <ColorSwatch hex={a.colors.tertiary || '#18181b'} label="ter" />
            </div>

            {a.address ? (
              <p className="mt-3 max-w-md text-xs leading-relaxed text-zinc-500">{a.address}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-end gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {t('nation.squadValue')}
                </p>
                <p className="mt-0.5 font-display text-3xl font-bold tabular-nums text-emerald-400">
                  {formatBn(nation.squadValue)}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">{t('club.nationalStadium')}</p>
                <p className="text-sm font-medium text-zinc-100">{stadium.name || '—'}</p>
                <p className="text-[11px] tabular-nums text-zinc-500">
                  {stadium.capacity > 0
                    ? `${stadium.capacity.toLocaleString('en-US')} · ${stadium.city || ''}`
                    : stadium.city || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {nation.fifaRank != null && <RankSparkline history={nation.rankingHistory} />}
          <Card className="p-4">
            <CardLabel>{t('nation.headCoach')}</CardLabel>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={coach.name} size="md" ring />
              <div className="min-w-0">
                {coach.managerId ? (
                  <button
                    type="button"
                    onClick={() => setView('manager', coach.managerId)}
                    className="font-display text-base font-semibold text-white transition-colors hover:text-sky-300"
                  >
                    {coach.name}
                  </button>
                ) : (
                  <p className="font-display text-base font-semibold text-white">{coach.name}</p>
                )}
                <p className="text-xs text-zinc-500">
                  {coach.since ?? t('common.unknown')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  2 — Squad directory                                                */
/* ================================================================== */

function SquadGroup({ label, players, setView }) {
  const { t } = useI18n()
  if (!players?.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-zinc-600">
        {label} — {t('nation.noData')}
      </div>
    )
  }

  const total = players.reduce((a, p) => a + (p.value || 0), 0)

  return (
    <div className="overflow-hidden rounded-xl border border-white/5">
      <div className="flex items-center justify-between bg-white/[0.02] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{label}</span>
        <span className="font-display text-xs font-semibold tabular-nums text-emerald-400">{euros(total)}</span>
      </div>
      <div className="w-full">
        <table className="data-table w-full table-fixed">
          <colgroup>
            <col className="w-[8%]" />
            <col className="w-[30%]" />
            <col className="w-[10%]" />
            <col className="w-[26%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-t border-white/5 text-[9px] uppercase tracking-wide text-zinc-500">
              <th className="px-1 py-1.5 text-left font-medium">{t('common.rank')}</th>
              <th className="px-1 py-1.5 text-left font-medium">{t('hubs.tablePlayer')}</th>
              <th className="px-1 py-1.5 text-right font-medium">{t('common.age')}</th>
              <th className="px-1 py-1.5 text-left font-medium">{t('hubs.tableClub')}</th>
              <th className="px-1 py-1.5 text-left font-medium">{t('hubs.tableCtr')}</th>
              <th className="px-1 py-1.5 text-right font-medium">{t('common.smv')}</th>
            </tr>
          </thead>
          <tbody>
            {players.map((pl) => (
              <tr
                key={`${label}-${pl.shirt}-${pl.name}`}
                className="odd:bg-zinc-900/30 border-t border-white/5 transition-colors hover:bg-emerald-400/[0.04]"
              >
                <td className="px-1 py-1.5 font-mono text-[11px] font-semibold tabular-nums text-zinc-500">
                  {pl.shirt}
                </td>
                <td className="min-w-0 px-1 py-1.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Avatar name={pl.name} size="xs" />
                    <button
                      type="button"
                      disabled={!pl.playerId}
                      onClick={() => pl.playerId && setView('player', pl.playerId)}
                      className={`truncate text-[11px] font-medium text-zinc-100 ${
                        pl.playerId ? 'transition-colors hover:text-emerald-300' : ''
                      }`}
                    >
                      {pl.name}
                    </button>
                  </div>
                </td>
                <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">{pl.age}</td>
                <td className="min-w-0 px-1 py-1.5">
                  <button
                    type="button"
                    disabled={!pl.clubId}
                    onClick={() => pl.clubId && setView('club', pl.clubId)}
                    className={`inline-flex w-full min-w-0 items-center gap-1 text-left ${
                      pl.clubId ? 'group cursor-pointer' : ''
                    }`}
                  >
                    {pl.clubCode !== '—' && <Crest code={pl.clubCode} size="xs" />}
                    <span
                      className={`truncate text-[11px] text-zinc-300 ${
                        pl.clubId ? 'transition-colors group-hover:text-sky-300' : ''
                      }`}
                    >
                      {pl.club}
                    </span>
                    {pl.foreign && (
                      <span className="shrink-0 rounded bg-sky-400/10 px-0.5 text-[8px] font-semibold text-sky-300">
                        ↗
                      </span>
                    )}
                  </button>
                </td>
                <td className="truncate px-1 py-1.5 font-mono text-[10px] tabular-nums text-zinc-400">{pl.contract}</td>
                <td className="px-1 py-1.5 text-right font-mono text-[12px] font-semibold tabular-nums text-emerald-400">
                  {pl.value ? euros(pl.value) : t('common.unknown')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SquadDirectory({ nation, setView }) {
  const { t } = useI18n()
  const size = SQUAD_GROUPS.reduce((a, g) => a + (nation.squad[g.key]?.length || 0), 0)

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <CardLabel>{t('nation.currentSquad')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">
            {size} {t('club.players')}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {SQUAD_GROUPS.map((g) => (
          <SquadGroup
            key={g.key}
            label={g.label}
            players={nation.squad[g.key]}
            setView={setView}
          />
        ))}
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  3 — Legends sidebar                                                */
/* ================================================================== */

function LegendList({ title, rows, unit, setView }) {
  const { t } = useI18n()
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{title}</p>
      <ul className="mt-2 space-y-1">
        {rows.map((r) => (
          <li key={`${title}-${r.rank}`} className="flex items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-white/[0.03]">
            <span className="w-4 font-display text-[11px] font-bold tabular-nums text-zinc-600">{r.rank}</span>
            <button
              type="button"
              disabled={!r.playerId}
              onClick={() => r.playerId && setView('player', r.playerId)}
              className={`min-w-0 flex-1 truncate text-left text-[13px] font-medium text-zinc-100 ${
                r.playerId ? 'hover:text-emerald-300' : ''
              }`}
            >
              {r.name}
            </button>
            <span className="font-display text-sm font-semibold tabular-nums text-sky-300">
              {r.value}
              <span className="ml-0.5 text-[10px] text-zinc-600">{unit}</span>
            </span>
          </li>
        ))}
        {!rows.length && <li className="py-2 text-xs text-zinc-600">{t('nation.noData')}</li>}
      </ul>
    </div>
  )
}

function LegendsSidebar({ nation, setView }) {
  const { t } = useI18n()
  const L = nation.legends
  return (
    <Card className="p-5">
      <CardLabel>{t('nation.legendsRecords')}</CardLabel>
      <div className="mt-4 space-y-5">
        <LegendList title={t('nation.allTimeCaps')} rows={L.caps} unit={t('common.caps')} setView={setView} />
        <div className="border-t border-white/5 pt-4">
          <LegendList title={t('nation.allTimeGoals')} rows={L.goals} unit={t('player.colG')} setView={setView} />
        </div>
        <div className="grid grid-cols-1 gap-3 border-t border-white/5 pt-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{t('nation.youngestDebut')}</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">{L.youngestDebut?.name}</p>
            <p className="text-xs tabular-nums text-emerald-400">{L.youngestDebut?.age}</p>
            <p className="text-[10px] text-zinc-600">{L.youngestDebut?.year}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{t('nation.oldestPlayer')}</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">{L.oldestPlayer?.name}</p>
            <p className="text-xs tabular-nums text-sky-300">{L.oldestPlayer?.age}</p>
            <p className="text-[10px] text-zinc-600">{L.oldestPlayer?.year}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  4 — Fixtures + Trophy room                                         */
/* ================================================================== */

function MatchLog({ fixtures, setView }) {
  const { t } = useI18n()
  if (!fixtures?.length) {
    return (
      <Card className="p-5">
        <CardLabel>{t('nation.matchLog')}</CardLabel>
        <p className="mt-3 text-sm text-zinc-500">{t('nation.noFixtures')}</p>
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-5">
      <CardLabel>{t('nation.matchLog')}</CardLabel>
      <p className="mt-0.5 text-xs text-zinc-400">{t('nation.matchLogSub')}</p>
      <div className="mt-3 w-full">
        <table className="data-table w-full table-fixed">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[28%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/5 text-[9px] uppercase tracking-wide text-zinc-500">
              <th className="px-1 py-1.5 text-left font-medium">{t('common.date')}</th>
              <th className="px-1 py-1.5 text-left font-medium">{t('player.colComp')}</th>
              <th className="px-1 py-1.5 text-left font-medium">{t('player.competition')}</th>
              <th className="px-1 py-1.5 text-center font-medium">{t('common.status')}</th>
              <th className="px-1 py-1.5 text-left font-medium">{t('common.stadium')}</th>
              <th className="px-1 py-1.5 text-left font-medium">{t('match.ref')}</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((f, i) => {
              const canMatch = Boolean(f.matchId && setView)
              return (
                <tr
                  key={`${f.date}-${f.competition}-${i}`}
                  className={`odd:bg-zinc-900/30 border-b border-white/5 transition-colors hover:bg-white/[0.03] ${
                    canMatch ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => canMatch && setView('match', f.matchId)}
                >
                  <td className="truncate px-1 py-1.5 font-mono text-[10px] tabular-nums text-zinc-400">{f.date}</td>
                  <td className="truncate px-1 py-1.5 text-[10px] text-zinc-500">{f.competition}</td>
                  <td className="min-w-0 truncate px-1 py-1.5 text-[11px] font-medium text-zinc-100">
                    {f.home} <span className="text-zinc-600">{t('common.vs')}</span> {f.away}
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    {f.status === 'upcoming' || !f.score ? (
                      <span className="rounded bg-sky-400/10 px-1 py-0.5 text-[9px] font-semibold text-sky-300">
                        {t('common.upcoming')}
                      </span>
                    ) : (
                      <ScoreBadge matchId={f.matchId} score={f.score} setView={setView} size="sm" />
                    )}
                  </td>
                  <td className="truncate px-1 py-1.5 text-[10px] text-zinc-400">{f.venue}</td>
                  <td className="truncate px-1 py-1.5 text-[10px] text-zinc-500">{f.referee}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function TrophyRoom({ trophies }) {
  const { t } = useI18n()
  if (!trophies?.length) return null

  return (
    <section className="mt-6">
      <div className="mb-3">
        <CardLabel>{t('nation.trophyRoom')}</CardLabel>
        <p className="mt-0.5 text-xs text-zinc-400">{t('nation.internationalTitles')}</p>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {trophies.map((row) => (
          <div
            key={row.name}
            className="flex w-52 shrink-0 flex-col rounded-2xl border border-white/5 bg-zinc-900/60 p-4 transition-colors hover:border-amber-400/20 hover:bg-amber-400/[0.03]"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 font-display text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/25">
                {row.code}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-white">{row.name}</p>
                <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-amber-300">
                  {row.count}×
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">{row.years.join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

/**
 * NationProfile — full national football ecosystem archive.
 * Links: setView('player'|'club'|'manager', id)
 */
export default function NationProfile({ nation, onBack, setView }) {
  const { t } = useI18n()

  if (!nation) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-zinc-400">{t('nation.unavailable')}</p>
      </main>
    )
  }

  // Ensure setView always exists
  const view = setView || (() => {})

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

      <NationHeader nation={nation} setView={view} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <SquadDirectory nation={nation} setView={view} />
        </div>
        <aside className="lg:col-span-4">
          <LegendsSidebar nation={nation} setView={view} />
        </aside>
      </div>

      <div className="mt-6">
        <MatchLog fixtures={nation.fixtures} setView={view} />
      </div>

      <TrophyRoom trophies={nation.trophies} />
    </main>
  )
}
