import React from 'react'

export default function EyeSymbol({ size = 80, color = '#fe5101', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="1.5" opacity="0.4" />
      {/* Mid ring */}
      <circle cx="40" cy="40" r="26" stroke={color} strokeWidth="1.5" opacity="0.6" />
      {/* Inner ring */}
      <circle cx="40" cy="40" r="16" stroke={color} strokeWidth="1.5" opacity="0.8" />
      {/* Centre dot */}
      <circle cx="40" cy="40" r="4" fill={color} />
      {/* Radiating dots — 8 compass points */}
      <circle cx="40" cy="2"  r="2" fill={color} opacity="0.5" />
      <circle cx="40" cy="78" r="2" fill={color} opacity="0.5" />
      <circle cx="2"  cy="40" r="2" fill={color} opacity="0.5" />
      <circle cx="78" cy="40" r="2" fill={color} opacity="0.5" />
      <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.4" />
      <circle cx="68" cy="12" r="1.5" fill={color} opacity="0.4" />
      <circle cx="12" cy="68" r="1.5" fill={color} opacity="0.4" />
      <circle cx="68" cy="68" r="1.5" fill={color} opacity="0.4" />
    </svg>
  )
}
