// Concept library: the longer writing behind every tappable gate, line, center, channel and lesson.
// All of it is starter copy for Astra to rewrite. To plug in a CMS or markdown later, replace what this
// file exports (or have resolve.js fetch instead); the screens only ever ask resolve.js for a concept.

export const href = {
  gate: (n) => `#/concepts/gates/${n}`,
  line: (n) => `#/concepts/lines/${n}`,
  center: (name) => `#/concepts/centers/${slug(name)}`,
  channel: (a, b) => `#/concepts/channels/${Math.min(a, b)}-${Math.max(a, b)}`,
  lesson: (s) => `#/concepts/${s}`,
}

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// How each line shows up when the Sun is moving through it. Used in the daily brief.
export const LINE_INVITE = {
  1: "you're invited to slow down and find solid footing. Research before you leap; the foundation is the point.",
  2: "you're invited to let your natural gifts move without forcing them. Let yourself be called out rather than pushing in.",
  3: "you're invited to experiment, bump into things, and keep only what works. Nothing here is a mistake, only information.",
  4: "you're invited to lean on your people. What you need moves through relationships today, not cold starts.",
  5: "you're invited to offer the practical fix. People may look to you for an answer; give it, then step back.",
  6: "you're invited to step back from the noise, take the long view, and trust the bigger picture unfolding.",
}

export const LINE_DEEP = {
  1: { name: 'The Investigator', body: ['Line 1 wants solid ground. It studies, gathers facts and builds a foundation before it trusts anything.', 'When the Sun is in a first line, the world leans toward research and security. Insecurity is a signal to learn more, not to push harder.'] },
  2: { name: 'The Hermit', body: ['Line 2 carries natural talent it often does not see in itself. It needs time alone, and it gets called out by others who notice the gift.', 'When the Sun is in a second line, ease beats effort. Let what comes naturally lead.'] },
  3: { name: 'The Experimenter', body: ['Line 3 learns by trial and error. It bumps into what does not work and comes out wiser.', 'When the Sun is in a third line, expect plans to bend. The bumps are the lesson.'] },
  4: { name: 'The Networker', body: ['Line 4 lives through relationships. Opportunity arrives through people it already knows.', 'When the Sun is in a fourth line, reach toward your circle before you reach toward strangers.'] },
  5: { name: 'The Problem-solver', body: ['Line 5 is the one others project onto. People see a savior with a practical answer.', 'When the Sun is in a fifth line, offer solutions that work in the real world, and watch your reputation.'] },
  6: { name: 'The Role Model', body: ['Line 6 sees from the rooftop. It stands back, takes the long view and, over time, becomes an example of living its own way.', 'When the Sun is in a sixth line, step out of the scramble and look at the whole.'] },
}

export const CENTER_DEEP = {
  Head: { body: ['The Head is the pressure to know. Questions, inspiration and mental itch start here.'], defined: 'Defined, it gives you a consistent way of being inspired and thinking things through.', open: 'Open, it soaks up everyone\'s questions. Not every question in your head is yours to answer.' },
  Ajna: { body: ['The Ajna makes sense of things: concepts, opinions and certainty.'], defined: 'Defined, you process the world in a steady, recognisable way.', open: 'Open, you can see many perspectives. You do not need to be certain.' },
  Throat: { body: ['The Throat is where energy becomes words and action. Everything wants to get here.'], defined: 'Defined, your voice and the way you manifest are consistent.', open: 'Open, you speak differently with different people. Waiting for the right moment makes your words land.' },
  G: { body: ['The G center holds identity, love and direction: who you are and where you are going.'], defined: 'Defined, your sense of self and direction is steady.', open: 'Open, the right places and people show you who you are. Environment matters enormously.' },
  Heart: { body: ['The Heart, or Ego, is willpower, worth and the promises you make.'], defined: 'Defined, you have reliable willpower. Keep your word and rest after.', open: 'Open, there is nothing to prove. Promise less.' },
  Sacral: { body: ['The Sacral is life-force: the energy for work, sex and everything you love doing.'], defined: 'Defined, you have sustainable energy and a gut that responds with a yes or no.', open: 'Open, you borrow energy from others. Know when enough is enough, and rest before you are tired.' },
  'Solar Plexus': { body: ['The Solar Plexus is emotion, moving in waves of hope and pain, desire and feeling.'], defined: 'Defined, you have your own emotional wave. Clarity comes over time, never in the moment.', open: 'Open, you feel other people\'s emotions, often more strongly than they do. Notice what is yours.' },
  Spleen: { body: ['The Spleen is instinct, intuition, health and timing. It speaks once, quietly, in the moment.'], defined: 'Defined, you have a steady inner alarm and a strong immune sense.', open: 'Open, you are sensitive to wellbeing. Watch out for holding on to what feels safe but is not good for you.' },
  Root: { body: ['The Root is pressure: adrenaline, drive and the push to get things moving.'], defined: 'Defined, you handle pressure in a consistent way.', open: 'Open, you feel pressure from everywhere. Most of it is not yours to rush for.' },
}

// The rotating "Today's lesson". hook = two evocative sentences for the card; body = the full lesson.
export const LESSONS = [
  { slug: 'type', topic: 'Type', hook: 'Your energy has a shape. Learn it, and the way you move through a day stops feeling like a fight.', body: ['There are five types: Generator, Manifesting Generator, Projector, Manifestor and Reflector.', 'Your type comes from which centers are defined in your chart and how they connect. It describes how your energy works, not who you are.'] },
  { slug: 'strategy', topic: 'Strategy', hook: 'Every type has one simple way to meet life with less resistance. It is not a rule to obey, it is an experiment to try.', body: ['Generators respond. Manifesting Generators respond, then inform. Projectors wait for the invitation. Manifestors inform before they act. Reflectors wait a full moon cycle.', 'Try your strategy for a few weeks and notice what changes.'] },
  { slug: 'authority', topic: 'Authority', hook: 'Your truest yes does not live in your head. It lives somewhere in your body, and it has its own timing.', body: ['Authority is where a trustworthy decision comes from: your emotions over time, your gut in the moment, a quiet instinct, your will, your own voice, your surroundings, or the moon\'s cycle.', 'The mind is a beautiful advisor and a poor decider.'] },
  { slug: 'centers', topic: 'Centers', hook: 'Your chart holds nine energy centers, each one a distinct frequency of emotion, intuition or willpower. Learn where you broadcast energy, and where you absorb the room.', body: ['The nine centers are the Head, Ajna, Throat, G, Heart, Sacral, Solar Plexus, Spleen and Root.', 'Colored-in centers are defined: steady and reliable. White centers are open: they take in and amplify the people around you, which is where your wisdom grows.'] },
  { slug: 'definition', topic: 'Defined and open', hook: 'Some parts of you are fixed and steady. Others are wide open windows, and that is where you learn the most.', body: ['A defined center works consistently, whoever you are with.', 'An open center takes in other people\'s energy and amplifies it. It is not a weakness; it is where you become wise about that theme.'] },
  { slug: 'gates', topic: 'Gates', hook: 'Sixty-four doorways ring the wheel, one for each hexagram of the I Ching. The sky opens a new one about every six days.', body: ['Each gate is a specific theme. The planets at your birth switched some of them on for you.', 'The Sun\'s gate each day is a theme the whole world shares for a while.'] },
  { slug: 'lines', topic: 'Lines', hook: 'Every gate speaks in six voices. The line tells you which one the day is using.', body: ['Line 1 investigates. Line 2 lets talent flow. Line 3 experiments. Line 4 networks. Line 5 fixes. Line 6 takes the long view.', 'Your profile is made of two of these lines.'] },
  { slug: 'channels', topic: 'Channels', hook: 'When two matching gates meet, a current runs between two centers. That current is part of what makes you, you.', body: ['A channel joins two gates and two centers. Have both gates and the channel is complete, and both centers become defined.', 'Transits can complete a channel for you for a few days. It feels like borrowed electricity.'] },
  { slug: 'hanging-gates', topic: 'Hanging gates', hook: 'Some of your gates reach out with nobody holding the other end. That reaching is often what draws certain people to you.', body: ['A hanging gate is one you have without its partner gate.', 'When someone with the partner gate walks in, a channel completes between you. Chemistry, explained.'] },
  { slug: 'profile', topic: 'Profile', hook: 'Two numbers describe the costume you wear in this life. One is how you see yourself, the other is how the world meets you.', body: ['Your profile comes from the lines of your Sun at birth and about 88 days before.', 'A 2/4 is a hermit who is called out through friendships. A 5/1 is a problem-solver who needs solid research behind them.'] },
  { slug: 'incarnation-cross', topic: 'Incarnation cross', hook: 'Four gates sketch the theme of your purpose. You do not chase it; you live into it.', body: ['The cross is made of your birth Sun and Earth, and your Sun and Earth from about 88 days earlier.', 'It is the deepest layer of a chart, and usually best explored with a reader.'] },
  { slug: 'transits', topic: 'Transits', hook: 'The sky is always moving, and it moves through you. A transit is simply today\'s weather in your chart.', body: ['A transit is where a planet is right now. When it lands on a gate you already have, you feel that theme louder.', 'When it completes a channel for you, you get a few days of a different kind of energy.'] },
  { slug: 'sun-and-earth', topic: 'Sun and Earth', hook: 'The Sun shines the day\'s theme. The Earth, opposite it, keeps you standing while you carry it.', body: ['The Sun carries about 70 percent of the neutrino imprint in Human Design, which is why its gate is the headline.', 'The Earth always sits in the gate directly across the wheel, and shows what grounds the Sun\'s theme.'] },
  { slug: 'gene-keys', topic: 'Gene Keys', hook: 'Every gate has a shadow, a gift and a highest expression. Your attention decides which one you live today.', body: ['Gene Keys uses the same 64 gates and names three frequencies for each: the shadow (the fearful version), the gift (the healthy version) and the siddhi (its highest expression).', 'It is a contemplation practice rather than a set of rules.'] },
]

export const lessonFor = (date, overrideSlug) => {
  if (overrideSlug) {
    const hit = LESSONS.find((l) => l.slug === overrideSlug)
    if (hit) return hit
  }
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  return LESSONS[dayOfYear % LESSONS.length]
}
