import React, { useEffect, useState } from 'react'

// A quiet, always-reachable way out of the long read. It appears once the hero
// is behind the reader, shows how far through the page they are, and steps out
// of the way when the pricing section itself is on screen (or when dismissed).
export default function KannaOnlineStickyCta({ dateLabel, timeLabel, priceLabel }) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let frame = null

    const measure = () => {
      frame = null
      const doc = document.documentElement
      const scrollTop = window.scrollY || doc.scrollTop
      const scrollable = doc.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0)

      const onScreen = el => {
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.top < window.innerHeight * 0.9 && rect.bottom > 0
      }

      // Step aside wherever the page is already asking for the sale, and once
      // the footer is in view there is nothing left to shortcut to.
      const atCta =
        onScreen(document.getElementById('reserve')) ||
        onScreen(document.getElementById('final-cta')) ||
        onScreen(document.querySelector('footer'))

      setVisible(scrollTop > window.innerHeight * 0.7 && !atCta)
    }

    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const shown = visible && !dismissed

  return (
    <div
      aria-hidden={!shown}
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:pb-5 transition-all duration-300 ease-out motion-reduce:transition-none ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-[130%] opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="mx-auto max-w-2xl overflow-hidden rounded-lg shadow-xl ring-1 ring-white/10 backdrop-blur"
        style={{ background: 'color-mix(in srgb, var(--color-black-950) 94%, transparent)' }}
      >
        <div className="h-0.5 bg-white/10">
          <div
            className="h-full bg-rusty-spice-500 transition-[width] duration-150 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 sm:gap-5 sm:px-5 sm:py-3">
          <div className="min-w-0 flex-1">
            <p className="text-dust-grey-200 text-[0.6rem] uppercase tracking-[0.2em] truncate">
              {dateLabel} · {timeLabel}
            </p>
            <p className="text-dust-grey-50 text-sm truncate">
              Places from {priceLabel}
              <span className="hidden sm:inline"> — read on, or go straight to the details</span>
            </p>
          </div>

          <a
            href="#reserve"
            tabIndex={shown ? 0 : -1}
            className="shrink-0 inline-flex items-center justify-center bg-rusty-spice-500 hover:bg-rusty-spice-600 text-white font-medium px-4 py-2.5 rounded transition-colors uppercase tracking-widest text-[0.65rem] sm:text-xs no-underline"
          >
            Details &amp; sign up
          </a>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            tabIndex={shown ? 0 : -1}
            aria-label="Hide this bar"
            className="shrink-0 text-dust-grey-200/60 hover:text-dust-grey-50 text-lg leading-none px-1 pb-1 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
