import test from 'node:test'
import assert from 'node:assert/strict'
import { positions, designDate, derive, computeChart, zonedToUtc, CHANNELS } from '../src/chart/chart.js'

const near = (a, b, tol) => Math.abs(((a - b + 540) % 360) - 180) <= tol
const act = (gates) => Object.fromEntries(gates.map((g, i) => [i === 0 ? 'Sun' : i === 1 ? 'Earth' : 'b' + i, { num: g, line: 1 }]))

test('positions match a published ephemeris for 1 Jan 2000, 0h UT', () => {
  const p = positions(new Date(Date.UTC(2000, 0, 1)))
  const expected = { Sun: 279.86, Moon: 217.29, Mars: 327.58, Jupiter: 25.23, Saturn: 40.4, Uranus: 314.78, Neptune: 303.18, Pluto: 251.44 }
  for (const [body, lon] of Object.entries(expected)) assert.ok(near(p[body], lon, 0.05), `${body} ${p[body]}`)
  assert.ok(near(p.Earth, p.Sun + 180, 1e-9))
  assert.ok(near(p['South Node'], p['North Node'] + 180, 1e-9))
})

test('the node is the true node, not the mean node', () => {
  // On 1 Jan 2000 the mean node was near 125.07 and the true node near 123.9: over a degree apart.
  const node = positions(new Date(Date.UTC(2000, 0, 1)))['North Node']
  assert.ok(near(node, 123.9, 0.2), `node ${node}`)
  assert.ok(!near(node, 125.07, 0.5))
})

test('design date is where the Sun was 88 degrees earlier', () => {
  const birth = new Date(Date.UTC(1985, 5, 15, 18, 30))
  const design = designDate(birth)
  const diff = (positions(birth).Sun - positions(design).Sun + 360) % 360
  assert.ok(Math.abs(diff - 88) < 0.001, `diff ${diff}`)
  const days = (birth - design) / 86400000
  assert.ok(days > 84 && days < 93, `days ${days}`)
})

test('there are 36 channels and every gate sits in at least one', () => {
  assert.equal(CHANNELS.length, 36)
  assert.equal(new Set(CHANNELS.flatMap(([a, b]) => [a, b])).size, 64)
})

test('type and authority derive from the channels', () => {
  // Sacral to Root only: Generator, Sacral authority.
  let c = derive(act([3, 60]), act([3, 60]))
  assert.deepEqual([c.type, c.authority], ['Generator', 'Sacral'])
  // Sacral straight to Throat: Manifesting Generator.
  c = derive(act([20, 34]), act([20, 34]))
  assert.equal(c.type, 'Manifesting Generator')
  // Sacral reaches Throat through the G center: still a Manifesting Generator.
  c = derive(act([2, 14, 8, 1]), act([2, 14]))
  assert.equal(c.type, 'Manifesting Generator')
  // Heart to Throat, no Sacral: Manifestor with Ego authority.
  c = derive(act([45, 21]), act([45, 21]))
  assert.deepEqual([c.type, c.authority], ['Manifestor', 'Ego'])
  // Solar Plexus to Throat: Manifestor with Emotional authority.
  c = derive(act([35, 36]), act([35, 36]))
  assert.deepEqual([c.type, c.authority], ['Manifestor', 'Emotional'])
  // Spleen to Root, nothing to the Throat: Projector, Splenic.
  c = derive(act([32, 54]), act([32, 54]))
  assert.deepEqual([c.type, c.authority], ['Projector', 'Splenic'])
  // G to Throat only: Projector, Self-Projected.
  c = derive(act([31, 7]), act([31, 7]))
  assert.deepEqual([c.type, c.authority], ['Projector', 'Self-Projected'])
  // Head to Ajna only: Projector, Mental.
  c = derive(act([63, 4]), act([63, 4]))
  assert.deepEqual([c.type, c.authority], ['Projector', 'Mental'])
  // Root defined with a motor, but Throat not defined: not a Manifestor.
  c = derive(act([49, 19]), act([49, 19]))
  assert.equal(c.type, 'Projector')
  // No complete channel: Reflector, with every gate hanging.
  c = derive(act([1, 2, 3]), act([4, 5]))
  assert.deepEqual([c.type, c.authority, c.hangingGates], ['Reflector', 'Lunar', [1, 2, 3, 4, 5]])
})

test('hanging gates are activated gates without their partner', () => {
  const c = derive(act([3, 60, 41]), act([20, 20]))
  assert.deepEqual(c.hangingGates, [20, 41])
  assert.deepEqual(c.definedCenters.sort(), ['Root', 'Sacral'])
})

test('a full chart computes with 26 activations and a profile', () => {
  const c = computeChart(new Date(Date.UTC(1985, 5, 15, 18, 30)))
  assert.equal(Object.keys(c.personality).length, 13)
  assert.equal(Object.keys(c.design).length, 13)
  assert.match(c.profile, /^[1-6]\/[1-6]$/)
  assert.equal(c.cross.gates.length, 4)
})

test('local birth time converts to UTC with the zone rules of that date', () => {
  assert.equal(zonedToUtc('1985-06-15', '11:30', 'America/Los_Angeles').toISOString(), '1985-06-15T18:30:00.000Z') // daylight time
  assert.equal(zonedToUtc('1985-01-15', '11:30', 'America/Los_Angeles').toISOString(), '1985-01-15T19:30:00.000Z') // standard time
})
