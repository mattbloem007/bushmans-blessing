import React from 'react'

export default function LegalSection({ heading, children }) {
  return (
    <section className="mb-10">
      <h2
        className="text-dust-grey-950 mb-4"
        style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
      >
        {heading}
      </h2>
      <div className="text-base leading-relaxed text-dust-grey-800 space-y-4">{children}</div>
    </section>
  )
}
