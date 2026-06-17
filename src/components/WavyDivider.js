import React from 'react'

// Parallel wavy lines — echoing the linear entoptic patterns (grass, water, wind)
// found throughout San rock art. Use as a section ornament or subtle divider.
export default function WavyDivider({ color = 'currentColor', className }) {
  const W = 1200
  const amplitude = 7

  const wave = (yBase) => {
    const steps = 10
    const sw = W / steps
    let d = `M 0 ${yBase}`
    for (let i = 0; i < steps; i++) {
      const flip = i % 2 === 0 ? 1 : -1
      d += ` Q ${i * sw + sw * 0.5} ${yBase + flip * amplitude} ${(i + 1) * sw} ${yBase}`
    }
    return d
  }

  return (
    <svg
      viewBox="0 0 1200 52"
      preserveAspectRatio="none"
      width="100%"
      height="52"
      className={className}
      aria-hidden="true"
    >
      <path d={wave(10)} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="1" />
      <path d={wave(24)} stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d={wave(38)} stroke={color} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.35" />
    </svg>
  )
}
