// Turns a concept address (from the URL hash) into what the drawer shows.
// Addresses: gates/14, lines/6, centers/solar-plexus, channels/2-14, or a lesson slug such as centers.
import { GATES } from '../sky.js'
import { CHANNELS } from '../chart/chart.js'
import { GATE_PLAIN, CENTER_PLAIN } from '../insight.js'
import { href, slug, LINE_DEEP, CENTER_DEEP, LESSONS } from './content.js'

const CENTER_BY_SLUG = Object.fromEntries(Object.keys(CENTER_DEEP).map((c) => [slug(c), c]))
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// ctx = { chart } for personal notes; it can be null.
export function resolveConcept(path, ctx = {}) {
  const [kind, id] = path.split('/')
  const owned = new Set(ctx.chart?.gates ?? [])
  const defined = new Set(ctx.chart?.definedCenters ?? [])

  if (kind === 'gates' && GATES[id]) {
    const n = Number(id)
    const [name, center] = GATES[n]
    const pairs = CHANNELS.filter(([a, b]) => a === n || b === n)
    return {
      eyebrow: `Gate ${n} · ${center} center`,
      title: name,
      lead: `${cap(GATE_PLAIN[n])}.`,
      body: [`This gate lives in the ${center} center, the seat of ${CENTER_PLAIN[center]}.`],
      personal: ctx.chart ? (owned.has(n) ? 'This gate is active in your own chart, so its theme is part of you every day.' : 'This gate is not active in your chart. When the sky lights it up, you get to try it on.') : null,
      related: [
        ...pairs.map(([a, b, , , cname]) => ({ label: `Channel of ${cname}`, href: href.channel(a, b) })),
        { label: `${center} center`, href: href.center(center) },
        { label: 'What are gates?', href: href.lesson('gates') },
      ],
    }
  }

  if (kind === 'lines' && LINE_DEEP[id]) {
    const l = LINE_DEEP[id]
    return { eyebrow: `Line ${id}`, title: l.name, lead: l.body[0], body: l.body.slice(1), related: [{ label: 'What are lines?', href: href.lesson('lines') }, { label: 'Profile', href: href.lesson('profile') }] }
  }

  if (kind === 'centers' && CENTER_BY_SLUG[id]) {
    const c = CENTER_BY_SLUG[id]
    const d = CENTER_DEEP[c]
    return {
      eyebrow: 'Energy center',
      title: c === 'G' ? 'The G center' : `The ${c}`,
      lead: d.body[0],
      body: [d.defined, d.open],
      personal: ctx.chart ? (defined.has(c) ? `Your ${c} is defined.` : `Your ${c} is open.`) : null,
      related: [{ label: 'The nine centers', href: href.lesson('centers') }, { label: 'Defined and open', href: href.lesson('definition') }],
    }
  }

  if (kind === 'channels' && /^\d+-\d+$/.test(id ?? '')) {
    const [a, b] = id.split('-').map(Number)
    const ch = CHANNELS.find(([x, y]) => (x === a && y === b) || (x === b && y === a))
    if (ch) {
      const [g1, g2, c1, c2, name] = ch
      return {
        eyebrow: `Channel ${g1}-${g2}`,
        title: `The Channel of ${name}`,
        lead: `A current between the ${c1} (${CENTER_PLAIN[c1]}) and the ${c2} (${CENTER_PLAIN[c2]}).`,
        body: [`It forms when Gate ${g1} and Gate ${g2} are both active.`],
        personal: ctx.chart ? (ctx.chart.channels.some((c) => c.name === name) ? 'This channel is complete in your chart.' : null) : null,
        related: [{ label: `Gate ${g1}`, href: href.gate(g1) }, { label: `Gate ${g2}`, href: href.gate(g2) }, { label: 'What are channels?', href: href.lesson('channels') }],
      }
    }
  }

  const lesson = LESSONS.find((l) => l.slug === kind)
  if (lesson && !id) return { eyebrow: "Today's lesson", title: lesson.topic, lead: lesson.hook, body: lesson.body, related: [] }

  return null
}
