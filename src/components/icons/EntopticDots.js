import React from 'react'

// Grid of dots — one of the most common entoptic patterns in San rock art,
// associated with trance visuals and appearing in panels across southern Africa.
export default function EntopticDots({ rows = 4, cols = 16, gap = 14, dotSize = 2.5, color = 'currentColor', className }) {
  const w = (cols + 1) * gap
  const h = (rows + 1) * gap

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={(c + 1) * gap}
            cy={(r + 1) * gap}
            r={dotSize}
            fill={color}
          />
        ))
      )}
    </svg>
  )
}
