// Human Design chart, computed from a birth moment.
// Positions come from astronomy-engine (apparent, tropical, ecliptic of date). The lunar node is the
// TRUE (osculating) node, derived from the Moon's position and velocity, not the mean node.
import * as Astronomy from 'astronomy-engine'
import { gateAt } from '../sky.js'

const DEG = 180 / Math.PI
const norm = (x) => ((x % 360) + 360) % 360
const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']

// [gate, gate, center, center, name]
export const CHANNELS = [
  [64, 47, 'Head', 'Ajna', 'Abstraction'], [61, 24, 'Head', 'Ajna', 'Awareness'], [63, 4, 'Head', 'Ajna', 'Logic'],
  [17, 62, 'Ajna', 'Throat', 'Acceptance'], [43, 23, 'Ajna', 'Throat', 'Structuring'], [11, 56, 'Ajna', 'Throat', 'Curiosity'],
  [31, 7, 'Throat', 'G', 'The Alpha'], [8, 1, 'Throat', 'G', 'Inspiration'], [33, 13, 'Throat', 'G', 'The Prodigal'], [20, 10, 'Throat', 'G', 'Awakening'],
  [45, 21, 'Throat', 'Heart', 'Money'], [16, 48, 'Throat', 'Spleen', 'The Wavelength'], [20, 57, 'Throat', 'Spleen', 'The Brainwave'],
  [20, 34, 'Throat', 'Sacral', 'Charisma'], [35, 36, 'Throat', 'Solar Plexus', 'Transitoriness'], [12, 22, 'Throat', 'Solar Plexus', 'Openness'],
  [25, 51, 'G', 'Heart', 'Initiation'], [15, 5, 'G', 'Sacral', 'Rhythm'], [2, 14, 'G', 'Sacral', 'The Beat'], [46, 29, 'G', 'Sacral', 'Discovery'],
  [10, 57, 'G', 'Spleen', 'Perfected Form'], [10, 34, 'G', 'Sacral', 'Exploration'],
  [26, 44, 'Heart', 'Spleen', 'Surrender'], [40, 37, 'Heart', 'Solar Plexus', 'Community'],
  [50, 27, 'Spleen', 'Sacral', 'Preservation'], [57, 34, 'Spleen', 'Sacral', 'Power'],
  [32, 54, 'Spleen', 'Root', 'Transformation'], [28, 38, 'Spleen', 'Root', 'Struggle'], [18, 58, 'Spleen', 'Root', 'Judgment'],
  [59, 6, 'Sacral', 'Solar Plexus', 'Intimacy'], [42, 53, 'Sacral', 'Root', 'Maturation'], [3, 60, 'Sacral', 'Root', 'Mutation'], [9, 52, 'Sacral', 'Root', 'Concentration'],
  [49, 19, 'Solar Plexus', 'Root', 'Synthesis'], [55, 39, 'Solar Plexus', 'Root', 'Emoting'], [30, 41, 'Solar Plexus', 'Root', 'Recognition'],
]

const MOTORS = ['Heart', 'Solar Plexus', 'Sacral', 'Root']

function trueNode(time) {
  const s = Astronomy.RotateState(Astronomy.Rotation_EQJ_ECT(time), Astronomy.GeoMoonState(time))
  // Angular momentum h = r x v. The ascending node lies along (ecliptic pole) x h.
  const hx = s.y * s.vz - s.z * s.vy
  const hy = s.z * s.vx - s.x * s.vz
  return norm(Math.atan2(hx, -hy) * DEG)
}

// Ecliptic longitudes of the thirteen Human Design bodies at one moment.
export function positions(date) {
  const t = Astronomy.MakeTime(date)
  const sun = Astronomy.SunPosition(t).elon
  const node = trueNode(t)
  const out = { Sun: sun, Earth: norm(sun + 180), Moon: Astronomy.EclipticGeoMoon(t).lon, 'North Node': node, 'South Node': norm(node + 180) }
  for (const p of PLANETS) out[p] = Astronomy.Ecliptic(Astronomy.GeoVector(p, t, true)).elon
  return out
}

// The "design" moment: when the Sun was exactly 88 degrees of longitude before its birth position (about 88 days earlier).
export function designDate(birth) {
  const target = norm(Astronomy.SunPosition(Astronomy.MakeTime(birth)).elon - 88)
  const start = Astronomy.MakeTime(new Date(birth.getTime() - 96 * 86400000))
  const found = Astronomy.SearchSunLongitude(target, start, 20)
  if (!found) throw new Error('Could not find the design date')
  return found.date
}

function activations(pos) {
  return Object.fromEntries(Object.entries(pos).map(([body, lon]) => [body, { lon, ...gateAt(lon) }]))
}

function reachesMotor(defined, channels) {
  // Walk outward from the Throat along defined channels and see if any motor is reached.
  const seen = new Set(['Throat'])
  const queue = ['Throat']
  while (queue.length) {
    const c = queue.shift()
    for (const ch of channels) {
      const next = ch.centers[0] === c ? ch.centers[1] : ch.centers[1] === c ? ch.centers[0] : null
      if (next && !seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }
  return defined.has('Throat') && MOTORS.some((m) => seen.has(m))
}

const ANGLE = { '4/1': 'Juxtaposition', '5/1': 'Left Angle', '5/2': 'Left Angle', '6/2': 'Left Angle', '6/3': 'Left Angle' }

// Derive type, authority and the rest from two sets of activations. Exported so it can be tested on its own.
export function derive(personality, design) {
  const gates = new Set([...Object.values(personality), ...Object.values(design)].map((a) => a.num))
  const channels = CHANNELS.filter(([a, b]) => gates.has(a) && gates.has(b)).map(([a, b, c1, c2, name]) => ({ gates: [a, b], centers: [c1, c2], name }))
  const defined = new Set(channels.flatMap((c) => c.centers))
  const inChannel = new Set(channels.flatMap((c) => c.gates))
  const hanging = [...gates].filter((g) => !inChannel.has(g)).sort((a, b) => a - b)

  const motorToThroat = reachesMotor(defined, channels)
  let type = 'Reflector'
  if (defined.has('Sacral')) type = motorToThroat ? 'Manifesting Generator' : 'Generator'
  else if (motorToThroat) type = 'Manifestor'
  else if (defined.size) type = 'Projector'

  let authority = 'Lunar'
  if (defined.has('Solar Plexus')) authority = 'Emotional'
  else if (defined.has('Sacral')) authority = 'Sacral'
  else if (defined.has('Spleen')) authority = 'Splenic'
  else if (defined.has('Heart')) authority = 'Ego'
  else if (defined.has('G')) authority = 'Self-Projected'
  else if (defined.size) authority = 'Mental'

  const profile = `${personality.Sun.line}/${design.Sun.line}`
  return {
    type,
    authority,
    profile,
    definedCenters: [...defined],
    channels,
    gates: [...gates].sort((a, b) => a - b),
    hangingGates: hanging,
    cross: {
      angle: ANGLE[profile] ?? 'Right Angle',
      gates: [personality.Sun.num, personality.Earth.num, design.Sun.num, design.Earth.num],
    },
  }
}

export function computeChart(birthUtc) {
  const design = designDate(birthUtc)
  const personality = activations(positions(birthUtc))
  const designActs = activations(positions(design))
  return { birthUtc, designUtc: design, personality, design: designActs, ...derive(personality, designActs) }
}

// Turn a local birth date and time in a named time zone into the UTC moment, using the browser's zone history.
export function zonedToUtc(dateStr, timeStr, timeZone) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = timeStr.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
  const wall = (ms) => {
    const p = Object.fromEntries(fmt.formatToParts(new Date(ms)).map((x) => [x.type, Number(x.value)]))
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute)
  }
  // Two passes settle the offset even across a daylight-saving change.
  let utc = guess - (wall(guess) - guess)
  utc = guess - (wall(utc) - utc)
  return new Date(utc)
}
