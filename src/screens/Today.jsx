import { useEffect, useMemo, useState } from 'react'
import { sky, weekAhead } from '../sky.js'
import { CENTER_THEME, DEFINED_LINE, OPEN_LINE, UNKNOWN_LINE, TYPE_LINE, FEELS, BOOKING_URL, promptFor } from '../content.js'
import { PHASES } from '../sky.js'
import { dayKey, listEntries, saveEntry, listTodos, addTodo, toggleTodo, getCheckin, saveCheckin } from '../store.js'
import Moon from '../Moon.jsx'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function greeting(h) {
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Today({ user, profile }) {
  const now = useMemo(() => new Date(), [])
  const s = useMemo(() => sky(now), [now])
  const week = useMemo(() => weekAhead(now), [now])
  const today = dayKey(now)
  const prompt = promptFor(PHASES.indexOf(s.phase), now)

  const [entry, setEntry] = useState('')
  const [saved, setSaved] = useState('')
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [feel, setFeel] = useState(null)

  useEffect(() => {
    listEntries(user).then((all) => setEntry(all.find((e) => e.entry_date === today && e.slot === 'prompt')?.body ?? '')).catch(() => {})
    listTodos(user).then(setTodos).catch(() => {})
    getCheckin(user, today).then(setFeel).catch(() => {})
  }, [user, today])

  const center = s.sunGate.center
  const centers = profile.defined_centers ?? []
  const chartLine = centers.length === 0 ? UNKNOWN_LINE : centers.includes(center) ? DEFINED_LINE : OPEN_LINE
  const tag = [profile.hd_type, profile.hd_profile].filter(Boolean).join(' ')

  const write = async () => {
    try {
      await saveEntry(user, { entry_date: today, slot: 'prompt', prompt, body: entry.trim() })
      setSaved('Saved to your journal')
    } catch {
      setSaved('Could not save. Try again.')
    }
  }

  const add = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    const todo = await addTodo(user, newTodo.trim())
    setTodos([...todos, todo])
    setNewTodo('')
  }

  const flip = async (todo) => {
    setTodos(todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)))
    await toggleTodo(user, todo)
  }

  const pick = async (f) => {
    setFeel(f)
    await saveCheckin(user, today, f)
  }

  return (
    <>
      <header className="today-head">
        <div>
          <span className="eyebrow">Cosmic Weather</span>
          <h1>{greeting(now.getHours())}, {profile.name}</h1>
          <span className="muted">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        {tag && <span className="badge">{tag}</span>}
      </header>

      <section className="tile hero">
        <div className="hero-top">
          <div>
            <span className="eyebrow gold">Today's forecast</span>
            <h2>{s.phase.line}</h2>
          </div>
          <Moon elong={s.elong} label={`${s.phase.name}, ${s.illum} percent lit`} />
        </div>
        <p className="hero-line">
          The Sun is in your {center}{center === 'G' ? ' center' : ''}. {CENTER_THEME[center]} {TYPE_LINE[profile.hd_type] ?? ''}
        </p>
        <div className="stats">
          <div><span>Moon</span><b>{s.illum}%</b><span>in {s.moonSign}</span></div>
          <div><span>Energy</span><b>{s.phase.energy}</b><span>{s.phase.name.toLowerCase()}</span></div>
          <div><span>{s.next.what}</span><b>{s.next.label}</b><span>{s.waxing ? 'building' : 'releasing'}</span></div>
        </div>
      </section>

      <div className="halves">
        <section className="tile gold">
          <span className="eyebrow">Sun</span>
          <b className="big">Gate {s.sunGate.num}</b>
          <span>{s.sunGate.name}<br />{s.sunGate.center} · {s.sunSign}</span>
        </section>
        <section className="tile lilac">
          <span className="eyebrow">Earth</span>
          <b className="big">Gate {s.earthGate.num}</b>
          <span>{s.earthGate.name}<br />{s.earthGate.center}</span>
        </section>
      </div>

      <section className="tile">
        <span className="eyebrow">For your design</span>
        <p>{chartLine}</p>
      </section>

      <section className="tile">
        <span className="eyebrow">Answer the whisper</span>
        <h3 className="prompt">{prompt}</h3>
        <label className="sr" htmlFor="entry">Journal entry</label>
        <textarea id="entry" rows="5" placeholder="Start anywhere." value={entry} onChange={(e) => { setEntry(e.target.value); setSaved('') }} />
        <div className="row">
          <button type="button" className="btn dark" onClick={write}>Save</button>
          <span className="muted" role="status">{saved}</span>
        </div>
      </section>

      <section className="tile">
        <h3>The week ahead</h3>
        <div className="week">
          {week.map((d, i) => (
            <div key={i} className={i === 0 ? 'now' : ''}>
              <b>{DAYS[d.date.getDay()]}</b>
              <Moon elong={d.elong} size={28} label={`${d.illum} percent lit`} />
              <span className={d.mark ? 'mark' : ''}>{d.mark ?? `${d.illum}%`}</span>
            </div>
          ))}
        </div>
        <span className="muted">
          {s.tomorrowSunGate.num === s.sunGate.num
            ? `The Sun stays in Gate ${s.sunGate.num} tomorrow.`
            : `The Sun moves into Gate ${s.tomorrowSunGate.num}, ${s.tomorrowSunGate.name}, tomorrow.`}
        </span>
      </section>

      <section className="tile">
        <h3>To do</h3>
        {todos.length === 0 && <p className="muted">Nothing here yet. Add what today is asking of you.</p>}
        {todos.map((t) => (
          <label key={t.id} className={t.done ? 'todo done' : 'todo'}>
            <input type="checkbox" checked={t.done} onChange={() => flip(t)} />
            <span>{t.title}</span>
            {t.source === 'session' && <em>1:1</em>}
          </label>
        ))}
        <form className="add" onSubmit={add}>
          <label className="sr" htmlFor="new-todo">New to-do</label>
          <input id="new-todo" placeholder="Add a to-do" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
          <button type="submit" className="btn dark small">Add</button>
        </form>
      </section>

      <section className="tile">
        <span className="eyebrow">Evening check-in</span>
        <h3 className="prompt">How did today's weather actually feel?</h3>
        <div className="chips">
          {FEELS.map((f) => (
            <button key={f} type="button" aria-pressed={feel === f} onClick={() => pick(f)}>{f}</button>
          ))}
        </div>
      </section>

      <section className="tile astra">
        <span className="eyebrow gold">From Astra</span>
        <h3>Go deeper with your design</h3>
        <span className="soft">A reading or 1:1 coaching turns the daily weather into a path that is yours.</span>
        <a className="btn gold" href={BOOKING_URL} target="_blank" rel="noreferrer">Book your discovery call</a>
      </section>
    </>
  )
}
