import { Avatar, Crest, Card, CardLabel, euros } from './ui.jsx'
import { useI18n } from './i18n/I18nProvider.jsx'

/* ================================================================== */
/*  Shared                                                             */
/* ================================================================== */

function Metric({ label, children, hint }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="mt-1 font-display text-xl font-bold tabular-nums tracking-tight text-white sm:text-2xl">
        {children}
      </div>
      {hint && <p className="mt-0.5 text-[10px] text-zinc-600">{hint}</p>}
    </div>
  )
}

function FlagButton({ code, nationId, nationName, setView }) {
  return (
    <button
      type="button"
      disabled={!nationId}
      onClick={() => nationId && setView('nation', nationId)}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 transition-colors ${
        nationId ? 'hover:border-sky-400/30 hover:bg-sky-500/10' : 'cursor-default opacity-90'
      }`}
      title={nationId ? nationName || code : code}
    >
      <span className="rounded-sm bg-white/10 px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wide text-zinc-200">
        {code}
      </span>
      <span className="text-xs text-zinc-400">{nationName || code}</span>
      {nationId && <span className="text-[10px] font-medium text-sky-400">↗</span>}
    </button>
  )
}

function ClubLink({ name, code, clubId, setView, className = '' }) {
  const clickable = Boolean(clubId)
  if (!clickable) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        {code && code !== '—' && <Crest code={code} size="xs" />}
        <span className="truncate text-zinc-200">{name}</span>
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={() => setView('club', clubId)}
      className={`group inline-flex max-w-full items-center gap-1.5 text-left ${className}`}
    >
      {code && <Crest code={code} size="xs" />}
      <span className="truncate font-medium text-zinc-100 transition-colors group-hover:text-sky-300">{name}</span>
    </button>
  )
}

/* ================================================================== */
/*  1 — Hero                                                           */
/* ================================================================== */

function ManagerHero({ m, setView }) {
  const { t } = useI18n()
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 p-5 backdrop-blur-md sm:p-7">
      <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-sky-400/[0.06] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-12 bottom-0 size-56 rounded-full bg-emerald-400/[0.05] blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <Avatar name={m.name} size="2xl" ring />
          <span className="absolute -bottom-1 -right-1 rounded-md border border-sky-400/30 bg-zinc-950 px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-wide text-sky-300">
            {t('common.manager')}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <FlagButton
              code={m.nation}
              nationId={m.nationId}
              nationName={m.nationName}
              setView={setView}
            />
            <span className="text-xs text-zinc-500">
              {m.age} {t('player.years')}
            </span>
            <span className="text-zinc-700">·</span>
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
              {m.licence}
            </span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {m.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{m.role}</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                {t('manager.currentClubRole')}
              </p>
              <div className="mt-1">
                <ClubLink
                  name={m.currentClub}
                  code={m.clubCode}
                  clubId={m.clubId}
                  setView={setView}
                  className="text-sm font-semibold"
                />
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                {t('manager.contractExpiry')}
              </p>
              <p className="mt-1 font-display text-sm font-semibold tabular-nums text-zinc-100">
                {m.contractUntil}
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                {t('manager.capsAsPlayer')}
              </p>
              <p className="mt-1 font-display text-sm font-semibold tabular-nums text-zinc-100">
                {m.capsAsPlayer ?? t('common.unknown')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  2 — Tactical & philosophy dashboard                                */
/* ================================================================== */

function TacticalDashboard({ m }) {
  const { t } = useI18n()
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* Formation showcase */}
        <div className="relative border-b border-white/5 p-5 lg:border-b-0 lg:border-r lg:border-white/5">
          <CardLabel>{t('manager.preferredFormation')}</CardLabel>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-emerald-400 sm:text-4xl">
            {m.formation}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-sky-400/25 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-300">
              {m.styleTag}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-400">
              {m.style}
            </span>
          </div>
          {/* Decorative mini pitch silhouette */}
          <div className="pointer-events-none mt-5 h-28 overflow-hidden rounded-xl border border-emerald-400/10 bg-gradient-to-b from-[#0d3323]/80 to-[#0a2419]/90 opacity-80" aria-hidden="true">
            <div className="relative h-full w-full">
              <div className="absolute inset-2 rounded border border-white/10" />
              <div className="absolute inset-x-2 top-1/2 h-px bg-white/10" />
              <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              {/* abstract dots for formation feel */}
              {[
                [50, 85], [20, 65], [40, 68], [60, 68], [80, 65],
                [30, 42], [50, 40], [70, 42], [25, 22], [50, 18], [75, 22],
              ].map(([x, y], i) => (
                <span
                  key={i}
                  className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/50 ring-1 ring-emerald-300/30"
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Core metrics */}
        <div className="p-5">
          <CardLabel>{t('manager.coreMetrics')}</CardLabel>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Metric label={t('manager.pointsPerGame')} hint={t('manager.careerAvg')}>
              <span className="text-emerald-400">{m.ppg.toFixed(2)}</span>
            </Metric>
            <Metric label={t('manager.careerWinPct')} hint={t('manager.allCompetitive')}>
              <span className="text-sky-300">{m.winPct.toFixed(1)}%</span>
            </Metric>
            <Metric label={t('manager.avgPossession')} hint={t('manager.last3Seasons')}>
              <span className="text-white">{m.avgPossession.toFixed(1)}%</span>
            </Metric>
            <Metric label={t('manager.preferredStyle')} hint={t('manager.philosophyTag')}>
              <span className="text-base leading-snug text-zinc-100 sm:text-lg">{m.styleTag}</span>
            </Metric>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400"
              style={{ width: `${Math.min(100, m.winPct)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-600">{t('manager.winRateSignal')}</p>
        </div>
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  3 — Career history timeline                                        */
/* ================================================================== */

function CareerHistory({ career, setView }) {
  const { t } = useI18n()
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <CardLabel>{t('manager.careerTimeline')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">{t('manager.chronological')}</p>
        </div>
        <span className="text-[11px] tabular-nums text-zinc-500">
          {career.length} {t('manager.spells')}
        </span>
      </div>

      <div className="mt-3 w-full">
        <table className="data-table w-full table-fixed">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[20%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/5 text-[9px] uppercase tracking-wide text-zinc-500">
              <th className="px-1 py-2 text-left font-medium">{t('common.season')}</th>
              <th className="px-1 py-2 text-left font-medium">{t('hubs.tableClub')}</th>
              <th className="px-1 py-2 text-left font-medium">{t('common.from')}</th>
              <th className="px-1 py-2 text-left font-medium">{t('common.to')}</th>
              <th className="px-1 py-2 text-right font-medium">{t('common.days')}</th>
              <th className="px-1 py-2 text-right font-medium">{t('hubs.tableM')}</th>
              <th className="px-1 py-2 text-right font-medium">{t('standings.g')}</th>
              <th className="px-1 py-2 text-right font-medium">{t('standings.b')}</th>
              <th className="px-1 py-2 text-right font-medium">{t('standings.m')}</th>
              <th className="px-1 py-2 text-right font-medium">{t('common.ppg')}</th>
            </tr>
          </thead>
          <tbody>
            {career.map((s, i) => (
              <tr
                key={`${s.season}-${s.code}-${i}`}
                className={`odd:bg-zinc-900/30 border-b border-white/5 transition-colors hover:bg-emerald-400/[0.04] ${
                  !s.departed ? 'bg-emerald-400/[0.03]' : ''
                }`}
              >
                <td className="px-1 py-1.5 font-mono text-[10px] font-semibold tabular-nums text-zinc-300">
                  {s.season}
                  {!s.departed && (
                    <span className="ml-0.5 rounded bg-emerald-400/15 px-0.5 text-[8px] font-bold uppercase text-emerald-300">
                      {t('common.now')}
                    </span>
                  )}
                </td>
                <td className="min-w-0 px-1 py-1.5">
                  <ClubLink name={s.club} code={s.code} clubId={s.clubId} setView={setView} className="text-[11px]" />
                </td>
                <td className="truncate px-1 py-1.5 font-mono text-[10px] tabular-nums text-zinc-400">{s.appointed}</td>
                <td className="truncate px-1 py-1.5 font-mono text-[10px] tabular-nums text-zinc-400">
                  {s.departed ?? t('common.unknown')}
                </td>
                <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">
                  {s.days.toLocaleString('en-US')}
                </td>
                <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-300">{s.matches}</td>
                <td className="px-1 py-1.5 text-right font-mono tabular-nums text-emerald-400">{s.w}</td>
                <td className="px-1 py-1.5 text-right font-mono tabular-nums text-zinc-400">{s.d}</td>
                <td className="px-1 py-1.5 text-right font-mono tabular-nums text-red-400/80">{s.l}</td>
                <td className="px-1 py-1.5 text-right font-mono text-[12px] font-bold tabular-nums text-sky-300">
                  {s.ppg.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ================================================================== */
/*  4 — Developed talents                                              */
/* ================================================================== */

function DevelopedTalents({ talents, setView }) {
  const { t } = useI18n()
  if (!talents?.length) return null

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <CardLabel>{t('manager.talents')}</CardLabel>
          <p className="mt-0.5 text-xs text-zinc-400">{t('manager.talentsSub')}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {talents.map((row) => {
          const canPlayer = Boolean(row.playerId)
          return (
            <button
              key={row.name}
              type="button"
              disabled={!canPlayer}
              onClick={() => canPlayer && setView('player', row.playerId)}
              className={`rounded-2xl border border-white/5 bg-zinc-900/60 p-3.5 text-left transition-colors ${
                canPlayer
                  ? 'cursor-pointer hover:border-emerald-400/25 hover:bg-emerald-400/[0.04]'
                  : 'cursor-default'
              }`}
            >
              <Avatar name={row.name} size="md" />
              <p
                className={`mt-2.5 truncate text-[13px] font-semibold text-zinc-100 ${
                  canPlayer ? 'group-hover:text-emerald-300' : ''
                }`}
              >
                {row.name}
              </p>
              {row.club && (
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-zinc-500">
                  {row.code && row.code !== '—' && <Crest code={row.code} size="xs" />}
                  {row.club}
                </p>
              )}
              <div className="mt-2.5 flex items-end justify-between border-t border-white/5 pt-2">
                <div>
                  <p className="text-[9px] uppercase tracking-wide text-zinc-600">{t('manager.value')}</p>
                  <p className="font-display text-sm font-bold tabular-nums text-emerald-400">
                    {row.value ? euros(row.value) : t('common.unknown')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wide text-zinc-600">{t('manager.debutAge')}</p>
                  <p className="font-display text-sm font-semibold tabular-nums text-sky-300">{row.debutAge}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

/**
 * ManagerProfile — elite head-coach terminal.
 * Links: setView('club'|'player'|'nation', id)
 */
export default function ManagerProfile({ manager, onBack, setView }) {
  const { t } = useI18n()

  if (!manager) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-zinc-400">{t('manager.unavailable')}</p>
      </main>
    )
  }

  const view = setView || (() => {})
  const m = manager

  // Back-compat for thin manager stubs (if any remain)
  if (!m.career) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          ← {t('common.back')}
        </button>
        <p className="text-zinc-400">{t('manager.loading', { name: m.name })}</p>
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

      <ManagerHero m={m} setView={view} />

      <div className="mt-6">
        <TacticalDashboard m={m} />
      </div>

      <div className="mt-6">
        <CareerHistory career={m.career} setView={view} />
      </div>

      <div className="mt-6">
        <DevelopedTalents talents={m.talents} setView={view} />
      </div>
    </main>
  )
}
