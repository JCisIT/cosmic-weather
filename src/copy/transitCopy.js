// The daily briefing voice: warm, direct, poetic. Copy is built as segments so concept names become tappable
// pills: a segment is either a string or { label, href }. Definitions live in the pills, not the sentences.
import { GATE_PLAIN, CENTER_PLAIN, TYPE_STRATEGY } from '../insight.js'
import { CHANNELS } from '../chart/chart.js'
import { href, LINE_INVITE } from '../concepts/content.js'

const pill = (label, to) => ({ label, href: to })
const centerLabel = (c) => (c === 'G' ? 'G center' : c)

export function sunTransitCopy(sun) {
  return [
    'Today, the Sun moves through ', pill(`Gate ${sun.num}`, href.gate(sun.num)),
    `, ${sun.name}: ${GATE_PLAIN[sun.num]}. In `, pill(`Line ${sun.line}`, href.line(sun.line)),
    `, ${LINE_INVITE[sun.line]}`,
  ]
}

export function earthTransitCopy(earth) {
  return [
    'Across the wheel, the Earth anchors you in ', pill(`Gate ${earth.num}`, href.gate(earth.num)),
    `: your steadiness today comes from ${GATE_PLAIN[earth.num]}.`,
  ]
}

const partner = (gate, owned) => CHANNELS.find(([a, b]) => (a === gate && owned.has(b)) || (b === gate && owned.has(a)))

// How today's Sun and Earth meet this person's chart. Returns a list of paragraphs (each a list of segments).
export function personalCopy(sun, earth, chart, type) {
  const owned = new Set(chart.gates)
  const defined = new Set(chart.definedCenters)
  const out = []

  if (owned.has(sun.num)) {
    out.push([pill(`Gate ${sun.num}`, href.gate(sun.num)), ' already lives in your chart, so today\'s light lands on something familiar. Expect it to feel louder, and more like you.'])
  } else {
    const ch = partner(sun.num, owned)
    if (ch) {
      const [a, b, c1, c2, name] = ch
      const mine = a === sun.num ? b : a
      out.push(['Today\'s Sun meets your own ', pill(`Gate ${mine}`, href.gate(mine)), ' and completes the ', pill(`Channel of ${name}`, href.channel(a, b)), ', wiring your ', pill(centerLabel(c1), href.center(c1)), ' to your ', pill(centerLabel(c2), href.center(c2)), ' for a few days. Borrowed electricity: enjoy it, and don\'t build your life on it.'])
    }
  }

  const c = sun.center
  out.push(defined.has(c)
    ? ['It lands in your ', pill(centerLabel(c), href.center(c)), `, which is defined in you: steady ground for ${CENTER_PLAIN[c]}. Today simply turns the volume up.`]
    : ['It lands in your ', pill(centerLabel(c), href.center(c)), ', which is open in you. You\'ll feel the room\'s version of this theme; notice it, and keep only what\'s yours.'])

  if (earth.center !== c && !defined.has(earth.center)) {
    out.push(['The Earth touches your open ', pill(centerLabel(earth.center), href.center(earth.center)), ' too, so let your grounding come from people and places that feel good.'])
  }

  if (type && TYPE_STRATEGY[type]) out.push([`As a ${type}: ${TYPE_STRATEGY[type].charAt(0).toLowerCase()}${TYPE_STRATEGY[type].slice(1)}`])
  return out
}
