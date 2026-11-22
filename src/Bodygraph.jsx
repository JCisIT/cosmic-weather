// A simple bodygraph: the nine centers, the paths between them, and where today's Sun and Earth are landing.
// Gold centers are the person's own (defined). A pulsing ring marks a center today's sky is touching.
const SHAPES = {
  Head: { at: [110, 36], points: '110,14 133,52 87,52' },
  Ajna: { at: [110, 76], points: '87,62 133,62 110,100' },
  Throat: { at: [110, 131], rect: [93, 114, 34] },
  G: { at: [110, 182], points: '110,157 135,182 110,207 85,182' },
  Heart: { at: [154, 208], points: '154,193 171,220 137,220' },
  Sacral: { at: [110, 248], rect: [93, 231, 34] },
  Spleen: { at: [44, 246], points: '25,223 25,269 65,246' },
  'Solar Plexus': { at: [176, 246], points: '195,223 195,269 155,246' },
  Root: { at: [110, 300], rect: [93, 283, 34] },
}

const PATHS = [
  ['Head', 'Ajna'], ['Ajna', 'Throat'], ['Throat', 'G'], ['Throat', 'Heart'], ['Throat', 'Spleen'], ['Throat', 'Sacral'], ['Throat', 'Solar Plexus'],
  ['G', 'Heart'], ['G', 'Sacral'], ['G', 'Spleen'], ['Heart', 'Spleen'], ['Heart', 'Solar Plexus'],
  ['Spleen', 'Sacral'], ['Spleen', 'Root'], ['Sacral', 'Solar Plexus'], ['Sacral', 'Root'], ['Solar Plexus', 'Root'],
]

const same = (a, b) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0])

export default function Bodygraph({ defined = [], channels = [], today = [], borrowed = null, label }) {
  const on = new Set(defined)
  return (
    <svg className="bodygraph" viewBox="0 0 220 334" role="img" aria-label={label}>
      {PATHS.map((pair) => {
        const [a, b] = pair.map((c) => SHAPES[c].at)
        const mine = channels.some((c) => same(c, pair))
        const lent = borrowed && same(borrowed, pair)
        return <line key={pair.join('-')} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={lent ? 'bg-path lent' : mine ? 'bg-path mine' : 'bg-path'} />
      })}
      {today.map((c, i) => (
        <circle key={c + i} className="bg-ring" cx={SHAPES[c].at[0]} cy={SHAPES[c].at[1]} r="31" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
      {Object.entries(SHAPES).map(([name, s]) => {
        const cls = on.has(name) ? 'bg-center mine' : 'bg-center'
        return s.rect ? <rect key={name} className={cls} x={s.rect[0]} y={s.rect[1]} width={s.rect[2]} height={s.rect[2]} rx="5" /> : <polygon key={name} className={cls} points={s.points} />
      })}
    </svg>
  )
}
