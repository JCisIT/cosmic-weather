// The daily Human Design brief. All wording is starter copy for Astra to rewrite in her own voice.
// Rule: every term is explained in plain words right where it appears.
import { CHANNELS } from './chart/chart.js'

export const GATE_PLAIN = {
  1: 'creative self-expression, doing it your own way', 2: 'inner direction, knowing which way to go before you know why',
  3: 'bringing order out of a messy beginning', 4: 'finding answers and formulas for open questions',
  5: 'natural rhythm, routine and timing', 6: 'emotional boundaries, deciding who gets close',
  7: 'leading by example and pointing the way', 8: 'contributing something original and letting it be seen',
  9: 'focus on the small details that add up', 10: 'self-love, behaving as yourself',
  11: 'a flood of ideas, not all meant to be acted on', 12: 'waiting for the right mood before you speak',
  13: 'listening, and holding other people\'s stories', 14: 'the energy and resources to fuel what matters',
  15: 'accepting extremes and human differences', 16: 'enthusiasm and practice that turn into skill',
  17: 'opinions, and seeing the pattern ahead', 18: 'spotting what needs fixing or improving',
  19: 'sensitivity to what people need', 20: 'being present and acting in the now',
  21: 'being in charge of your own resources and territory', 22: 'grace, charm and listening when the mood is right',
  23: 'saying a new insight simply so others get it', 24: 'mulling something over until it clicks',
  25: 'innocence, love without conditions', 26: 'persuasion, selling what you believe in',
  27: 'caring for and nourishing others', 28: 'finding what is worth struggling for',
  29: 'saying yes and staying committed', 30: 'strong feelings and desire for new experience',
  31: 'leading through influence, when invited', 32: 'an instinct for what will last',
  33: 'retreat, reflection and remembering', 34: 'raw power to do what you love',
  35: 'hunger for change and new experience', 36: 'emotional growth through what is new and intense',
  37: 'friendship, family and fair agreements', 38: 'fighting for what gives life meaning',
  39: 'provoking others to find their spirit', 40: 'working hard, then needing real rest alone',
  41: 'the first spark of a new feeling or dream', 42: 'finishing cycles, growing by completing things',
  43: 'sudden inner knowing, the breakthrough insight', 44: 'an instinct for patterns in people and what worked before',
  45: 'gathering people and resources', 46: 'love of the body, being in the right place at the right time',
  47: 'making sense of the past, the "aha" after confusion', 48: 'depth, a well of know-how',
  49: 'principles, knowing what you will and will not accept', 50: 'values, care for the wellbeing of the group',
  51: 'shock, courage and taking the leap', 52: 'stillness, concentrating by staying put',
  53: 'pressure to start something new', 54: 'ambition, the drive to rise',
  55: 'emotional spirit, moods that swing between full and empty', 56: 'storytelling, turning ideas into something stimulating',
  57: 'intuition in the moment, a quiet "this is right"', 58: 'joy and zest for making life better',
  59: 'breaking down barriers to closeness', 60: 'accepting limits and working within them',
  61: 'inner truth, the pull to know the unknowable', 62: 'details, facts and naming things precisely',
  63: 'doubt, questioning until something is proven', 64: 'confusion before clarity, images sorting themselves out',
}

export const LINE_THEME = {
  1: 'foundation: get the facts first',
  2: 'natural talent: let it come without forcing',
  3: 'trial and error: learn by bumping into things',
  4: 'friendship: it moves through people you know',
  5: 'the practical fix: others look to you for an answer',
  6: 'the long view: stand back and see the whole',
}

export const CENTER_PLAIN = {
  Head: 'inspiration and mental pressure', Ajna: 'thinking and making sense of things', Throat: 'speaking and making things happen',
  G: 'identity, love and direction', Heart: 'willpower and promises', Sacral: 'life-force energy for work and play',
  'Solar Plexus': 'emotions and moods', Spleen: 'instinct, wellbeing and timing', Root: 'stress and drive',
}

export const TYPE_PLAIN = {
  Generator: 'the type with steady life-force energy, built to respond to what shows up',
  'Manifesting Generator': 'a fast, multi-track type with steady energy, built to respond and then move quickly',
  Projector: 'the guide type, built to see others clearly and to wait for an invitation',
  Manifestor: 'the initiator type, built to start things and to inform people first',
  Reflector: 'the mirror type, with no fixed centers, built to sample and reflect the people around them',
}

export const TYPE_STRATEGY = {
  Generator: 'Trust the first gut yes or no before your mind edits it.',
  'Manifesting Generator': 'Let your gut respond first, then tell people before you move fast.',
  Projector: 'Wait for the invitation. Your insight lands when it is asked for.',
  Manifestor: 'Follow the urge, and inform the people it touches before you act.',
  Reflector: 'Sample the day without deciding. Big choices can wait for a full moon cycle.',
}

export const AUTHORITY_PLAIN = {
  Emotional: 'you decide best after riding out your emotional wave, never in the heat of the moment',
  Sacral: 'you decide by your gut response in the moment',
  Splenic: 'you decide by a quiet, instant instinct that speaks once',
  Ego: 'you decide by what you truly have the will and heart to commit to',
  'Self-Projected': 'you decide by hearing yourself talk it through out loud',
  Mental: 'you decide by talking it through with trusted people and noticing what feels right in different places',
  Lunar: 'you decide by waiting through a full cycle of the moon, about 28 days',
}

export const PROFILE_LINE = { 1: 'Investigator', 2: 'Hermit', 3: 'Experimenter', 4: 'Networker', 5: 'Problem-solver', 6: 'Role model' }

export const LESSONS = [
  ['Type', 'Your type is the broad way your energy works. There are five. It comes from which energy centers are switched on in your chart and how they connect.'],
  ['Strategy', 'Each type has a strategy: a simple rule for how to meet life with the least resistance. It is less a belief than an experiment to try.'],
  ['Authority', 'Authority is where in your body a trustworthy yes or no comes from. For most people it is not the mind.'],
  ['Centers', 'The chart has nine centers, a bit like the chakras. Each one handles a theme such as emotion, instinct or willpower.'],
  ['Defined and open', 'A defined center is colored in on your chart: it works in a steady, reliable way for you. An open center is white: you take in and amplify other people\'s energy there, which is where wisdom can grow.'],
  ['Gates', 'There are 64 gates, one for each hexagram of the I Ching. Each is a specific theme. The planets at your birth switched some of them on.'],
  ['Lines', 'Every gate has six lines. A line is the flavor of the gate, from line 1 (digging into foundations) to line 6 (the wide view).'],
  ['Channels', 'A channel joins two gates and connects two centers. When you have both gates, the channel is complete and both centers become defined.'],
  ['Hanging gates', 'A hanging gate is one you have without its partner at the other end. It reaches out for the other half, which is often what draws certain people to you.'],
  ['Profile', 'Your profile is two numbers, like 2/4. The first is how you see yourself; the second is how others meet you. It comes from the lines of your Sun at birth and about 88 days before.'],
  ['Incarnation cross', 'Your incarnation cross is made of four gates: the Sun and Earth at birth, and the Sun and Earth about 88 days earlier. Together they sketch the theme of your life\'s purpose.'],
  ['Transits', 'A transit is where a planet is today. The Sun moves through a new gate about every six days, so the whole world shares that theme for a while.'],
  ['Sun and Earth', 'The Sun shows the main theme of the moment. The Earth always sits in the opposite gate and shows what keeps that theme grounded.'],
  ['Gene Keys', 'Gene Keys uses the same 64 gates and describes each on a spectrum: a shadow (the fearful version), a gift (the healthy version) and a siddhi (its highest expression).'],
]

// A playful reading of a place's weather through the person's type. This is starter copy, not Human Design
// doctrine: it borrows each type's strategy and applies it to the mood of the weather there.
const MOOD = {
  open: { Generator: 'good energy to respond to, if your gut says yes', 'Manifesting Generator': 'room to move fast on whatever lights you up', Projector: 'the kind of day people there would welcome your insight, if they ask', Manifestor: 'an opening to start something, once you have told the people it touches', Reflector: 'a clear mirror, and you would feel that place at its best' },
  inward: { Generator: 'a time for the work you already love, and letting the rest wait', 'Manifesting Generator': 'a time to finish one thing before starting three', Projector: 'made for resting and watching, which is your real work', Manifestor: 'a time to rest between your bursts', Reflector: 'a quiet sample of that place, with nothing to decide' },
  charged: { Generator: 'notice what your gut pulls toward and away from', 'Manifesting Generator': 'let the first response settle before you leap', Projector: 'stay out of the rush and see what others miss', Manifestor: 'your kind of weather: act on the urge, and inform first', Reflector: 'a lot to take in, and you would want space there today' },
}
const SKY_WORD = { clear: ['Bright and open', 'Clear and still'], cloud: ['Soft and grey', 'Soft and dark'], fog: ['Quiet and veiled', 'Quiet and veiled'], rain: ['Rainy and inward', 'Rainy and inward'], snow: ['Hushed and white', 'Hushed and white'], storm: ['Charged and stormy', 'Charged and stormy'] }

export function placeEnergy(weather, where, type) {
  if (!type || !MOOD.open[type]) return null
  const mood = weather.kind === 'storm' ? 'charged' : weather.kind === 'clear' && weather.isDay ? 'open' : 'inward'
  const sky = (SKY_WORD[weather.kind] ?? SKY_WORD.cloud)[weather.isDay ? 0 : 1]
  return `${sky} in ${where} right now. For a ${type}: ${MOOD[mood][type]}.`
}

const partnerOf = (gate, owned) => CHANNELS.filter(([a, b]) => (a === gate && owned.has(b)) || (b === gate && owned.has(a)))

function describe(act) {
  return { gate: act.num, line: act.line, name: act.name, center: act.center, plain: GATE_PLAIN[act.num], lineTheme: LINE_THEME[act.line] }
}

// s = today's sky, chart = computed chart (or null), profile = saved profile (fallback when no chart).
export function buildInsight(s, chart, profile, date) {
  const sun = describe(s.sunGate)
  const earth = describe(s.earthGate)
  const owned = new Set(chart?.gates ?? [])
  const definedCenters = chart?.definedCenters ?? profile?.hd_centers ?? profile?.defined_centers ?? []
  const type = chart?.type ?? profile?.hd_type
  const personal = []

  const completes = owned.size && !owned.has(sun.gate) ? partnerOf(sun.gate, owned)[0] : null
  // One line for the top of the page: how today's theme meets this person's chart.
  let hook = 'The whole world shares this theme for the next few days.'
  if (owned.has(sun.gate)) hook = `This one is already yours. Gate ${sun.gate} lives in your chart.`
  else if (completes) hook = `A rare alignment: today completes your Channel of ${completes[4]}.`
  else if (definedCenters.length) hook = definedCenters.includes(sun.center) ? `It lands on home ground. Your ${sun.center} center is defined.` : `You will feel this one loudly. Your ${sun.center} center is open.`
  const theme = sun.plain.charAt(0).toUpperCase() + sun.plain.slice(1) + '.'

  if (owned.has(sun.gate)) {
    personal.push(`You have Gate ${sun.gate} in your own chart, so today's light falls on something that is already yours. It may feel familiar and stronger than usual.`)
  } else if (completes) {
    const [a, b, c1, c2, name] = completes
    const mine = a === sun.gate ? b : a
    personal.push(`Today's Sun gate meets your own Gate ${mine}. Together they complete the Channel of ${name}, a link between the ${c1} center (${CENTER_PLAIN[c1]}) and the ${c2} center (${CENTER_PLAIN[c2]}). For these few days that link switches on for you. Enjoy it, and remember it is borrowed.`)
  } else if (definedCenters.length) {
    personal.push(
      definedCenters.includes(sun.center)
        ? `Your ${sun.center} center is defined, meaning it works in a steady way for you. Today's theme lands on home ground.`
        : `Your ${sun.center} center is open, meaning you take in other people's energy there. You may feel today's theme louder than usual, and not all of it is yours to act on.`
    )
  } else {
    personal.push('Everyone feels this theme, each through their own chart.')
  }
  if (type && TYPE_STRATEGY[type]) personal.push(`As a ${type} (${TYPE_PLAIN[type]}): ${TYPE_STRATEGY[type]}`)

  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  const [title, body] = LESSONS[dayOfYear % LESSONS.length]
  return { sun, earth, personal, hook, theme, type, strategy: TYPE_STRATEGY[type] ?? null, lesson: { title, body } }
}
