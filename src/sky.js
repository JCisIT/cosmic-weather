// Sky maths: Sun and Moon positions, moon phase, Human Design gates.
// Sun is accurate to about 0.01 degrees. Moon uses a short series (about 0.3 degrees),
// so its gate can be off near a gate boundary.

const R = Math.PI / 180
const norm = (x) => ((x % 360) + 360) % 360

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

// Gate order around the wheel, starting with Gate 41 at 2 degrees Aquarius (302 degrees).
const WHEEL = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60]

export const GATES = {
  1: ['Self-Expression', 'G'], 2: ['Direction', 'G'], 3: ['Ordering', 'Sacral'], 4: ['Formulization', 'Ajna'],
  5: ['Fixed Rhythms', 'Sacral'], 6: ['Friction', 'Solar Plexus'], 7: ['The Role of the Self', 'G'], 8: ['Contribution', 'Throat'],
  9: ['Focus', 'Sacral'], 10: ['Behavior of the Self', 'G'], 11: ['Ideas', 'Ajna'], 12: ['Caution', 'Throat'],
  13: ['The Listener', 'G'], 14: ['Power Skills', 'Sacral'], 15: ['Extremes', 'G'], 16: ['Skills', 'Throat'],
  17: ['Opinions', 'Ajna'], 18: ['Correction', 'Spleen'], 19: ['Wanting', 'Root'], 20: ['The Now', 'Throat'],
  21: ['The Hunter', 'Heart'], 22: ['Openness', 'Solar Plexus'], 23: ['Assimilation', 'Throat'], 24: ['Rationalization', 'Ajna'],
  25: ['Spirit of the Self', 'G'], 26: ['The Egoist', 'Heart'], 27: ['Caring', 'Sacral'], 28: ['The Game Player', 'Spleen'],
  29: ['Perseverance', 'Sacral'], 30: ['Feelings', 'Solar Plexus'], 31: ['Leading', 'Throat'], 32: ['Continuity', 'Spleen'],
  33: ['Privacy', 'Throat'], 34: ['Power', 'Sacral'], 35: ['Change', 'Throat'], 36: ['Crisis', 'Solar Plexus'],
  37: ['Friendship', 'Solar Plexus'], 38: ['The Fighter', 'Root'], 39: ['Provocation', 'Root'], 40: ['Aloneness', 'Heart'],
  41: ['Contraction', 'Root'], 42: ['Growth', 'Sacral'], 43: ['Insight', 'Ajna'], 44: ['Alertness', 'Spleen'],
  45: ['The Gatherer', 'Throat'], 46: ['Determination', 'G'], 47: ['Realization', 'Ajna'], 48: ['Depth', 'Spleen'],
  49: ['Principles', 'Solar Plexus'], 50: ['Values', 'Spleen'], 51: ['Shock', 'Heart'], 52: ['Stillness', 'Root'],
  53: ['Beginnings', 'Root'], 54: ['Ambition', 'Root'], 55: ['Spirit', 'Solar Plexus'], 56: ['Stimulation', 'Throat'],
  57: ['Intuitive Clarity', 'Spleen'], 58: ['Vitality', 'Root'], 59: ['Sexuality', 'Sacral'], 60: ['Acceptance', 'Root'],
  61: ['Mystery', 'Head'], 62: ['Details', 'Throat'], 63: ['Doubt', 'Head'], 64: ['Confusion', 'Head'],
}

export const PHASES = [
  { name: 'New moon', line: 'Dark and quiet', energy: 'Low' },
  { name: 'Waxing crescent', line: 'Thin light, gaining', energy: 'Rising' },
  { name: 'First quarter', line: 'Half lit, choosing', energy: 'Building' },
  { name: 'Waxing gibbous', line: 'Bright and building', energy: 'High' },
  { name: 'Full moon', line: 'Fully lit', energy: 'Peak' },
  { name: 'Waning gibbous', line: 'Bright, easing off', energy: 'Easing' },
  { name: 'Last quarter', line: 'Half lit, releasing', energy: 'Lowering' },
  { name: 'Waning crescent', line: 'Thin light, resting', energy: 'Resting' },
]

function longitudes(date) {
  const n = date.getTime() / 86400000 + 2440587.5 - 2451545.0
  const T = n / 36525
  const g = (357.528 + 0.9856003 * n) * R
  const sun = norm(280.46 + 0.9856474 * n + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g))
  const s = (a, b) => Math.sin((a + b * T) * R)
  const moon = norm(
    218.32 + 481267.881 * T + 6.29 * s(135.0, 477198.87) - 1.27 * s(259.3, -413335.36) + 0.66 * s(235.7, 890534.22) +
      0.21 * s(269.9, 954397.74) - 0.19 * s(357.5, 35999.05) - 0.11 * s(186.5, 966404.03)
  )
  return { sun, moon, elong: norm(moon - sun) }
}

export function gateAt(lon) {
  const d = norm(lon - 302)
  const num = WHEEL[Math.floor(d / 5.625)]
  return { num, line: Math.floor((d % 5.625) / 0.9375) + 1, name: GATES[num][0], center: GATES[num][1] }
}

const signOf = (lon) => SIGNS[Math.floor(lon / 30)]
const illumOf = (elong) => Math.round(((1 - Math.cos(elong * R)) / 2) * 100)

function countdown(days, what) {
  const r = Math.round(days)
  if (r < 1) return { what, days: 0, label: 'Tonight' }
  return { what, days: r, label: r === 1 ? '1 day' : `${r} days` }
}

export function sky(date = new Date()) {
  const { sun, moon, elong } = longitudes(date)
  const index = Math.floor(norm(elong + 22.5) / 45)
  const toFull = norm(180 - elong) / 12.19
  const toNew = norm(360 - elong) / 12.19
  return {
    elong,
    illum: illumOf(elong),
    waxing: elong < 180,
    phase: PHASES[index],
    sunGate: gateAt(sun),
    earthGate: gateAt(sun + 180),
    moonGate: gateAt(moon),
    sunSign: signOf(sun),
    moonSign: signOf(moon),
    next: toFull < toNew ? countdown(toFull, 'Full moon') : countdown(toNew, 'New moon'),
    tomorrowSunGate: gateAt(longitudes(new Date(date.getTime() + 86400000)).sun),
  }
}

// Seven days starting today, each read at local noon.
export function weekAhead(date = new Date()) {
  const out = []
  for (let i = 0; i < 7; i++) {
    const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i, 12)
    const start = longitudes(new Date(noon.getTime() - 43200000)).elong
    const end = longitudes(new Date(noon.getTime() + 43200000)).elong
    const { elong } = longitudes(i === 0 ? date : noon)
    let mark = null
    if (start < 180 && end >= 180) mark = 'Full'
    if (start > end) mark = 'New'
    out.push({ date: noon, elong, illum: illumOf(elong), waxing: elong < 180, mark })
  }
  return out
}
