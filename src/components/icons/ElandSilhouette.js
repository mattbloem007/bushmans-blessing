import React from 'react'

export default function ElandSilhouette({ size = 120, color = '#fe5101', className = '' }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.65)}
      viewBox="0 0 200 130"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Simplified eland silhouette in San rock art flat style */}
      {/* Body */}
      <ellipse cx="100" cy="80" rx="55" ry="32" />
      {/* Neck */}
      <polygon points="140,60 155,30 165,32 152,62" />
      {/* Head */}
      <ellipse cx="160" cy="26" rx="14" ry="10" />
      {/* Muzzle */}
      <ellipse cx="172" cy="29" rx="7" ry="5" />
      {/* Horns — long spiral eland horns */}
      <path d="M153 18 Q148 2 158 -4 Q162 8 157 18" />
      <path d="M163 16 Q162 0 172 -6 Q174 6 167 16" />
      {/* Ear */}
      <ellipse cx="150" cy="20" rx="5" ry="8" transform="rotate(-20 150 20)" />
      {/* Dewlap (eland characteristic) */}
      <ellipse cx="155" cy="42" rx="6" ry="10" />
      {/* Legs — four flat San-style legs */}
      <rect x="72"  y="108" width="10" height="22" rx="3" />
      <rect x="90"  y="110" width="10" height="20" rx="3" />
      <rect x="112" y="108" width="10" height="22" rx="3" />
      <rect x="130" y="110" width="10" height="20" rx="3" />
      {/* Tail */}
      <path d="M46 78 Q32 70 30 60 Q36 62 42 72" />
    </svg>
  )
}
