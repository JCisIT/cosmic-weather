// The moon at a given elongation (0 = new, 180 = full), lit side on the right while waxing.
export default function Moon({ elong, size = 84, label }) {
  const waxing = elong < 180
  const a = waxing ? elong : 360 - elong
  const rx = Math.max(0.01, 42 * Math.abs(Math.cos((a * Math.PI) / 180)))
  const sweep = a < 90 ? 0 : 1
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label || 'Moon phase'} style={{ flex: 'none' }}>
      <circle cx="50" cy="50" r="49" fill="none" stroke="#EAC296" strokeWidth="0.6" opacity="0.5" />
      <circle cx="50" cy="50" r="42" fill="#3B3867" />
      <path d={`M50 8 A42 42 0 0 1 50 92 A${rx} 42 0 0 ${sweep} 50 8 Z`} fill="#EAC296" transform={waxing ? undefined : 'translate(100 0) scale(-1 1)'} />
    </svg>
  )
}
