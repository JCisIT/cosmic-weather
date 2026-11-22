// Starter copy. Everything here is placeholder wording for Astra to rewrite in her own voice.
// Later this moves to a sheet or studio screen she edits herself.

export const TYPES = ['Generator', 'Manifesting Generator', 'Projector', 'Manifestor', 'Reflector']
export const PROFILES = ['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6', '4/1', '5/1', '5/2', '6/2', '6/3']
export const AUTHORITIES = ['Emotional', 'Sacral', 'Splenic', 'Ego', 'Self-Projected', 'Mental', 'Lunar']
export const CENTERS = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Sacral', 'Solar Plexus', 'Spleen', 'Root']

// What the day's Sun center is about, in one line.
export const CENTER_THEME = {
  Head: 'Questions pile up today, and none of them need solving right now.',
  Ajna: 'The mind is busy building answers today.',
  Throat: 'Words want out today.',
  G: 'Direction and identity are lit up today.',
  Heart: 'Promises and willpower carry extra weight today.',
  Sacral: 'Life force runs strong today.',
  'Solar Plexus': 'Feelings move in waves today.',
  Spleen: 'Instinct speaks once, and quietly, today.',
  Root: 'Pressure to get moving builds today.',
}

export const DEFINED_LINE = 'This center is defined in your chart, so it lands on home ground. Use it the way you always do, just with more light on it.'
export const OPEN_LINE = 'This center is open in your chart, so you may feel it louder than usual. Notice it, and remember that not all of it is yours to act on.'
export const UNKNOWN_LINE = 'Add your defined centers in Settings to see how this meets your chart.'

export const TYPE_LINE = {
  Generator: 'Trust the first gut yes or no before your mind edits it.',
  'Manifesting Generator': 'Let your gut respond first, then tell people before you move fast.',
  Projector: 'Wait for the invitation. Your insight lands when it is asked for.',
  Manifestor: 'Follow the urge, and inform the people it touches before you act.',
  Reflector: 'Sample the day without deciding. Big choices can wait for a full moon cycle.',
}

// Journal prompts by moon phase, in the same order as PHASES in sky.js.
export const PROMPTS = [
  ['What do you want to begin, if nobody were watching?', 'What is asking for a quiet, private start?'],
  ['What small step would make this intention real today?', 'Where is your energy starting to gather?'],
  ['What are you being asked to choose between?', 'What resistance showed up this week, and what is it protecting?'],
  ['Where did your body say yes this week, before your head caught up?', 'What is building for you right now, and what does it still need?'],
  ['What is fully visible now that was hidden two weeks ago?', 'What are you ready to celebrate, out loud?'],
  ['What did this cycle teach you that is worth passing on?', 'Who would be helped by what you just learned?'],
  ['What are you ready to put down?', 'Which commitment no longer has your yes?'],
  ['What needs rest before anything new can start?', 'What would it look like to do less for three days?'],
]

export const FEELS = ['Clear', 'Breezy', 'Foggy', 'Stormy', 'Still']

// Shown on the mantra card until Astra uploads a client's own recording: her album track, played from her YouTube.
export const SAMPLE_MANTRA = { title: 'My Own Medicine', youtube: 'L0L6V--3YJE' }

export const BOOKING_URL = 'https://www.joyfulpurposecoaching.com/'

export function promptFor(phaseIndex, date) {
  const list = PROMPTS[phaseIndex]
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  return list[dayOfYear % list.length]
}
