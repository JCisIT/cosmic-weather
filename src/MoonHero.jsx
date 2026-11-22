// The big moon at the top of Today: a textured, softly lit moon inside a dial of the whole lunar cycle.
// elong: 0 = new moon, 180 = full moon. The gold marker on the dial shows where we are in the cycle.
export default function MoonHero({ elong, label }) {
  const waxing = elong < 180
  const a = waxing ? elong : 360 - elong
  const R = 58
  const rx = Math.max(0.01, R * Math.abs(Math.cos((a * Math.PI) / 180)))
  const sweep = a < 90 ? 0 : 1
  const lit = `M100 ${100 - R} A${R} ${R} 0 0 1 100 ${100 + R} A${rx} ${R} 0 0 ${sweep} 100 ${100 - R} Z`

  const D = 86
  const rad = (elong * Math.PI) / 180
  const mx = 100 + D * Math.sin(rad)
  const my = 100 - D * Math.cos(rad)
  const ticks = Array.from({ length: 30 }, (_, i) => {
    const t = (i / 30) * 2 * Math.PI
    const major = i % 15 === 0
    const r1 = D - (major ? 5 : 2.5)
    const r2 = D + (major ? 5 : 2.5)
    return <line key={i} x1={100 + r1 * Math.sin(t)} y1={100 - r1 * Math.cos(t)} x2={100 + r2 * Math.sin(t)} y2={100 - r2 * Math.cos(t)} stroke="#EAC296" strokeWidth={major ? 1.4 : 0.7} opacity={major ? 0.9 : 0.45} />
  })

  return (
    <svg className="moon-hero" viewBox="0 0 200 200" role="img" aria-label={label}>
      <defs>
        <radialGradient id="mh-halo" cx="50%" cy="50%" r="50%">
          <stop offset="48%" stopColor="#FDEDCB" stopOpacity="0.5" />
          <stop offset="72%" stopColor="#EAC296" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#EAC296" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mh-surface" cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#FFF8E2" />
          <stop offset="55%" stopColor="#F0D48E" />
          <stop offset="100%" stopColor="#B88A3C" />
        </radialGradient>
        <radialGradient id="mh-dark" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#3B3867" />
          <stop offset="100%" stopColor="#0A0E33" />
        </radialGradient>
        <filter id="mh-texture" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="11" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.27  0 0 0 0 0.08  0 0 0 -1.5 0.92" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="mh-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <clipPath id="mh-disc"><circle cx="100" cy="100" r={R} /></clipPath>
        <mask id="mh-lit">
          <g clipPath="url(#mh-disc)" filter="url(#mh-soft)">
            <path d={lit} fill="#fff" transform={waxing ? undefined : 'translate(200 0) scale(-1 1)'} />
          </g>
        </mask>
      </defs>

      <circle className="mh-halo" cx="100" cy="100" r="100" fill="url(#mh-halo)" />

      {/* the cycle dial */}
      <circle cx="100" cy="100" r={D} fill="none" stroke="#EAC296" strokeWidth="0.6" opacity="0.35" />
      {ticks}
      <circle cx={mx} cy={my} r="9" fill="#EAC296" opacity="0.25" />
      <circle cx={mx} cy={my} r="4.5" fill="#FDEDCB" stroke="#EAC296" strokeWidth="1.2" />

      {/* the moon itself */}
      <g className="mh-moon">
        <circle cx="100" cy="100" r={R} fill="url(#mh-dark)" />
        <g mask="url(#mh-lit)">
          <circle cx="100" cy="100" r={R} fill="url(#mh-surface)" />
          <g clipPath="url(#mh-disc)">
            <circle cx="100" cy="100" r={R} filter="url(#mh-texture)" opacity="0.55" />
            <ellipse cx="82" cy="80" rx="17" ry="13" fill="#9A7230" opacity="0.2" />
            <ellipse cx="113" cy="86" rx="12" ry="15" fill="#9A7230" opacity="0.16" />
            <ellipse cx="96" cy="120" rx="20" ry="11" fill="#9A7230" opacity="0.14" />
            <circle cx="126" cy="124" r="5" fill="#FFF8E2" opacity="0.35" />
            <circle cx="70" cy="112" r="3.5" fill="#FFF8E2" opacity="0.3" />
          </g>
        </g>
        <circle cx="100" cy="100" r={R} fill="none" stroke="#FDEDCB" strokeWidth="0.6" opacity="0.5" />
      </g>
    </svg>
  )
}
