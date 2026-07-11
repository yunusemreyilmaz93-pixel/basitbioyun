import { flagUrl, flagEmoji } from '../lib/flags.js'

/**
 * Tiny country flag. No sports API — flagcdn + emoji fallback.
 */
export function Flag({ code, name, className = '', title, size = 20 }) {
  const src = flagUrl(code || name, size <= 20 ? 40 : 80)
  const emoji = flagEmoji(code || name)
  const label = title || name || code || ''

  if (src) {
    return (
      <img
        src={src}
        alt=""
        title={label}
        width={size}
        height={Math.round(size * 0.75)}
        className={`inline-block shrink-0 rounded-sm object-cover ring-1 ring-white/10 ${className}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          const sib = e.currentTarget.nextElementSibling
          if (sib) sib.hidden = false
        }}
      />
    )
  }
  if (emoji) {
    return (
      <span className={`inline-block leading-none ${className}`} title={label} aria-hidden="true">
        {emoji}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm bg-white/10 px-1 font-mono text-[9px] font-bold text-zinc-400 ring-1 ring-white/10 ${className}`}
      title={label}
    >
      {(code || '—').toString().slice(0, 3)}
    </span>
  )
}
