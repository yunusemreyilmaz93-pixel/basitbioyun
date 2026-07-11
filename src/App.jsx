import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PLAYERS,
  CLUBS,
  MATCHES_DETAIL,
  LEAGUES_DETAIL,
  NATIONS,
  MANAGERS,
  SEARCH_INDEX,
  DATA_SOURCE,
  getDataStatus,
} from './dataLayer.js'
import { fold } from './ui.jsx'
import HomepageDashboard from './Home.jsx'
import PlayerProfile from './PlayerProfile.jsx'
import ClubProfile from './ClubProfile.jsx'
import MatchCenter from './MatchCenter.jsx'
import LeagueProfile from './LeagueProfile.jsx'
import NationProfile from './NationProfile.jsx'
import ManagerProfile from './ManagerProfile.jsx'
import {
  PlayersHub,
  ClubsHub,
  CompetitionsHub,
  NationsHub,
  ManagersHub,
  MarketHubPage,
} from './Hubs.jsx'
import { SmartValuationModal } from './smart.jsx'
import { LanguageSwitcher, useI18n } from './i18n/I18nProvider.jsx'

/* ================================================================== */
/*  Command palette                                                    */
/* ================================================================== */

const SEARCH_TYPE_KEYS = {
  Player: 'search.typePlayer',
  Club: 'search.typeClub',
  League: 'search.typeLeague',
  Manager: 'search.typeManager',
  Match: 'search.typeMatch',
  Nation: 'search.typeNation',
  Rumor: 'search.typeRumor',
}

function CommandPalette({ open, onClose, setView }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)

  const results = useMemo(() => {
    const q = fold(query.trim())
    if (!q) return SEARCH_INDEX
    return SEARCH_INDEX.filter(
      (r) => fold(r.label).includes(q) || fold(r.meta).includes(q),
    )
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  const select = (r) => {
    onClose()
    if (!r) return
    if (r.managerId) setView('manager', r.managerId)
    else if (r.leagueId) setView('league', r.leagueId)
    else if (r.matchId) setView('match', r.matchId)
    else if (r.clubId) setView('club', r.clubId)
    else if (r.nationId) setView('nation', r.nationId)
    else if (r.playerId) setView('player', r.playerId)
  }

  if (!open) return null

  const typeColor = {
    Player: 'text-emerald-400 bg-emerald-400/10',
    Club: 'text-sky-400 bg-sky-400/10',
    League: 'text-sky-300 bg-sky-400/10',
    Manager: 'text-emerald-300 bg-emerald-400/10',
    Match: 'text-red-400 bg-red-400/10',
    Nation: 'text-violet-300 bg-violet-400/10',
    Rumor: 'text-amber-400 bg-amber-400/10',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/70 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('search.aria')}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/5 px-4">
          <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="9" cy="9" r="6" />
            <path d="M13.5 13.5L17 17" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, results.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              } else if (e.key === 'Enter') {
                select(results[active])
              }
            }}
            placeholder={t('search.placeholder')}
            className="w-full bg-transparent py-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-zinc-500">{t('search.noResults')}</li>
          )}
          {results.map((r, i) => (
            <li key={r.type + r.label} role="option" aria-selected={i === active}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => select(r)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  i === active ? 'bg-white/5' : ''
                }`}
              >
                <span className={`w-14 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide ${typeColor[r.type] || 'text-zinc-400 bg-white/5'}`}>
                  {SEARCH_TYPE_KEYS[r.type] ? t(SEARCH_TYPE_KEYS[r.type]) : r.type}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-zinc-100">{r.label}</span>
                  <span className="block truncate text-xs text-zinc-500">{r.meta}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 border-t border-white/5 px-4 py-2.5 text-[11px] text-zinc-500">
          <span><kbd className="font-sans text-zinc-400">↑↓</kbd> {t('search.navigate')}</span>
          <span><kbd className="font-sans text-zinc-400">↵</kbd> {t('search.open')}</span>
          <span><kbd className="font-sans text-zinc-400">esc</kbd> {t('search.close')}</span>
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Global Navbar                                                      */
/* ================================================================== */

const NAV_VIEWS = [
  { key: 'players', view: 'players' },
  { key: 'clubs', view: 'clubs' },
  { key: 'managers', view: 'managers' },
  { key: 'competitions', view: 'competitions' },
  { key: 'nations', view: 'nations' },
  { key: 'market', view: 'market' },
]

function Navbar({ view, setView, onSearchOpen, onLearnMore }) {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
  const { t } = useI18n()

  const navItems = NAV_VIEWS.map((item) => ({
    ...item,
    label: t(`nav.${item.key}`),
  }))

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setView('homepage')}
          className="flex shrink-0 items-center gap-2.5"
          aria-label={t('nav.homeAria')}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/30" aria-hidden="true">
            <svg viewBox="0 0 16 16" className="size-4 text-emerald-400" fill="currentColor">
              <path d="M8 1l5.5 2.2v4.1c0 3.2-2.2 6-5.5 7.7C4.7 13.3 2.5 10.5 2.5 7.3V3.2L8 1z" fillOpacity="0.25" />
              <path d="M8 4.2l3 4.6H9.3v2.6H6.7V8.8H5l3-4.6z" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            <span className="text-white">BasitBi</span>
            <span className="text-emerald-400">Oyun</span>
          </span>
        </button>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t('nav.primaryNav')}>
          {navItems.map((item) => {
            const active = view === item.view
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => setView(item.view)}
                className={`rounded-lg px-2.5 py-1.5 text-[13px] transition-colors hover:bg-white/5 ${
                  active ? 'bg-white/5 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={onSearchOpen}
            className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-500 transition-colors hover:border-white/20 hover:bg-white/[0.07] sm:w-44 lg:w-56 xl:w-64"
          >
            <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="9" cy="9" r="6" />
              <path d="M13.5 13.5L17 17" strokeLinecap="round" />
            </svg>
            <span className="hidden truncate sm:block">{t('nav.search')}</span>
            <kbd className="ml-auto hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] font-medium text-zinc-400 sm:block">
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>
          </button>
          <button
            type="button"
            onClick={onLearnMore}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-sky-400/30 bg-gradient-to-b from-sky-500/20 to-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-300 shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)] transition-colors hover:border-sky-400/50"
            title={t('nav.smartValuation')}
          >
            <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden="true">
              <path d="M6 0l1.3 3.2L10.5 4 8 6.1l.8 3.4L6 7.7 3.2 9.5 4 6.1 1.5 4l3.2-.8L6 0z" />
            </svg>
            <span className="hidden sm:inline">{t('nav.smartValuation')}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <nav
        className="no-scrollbar flex gap-1 overflow-x-auto border-t border-white/5 px-4 py-1.5 lg:hidden sm:px-6"
        aria-label={t('nav.sections')}
      >
        {navItems.map((item) => (
          <button
            key={item.view}
            type="button"
            onClick={() => setView(item.view)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-xs transition-colors ${
              view === item.view ? 'bg-white/5 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

/* ================================================================== */
/*  Breadcrumb / back                                                  */
/* ================================================================== */

function TerminalChrome({ view, selectedId, setView }) {
  const detailViews = new Set(['player', 'club', 'league', 'nation', 'manager', 'match'])
  if (!detailViews.has(view)) return null

  const label = {
    player: PLAYERS[selectedId]?.name,
    club: CLUBS[selectedId]?.name,
    league: LEAGUES_DETAIL[selectedId]?.name,
    nation: NATIONS[selectedId]?.name,
    manager: MANAGERS[selectedId]?.name,
    match: MATCHES_DETAIL[selectedId]
      ? `${MATCHES_DETAIL[selectedId].home.short} vs ${MATCHES_DETAIL[selectedId].away.short}`
      : null,
  }[view]

  return (
    <div className="border-b border-white/5 bg-zinc-950/50">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-1.5 text-[11px] text-zinc-500 sm:px-6 lg:px-8">
        <button type="button" onClick={() => setView('homepage')} className="hover:text-zinc-300">
          Terminal
        </button>
        <span className="text-zinc-700">/</span>
        <span className="capitalize text-zinc-400">{view}</span>
        {label && (
          <>
            <span className="text-zinc-700">/</span>
            <span className="truncate font-medium text-zinc-300">{label}</span>
          </>
        )}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Not found                                                          */
/* ================================================================== */

function NotFoundScreen({ onHome }) {
  const { t } = useI18n()
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 text-center">
      <p className="text-zinc-400">{t('common.screenNotFound')}</p>
      <button
        type="button"
        onClick={onHome}
        className="mt-4 text-sm font-medium text-emerald-400 hover:text-emerald-300"
      >
        {t('common.goHome')}
      </button>
    </main>
  )
}

/* ================================================================== */
/*  App orchestrator                                                   */
/* ================================================================== */

/**
 * Ultimate navigation engine.
 * setView(view, selectedId?) swaps screens without page reload.
 *
 * Hubs: homepage | players | clubs | managers | competitions | nations | market
 * Details: player | club | league | nation | manager | match
 */
export default function App() {
  const [view, setViewState] = useState('homepage')
  const [selectedId, setSelectedId] = useState(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [smartOpen, setSmartOpen] = useState(false)

  const setView = useCallback((nextView, id) => {
    // Aliases
    const v =
      nextView === 'home' || nextView === 'homepage'
        ? 'homepage'
        : nextView === 'competition' || nextView === 'competitions'
          ? 'competitions'
          : nextView

    // Validate detail ids before swap
    if (v === 'player' && id && !PLAYERS[id]) return
    if (v === 'club' && id && !CLUBS[id]) return
    if (v === 'match' && id && !MATCHES_DETAIL[id]) return
    if (v === 'league' && id && !LEAGUES_DETAIL[id]) return
    if (v === 'nation' && id && !NATIONS[id]) return
    if (v === 'manager' && id && !MANAGERS[id]) return

    setViewState(v)
    setSelectedId(id ?? null)
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [])

  const goBack = useCallback(() => setView('homepage'), [setView])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false)
        setSmartOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ---- Screen router ---- */
  let screen = null

  if (view === 'homepage') {
    screen = (
      <HomepageDashboard
        onOpenPlayer={(id) => setView('player', id)}
        onOpenClub={(id) => setView('club', id)}
        onOpenMatch={(id) => setView('match', id)}
        onOpenLeague={(id) => setView('league', id)}
        setView={setView}
      />
    )
  } else if (view === 'players') {
    screen = <PlayersHub setView={setView} />
  } else if (view === 'clubs') {
    screen = <ClubsHub setView={setView} />
  } else if (view === 'managers') {
    screen = <ManagersHub setView={setView} />
  } else if (view === 'competitions') {
    screen = <CompetitionsHub setView={setView} />
  } else if (view === 'nations') {
    screen = <NationsHub setView={setView} />
  } else if (view === 'market') {
    screen = <MarketHubPage setView={setView} />
  } else if (view === 'player' && PLAYERS[selectedId]) {
    screen = (
      <PlayerProfile
        key={selectedId}
        player={PLAYERS[selectedId]}
        onBack={goBack}
        onOpenPlayer={(id) => setView('player', id)}
        setView={setView}
      />
    )
  } else if (view === 'club' && CLUBS[selectedId]) {
    screen = (
      <ClubProfile
        key={selectedId}
        club={CLUBS[selectedId]}
        onBack={goBack}
        onOpenPlayer={(id) => setView('player', id)}
        setView={setView}
      />
    )
  } else if (view === 'match' && MATCHES_DETAIL[selectedId]) {
    screen = (
      <MatchCenter
        key={selectedId}
        match={MATCHES_DETAIL[selectedId]}
        onBack={goBack}
        onOpenPlayer={(id) => setView('player', id)}
        onOpenClub={(id) => setView('club', id)}
        setView={setView}
      />
    )
  } else if (view === 'league' && LEAGUES_DETAIL[selectedId]) {
    screen = (
      <LeagueProfile
        key={selectedId}
        league={LEAGUES_DETAIL[selectedId]}
        onBack={goBack}
        setView={setView}
      />
    )
  } else if (view === 'nation' && NATIONS[selectedId]) {
    screen = (
      <NationProfile
        key={selectedId}
        nation={NATIONS[selectedId]}
        onBack={goBack}
        setView={setView}
      />
    )
  } else if (view === 'manager' && MANAGERS[selectedId]) {
    screen = (
      <ManagerProfile
        key={selectedId}
        manager={MANAGERS[selectedId]}
        onBack={goBack}
        setView={setView}
      />
    )
  } else {
    // Fallback if invalid state — NotFoundScreen uses useI18n
    screen = <NotFoundScreen onHome={() => setView('homepage')} />
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <Navbar
        view={view}
        setView={setView}
        onSearchOpen={() => setPaletteOpen(true)}
        onLearnMore={() => setSmartOpen(true)}
      />
      <TerminalChrome view={view} selectedId={selectedId} setView={setView} />

      {screen}

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        setView={setView}
      />
      <SmartValuationModal open={smartOpen} onClose={() => setSmartOpen(false)} />
    </div>
  )
}
