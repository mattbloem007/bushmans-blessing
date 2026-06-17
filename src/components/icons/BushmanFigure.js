import React from 'react'

// San trance-dance figure — characteristic bent-forward pose of the healer/dancer
// as seen in southern African rock art
export default function BushmanFigure({ size = 80, color = 'currentColor', className }) {
  return (
    <svg
      viewBox="0 0 70 105"
      width={size}
      height={Math.round(size * 105 / 70)}
      className={className}
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="52" cy="13" r="10" fill={color} />

      {/* Neck + forward-bent body */}
      <path
        d="M50,23 Q40,36 22,56"
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Trailing arm — reaching back/upward */}
      <path
        d="M42,30 Q54,20 64,12"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Leading arm — reaching forward/downward */}
      <path
        d="M34,44 Q48,58 54,70"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Back leg (trailing) */}
      <path
        d="M22,56 Q14,72 10,90"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Front leg (striding forward) */}
      <path
        d="M24,58 Q34,74 40,92"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}
