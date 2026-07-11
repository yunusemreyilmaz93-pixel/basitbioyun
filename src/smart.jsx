import { VALUATION_FACTORS } from './homeData.js'
import { DATA_SOURCE, CURRENT_SEASON } from './schema.js'
import { useI18n } from './i18n/I18nProvider.jsx'

/* Small badge for Smart Market Value labels */
export function AiBadge({ className = '' }) {
  const { t } = useI18n()
  return (
    <span className={`inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-sky-300 ring-1 ring-sky-400/20 ${className}`}>
      <svg viewBox="0 0 12 12" className="size-2.5" fill="currentColor" aria-hidden="true">
        <path d="M6 0l1.3 3.2L10.5 4 8 6.1l.8 3.4L6 7.7 3.2 9.5 4 6.1 1.5 4l3.2-.8L6 0z" />
      </svg>
      {t('smart.aiValuated')}
    </span>
  )
}

/* The factor breakdown — reused by the homepage widget and the navbar modal */
export function ValuationFactors({ compact = false }) {
  const { t } = useI18n()
  return (
    <ul className={compact ? 'space-y-2.5' : 'space-y-3.5'}>
      {VALUATION_FACTORS.map((f) => (
        <li key={f.id}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-medium text-zinc-200">{t(f.keyPath)}</span>
            <span className="font-display text-xs font-semibold tabular-nums text-sky-300">{f.weight}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300" style={{ width: `${f.weight}%` }} />
          </div>
          {!compact && <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{t(f.descPath)}</p>}
        </li>
      ))}
    </ul>
  )
}

/* Full-screen modal opened from the navbar badge */
export function SmartValuationModal({ open, onClose }) {
  const { t } = useI18n()
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/70 px-4 pt-[10vh] backdrop-blur-sm"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('smart.howTitle')}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AiBadge />
                <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  {t('smart.methodology')}
                </span>
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-white">
                {t('smart.howTitle')}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">{t('smart.howBody')}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
              aria-label={t('common.back')}
            >
              <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
            </button>
          </div>
        </div>
        <div className="p-5">
          <ValuationFactors />
        </div>
        <div className="border-t border-white/5 px-5 py-3 text-[11px] text-zinc-500">
          {t('smart.weightsNote')}
          <span className="mt-1 block text-zinc-600">
            {t('smart.season')} {CURRENT_SEASON.label} · {t('smart.dataMode')}{' '}
            <span className="text-zinc-400">{DATA_SOURCE.mode}</span>
            {DATA_SOURCE.provider
              ? ` · ${DATA_SOURCE.provider}`
              : ` · ${t('smart.providerUnset')}`}{' '}
            · {t('smart.asOf')} {DATA_SOURCE.asOf}
          </span>
        </div>
      </div>
    </div>
  )
}
