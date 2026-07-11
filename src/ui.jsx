/* ------------------------------------------------------------------ */
/*  Shared primitives                                                  */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from './i18n/I18nProvider.jsx'

/* Fold accents so "yildiz" matches "Yıldız" and "guler" matches "Güler" */
export function fold(s) {
  return s
    .toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * Global hover/focus tooltip.
 * Portaled to document.body with position:fixed so parent overflow / table
 * stacking never clips or buries the bubble.
 */
export function Tip({ label, children, align = 'center' }) {
  const triggerRef = useRef(null)
  const tipId = useId()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'top', align: 'center' })

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const placement = r.top < 52 ? 'bottom' : 'top'
    let left = r.left + r.width / 2
    if (align === 'left') left = r.left
    if (align === 'right') left = r.right
    const top = placement === 'top' ? r.top - 8 : r.bottom + 8
    setCoords({ top, left, placement, align })
  }, [align])

  const show = () => {
    updatePosition()
    setOpen(true)
  }
  const hide = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onMove = () => updatePosition()
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open, updatePosition])

  const transform =
    coords.align === 'left'
      ? coords.placement === 'top'
        ? 'translate(0, -100%)'
        : 'translate(0, 0)'
      : coords.align === 'right'
        ? coords.placement === 'top'
          ? 'translate(-100%, -100%)'
          : 'translate(-100%, 0)'
        : coords.placement === 'top'
          ? 'translate(-50%, -100%)'
          : 'translate(-50%, 0)'

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex cursor-help items-center border-b border-dotted border-zinc-500/80"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        tabIndex={0}
        aria-describedby={open ? tipId : undefined}
      >
        {children}
      </span>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            id={tipId}
            role="tooltip"
            className="pointer-events-none fixed z-[100] w-max max-w-[240px] rounded-lg border border-white/15 bg-zinc-900 px-2.5 py-1.5 text-left text-[11px] font-normal leading-snug normal-case tracking-normal text-zinc-100 shadow-2xl shadow-black/80 ring-1 ring-black/40"
            style={{ top: coords.top, left: coords.left, transform }}
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  )
}

export function euros(m) {
  return `€${m}M`
}

/* Transfermarkt-style long form: 180 -> €180.00m, 9.5 -> €9.50m */
export function eurosLong(m) {
  return `€${m.toFixed(2)}m`
}

export function Avatar({ name, size = 'md', ring = false, src = null }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
  const sizes = {
    xs: 'size-7 text-[10px]',
    sm: 'size-9 text-xs',
    md: 'size-11 text-sm',
    xl: 'size-20 text-2xl',
    '2xl': 'size-24 text-3xl',
  }
  const ringCls = ring ? 'ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-zinc-900' : ''
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${sizes[size]} ${ringCls} shrink-0 rounded-full object-cover bg-zinc-800 ring-1 ring-white/10`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.hidden = false
        }}
      />
    )
  }
  return (
    <div
      className={`${sizes[size]} ${ringCls} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 font-display font-semibold text-zinc-200`}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

/* Deterministic muted club crest placeholder from a short code */
export function Crest({ code, size = 'md' }) {
  let h = 0
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 360
  const sizes = {
    xs: 'size-6 text-[9px]',
    sm: 'size-7 text-[10px]',
    md: 'size-8 text-[11px]',
  }
  return (
    <span
      className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-md font-display font-bold tracking-tight text-white/90 ring-1 ring-white/10`}
      style={{ background: `linear-gradient(135deg, hsl(${h} 42% 32%), hsl(${(h + 24) % 360} 46% 20%))` }}
      aria-hidden="true"
      title={code}
    >
      {code}
    </span>
  )
}

export function DeltaChip({ delta }) {
  const up = delta > 0
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-xs font-semibold tabular-nums ${
        up ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
      }`}
    >
      <svg viewBox="0 0 12 12" className={`size-3 ${up ? '' : 'rotate-180'}`} fill="currentColor" aria-hidden="true">
        <path d="M6 2l4 5H8v3H4V7H2l4-5z" />
      </svg>
      {up ? '+' : '−'}€{Math.abs(delta)}M
    </span>
  )
}

export function TrendChip({ pct }) {
  const up = pct > 0
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-xs font-semibold tabular-nums ${
        up ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
      }`}
    >
      <svg viewBox="0 0 12 12" className={`size-3 ${up ? '' : 'rotate-180'}`} fill="currentColor" aria-hidden="true">
        <path d="M6 2l4 5H8v3H4V7H2l4-5z" />
      </svg>
      {up ? '+' : ''}{pct.toFixed(1)}%
    </span>
  )
}

/**
 * Interactive match score badge — always routes via SPA setView('match', matchId).
 * Accepts either a combined `score` string ("2–1") or numeric home/away scores.
 */
export function ScoreBadge({
  matchId,
  score,
  homeScore,
  awayScore,
  setView,
  onOpenMatch,
  size = 'md',
  className = '',
  stopPropagation = true,
}) {
  const { t } = useI18n()
  const label =
    score != null && score !== ''
      ? String(score).replace(/-/g, '–')
      : homeScore != null && awayScore != null
        ? `${homeScore}–${awayScore}`
        : null

  if (label == null) {
    return (
      <span className={`font-display tabular-nums text-zinc-600 ${className}`} aria-hidden="true">
        –
      </span>
    )
  }

  const open = (e) => {
    if (stopPropagation) e?.stopPropagation?.()
    if (!matchId) return
    if (typeof setView === 'function') setView('match', matchId)
    else if (typeof onOpenMatch === 'function') onOpenMatch(matchId)
  }

  const clickable = Boolean(matchId && (setView || onOpenMatch))
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[11px]',
    md: 'px-2 py-0.5 text-sm',
    lg: 'px-2.5 py-1 text-base',
  }

  if (!clickable) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md bg-white/5 font-display font-bold tabular-nums text-zinc-200 ring-1 ring-white/10 ${sizes[size]} ${className}`}
      >
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open(e)
        }
      }}
      title={t('ui.openMatchCenter')}
      className={`inline-flex items-center justify-center rounded-md bg-white/[0.06] font-display font-bold tabular-nums text-white ring-1 ring-white/15 transition-colors hover:bg-red-500/15 hover:text-red-300 hover:ring-red-400/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 ${sizes[size]} ${className}`}
    >
      {label}
    </button>
  )
}

export function Card({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-white/5 bg-zinc-900/60 transition-colors duration-300 hover:border-white/10 ${className}`}
    >
      {children}
    </section>
  )
}

export function CardLabel({ children, accent = false }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${accent ? 'text-emerald-400' : 'text-zinc-500'}`}>
      {children}
    </p>
  )
}
