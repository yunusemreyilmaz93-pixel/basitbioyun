import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LOCALE, LOCALE_LIST, LOCALES } from './locales.js'

const STORAGE_KEY = 'basitbioyun.locale'

const I18nContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  lang: LOCALES[DEFAULT_LOCALE],
  locales: LOCALE_LIST,
})

function readStoredLocale() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && LOCALES[v]) return v
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE
}

/** Resolve nested key like "nav.players" */
function lookup(dict, path) {
  const parts = path.split('.')
  let cur = dict
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[p]
  }
  return typeof cur === 'string' ? cur : undefined
}

/**
 * Simple interpolator: "Hello {n}" + { n: 3 } => "Hello 3"
 */
function interpolate(str, vars) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] != null ? String(vars[k]) : `{${k}}`,
  )
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale)

  const setLocale = useCallback((next) => {
    if (!LOCALES[next]) return
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const lang = LOCALES[locale] || LOCALES[DEFAULT_LOCALE]

  const t = useCallback(
    (key, vars) => {
      const primary = lookup(lang, key)
      if (primary != null) return interpolate(primary, vars)
      const fallback = lookup(LOCALES[DEFAULT_LOCALE], key)
      if (fallback != null) return interpolate(fallback, vars)
      return key
    },
    [lang],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      lang,
      locales: LOCALE_LIST,
    }),
    [locale, setLocale, t, lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

/** Map league zone labels from mock data → localized strings */
const ZONE_LABEL_MAP = {
  'UEFA Champions League': 'zones.ucl',
  'UEFA Europa League': 'zones.uel',
  'UEFA Conference League': 'zones.uecl',
  Relegation: 'zones.relegation',
  'Relegation / Play-off': 'zones.relegationPlayoff',
  Eliminated: 'zones.eliminated',
  Champions: 'zones.champions',
}

export function translateZoneLabel(t, label) {
  if (!label) return ''
  const key = ZONE_LABEL_MAP[label]
  return key ? t(key) : label
}

/** Smart valuation note strings from mock data */
const SMART_NOTE_MAP = {
  'Top-3 UEFA coefficient league': 'smart.top3League',
  'Top-4 UEFA coefficient league': 'smart.top4League',
  'Top-5 UEFA coefficient league': 'smart.top5League',
  'Elite rolling match rating': 'smart.eliteRating',
  'Consistent elite output': 'smart.consistentElite',
  'Rising rolling match rating': 'smart.risingRating',
  'Strong creative output per 90': 'smart.strongCreative',
  'High chance creation volume': 'smart.highChanceCreate',
  'Elite goal + assist involvement': 'smart.eliteGa',
  'High progressive carry volume': 'smart.highCarry',
  'Steepest part of the age curve': 'smart.steepestCurve',
  'Value plateau on the age curve': 'smart.plateauCurve',
  'High projection on the age curve': 'smart.highProjection',
  'Rising leg of the age curve': 'smart.risingCurve',
  'European champion at 17': 'smart.euroChamp17',
  'Established senior international': 'smart.establishedIntl',
  'Regular senior starter': 'smart.regularStarter',
  'Nailed-on international starter': 'smart.nailedStarter',
  'Breaking into a deep squad': 'smart.breakingDeep',
  'Emerging senior international': 'smart.emergingIntl',
  'Core national-team creator': 'smart.coreCreator',
}

const NATION_NAME_KEYS = {
  Spain: 'smart.nationSpain',
  Brazil: 'smart.nationBrazil',
  France: 'smart.nationFrance',
  Germany: 'smart.nationGermany',
  Türkiye: 'smart.nationTurkiye',
  Turkey: 'smart.nationTurkiye',
}

/** Translate smart valuation notes / age-cap labels used in factor bars */
export function translateSmartText(t, text) {
  if (!text) return ''
  const noteKey = SMART_NOTE_MAP[text]
  if (noteKey) return t(noteKey)

  let m = text.match(/^Pre-peak upside \((\d+)\)$/)
  if (m) return t('smart.prePeak', { n: m[1] })
  m = text.match(/^At peak \((\d+)\)$/)
  if (m) return t('smart.atPeak', { n: m[1] })
  m = text.match(/^Approaching peak \((\d+)\)$/)
  if (m) return t('smart.approachingPeak', { n: m[1] })
  m = text.match(/^(\d+)\s+(.+?)\s+caps$/)
  if (m) {
    const nationKey = NATION_NAME_KEYS[m[2]]
    const nation = nationKey ? t(nationKey) : m[2]
    return t('smart.capsLabel', { n: m[1], nation })
  }
  return text
}

/** Compact language switcher — EN | TR */
export function LanguageSwitcher({ className = '' }) {
  const { locale, setLocale, locales, t } = useI18n()

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-0.5 ${className}`}
      role="group"
      aria-label={t('common.language')}
    >
      {locales.map((l) => {
        const active = locale === l.id
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => setLocale(l.id)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-wide transition-colors ${
              active
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
            }`}
            aria-pressed={active}
            title={l.label}
          >
            {l.short}
          </button>
        )
      })}
    </div>
  )
}
