import { useEffect, useMemo, useState } from 'react'
import { sky, PHASES } from '../sky.js'
import { BOOKING_URL, promptFor } from '../content.js'
import { dayKey, listEntries, saveEntry, listTodos, addTodo, toggleTodo, listCheckins, saveCheckin } from '../store.js'
import { getWeather, stargazing, UNITS } from '../weather.js'
import { buildInsight, CENTER_PLAIN, TYPE_PLAIN, AUTHORITY_PLAIN, PROFILE_LINE } from '../insight.js'
import { useChart } from '../chart/useChart.js'
import Moon from '../Moon.jsx'
import InstallHint from '../InstallHint.jsx'
import WeatherIcon from '../WeatherIcon.jsx'

const FEELS = ['Low', 'Tender', 'Steady', 'Good', 'Bright']

function greeting(h) {
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export const shortDate = (d) => new Date(d + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

export default function Today({ user, profile, onGo }) {
  const now = useMemo(() => new Date(), [])
  const s = useMemo(() => sky(now), [now])
  const chart = useChart(profile)
  const today = dayKey(now)
  const prompt = promptFor(PHASES.indexOf(s.phase), now)
  const insight = useMemo(() => buildInsight(s, chart, profile, now), [s, chart, profile, now])

  const [home, setHome] = useState(null)
  const [others, setOthers] = useState([])
  const [weatherNote, setWeatherNote] = useState('')
  const [entries, setEntries] = useState([])
  const [checkins, setCheckins] = useState([])
  const [answer, setAnswer] = useState('')
  const [noteText, setNoteText] = useState('')
  const [saved, setSaved] = useState('')
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')

  const homePlace = profile.home_place
  const places = profile.places ?? []

  useEffect(() => {
    if (!homePlace) return
    setWeatherNote('')
    getWeather(homePlace).then(setHome).catch(() => setWeatherNote('Weather is not answering right now.'))
    Promise.all(places.map((p) => getWeather(p).then((w) => ({ ...w, name: p.name })).catch(() => ({ name: p.name, failed: true })))).then(setOthers)
  }, [homePlace?.lat, homePlace?.lon, JSON.stringify(places)])

  useEffect(() => {
    listEntries(user).then((all) => {
      setEntries(all)
      setAnswer(all.find((e) => e.entry_date === today && e.slot === 'prompt')?.body ?? '')
      setNoteText(all.find((e) => e.entry_date === today && e.slot === 'note')?.body ?? '')
    }).catch(() => {})
    listCheckins(user).then(setCheckins).catch(() => {})
    listTodos(user).then(setTodos).catch(() => {})
  }, [user, today])

  const feel = Number(checkins.find((c) => c.entry_date === today)?.feel) || null
  const star = home ? stargazing(home.cloudTonight, s.illum) : null

  const pick = async (n) => {
    setCheckins([{ entry_date: today, feel: String(n) }, ...checkins.filter((c) => c.entry_date !== today)])
    await saveCheckin(user, today, n).catch(() => {})
  }

  const write = async () => {
    try {
      const rows = [
        answer.trim() && { entry_date: today, slot: 'prompt', prompt, body: answer.trim() },
        noteText.trim() && { entry_date: today, slot: 'note', prompt: null, body: noteText.trim() },
      ].filter(Boolean)
      if (!rows.length) return setSaved('Write something first.')
      for (const r of rows) await saveEntry(user, r)
      setEntries([...rows, ...entries.filter((e) => e.entry_date !== today)])
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

  // Past days for the journal preview: newest first, today excluded.
  const pastDays = [...new Set([...entries.map((e) => e.entry_date), ...checkins.map((c) => c.entry_date)])].filter((d) => d !== today).sort().reverse().slice(0, 3)

  return (
    <>
      {/* 1. Greeting and tonight's sky */}
      <section className="sky-panel">
        <div className="stars" aria-hidden="true" />
        <div className="sky-top">
          <div>
            <span className="eyebrow gold">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <h1>{greeting(now.getHours())}, {profile.name}.</h1>
          </div>
        </div>
        <div className="sky-moon">
          <Moon elong={s.elong} size={132} label={`${s.phase.name}, ${s.illum} percent lit`} />
          <div>
            <span className="eyebrow gold">Tonight's sky</span>
            <h2>{s.phase.name}</h2>
            <span className="sky-fact">{s.illum}% lit · Moon in {s.moonSign}</span>
            <span className="sky-fact">{s.next.what} {s.next.days === 0 ? 'tonight' : `in ${s.next.label}`}</span>
          </div>
        </div>
        <div className="star-row">
          {star ? (
            <>
              <span className={`rating r-${star.rating.toLowerCase()}`}>Stargazing: {star.rating}</span>
              <span className="soft">{star.reason}</span>
            </>
          ) : homePlace ? (
            <span className="soft">{weatherNote || 'Reading tonight\'s cloud cover.'}</span>
          ) : (
            <button type="button" className="link light" onClick={() => onGo('My Design')}>Add your home town to see tonight's stargazing</button>
          )}
        </div>
      </section>

      <InstallHint />

      {/* 2. Weather */}
      <section className="tile">
        <span className="eyebrow">Weather</span>
        {!homePlace && (
          <>
            <p>Add your home town and up to three other places to see live weather here.</p>
            <button type="button" className="btn dark" onClick={() => onGo('My Design')}>Add my places</button>
          </>
        )}
        {homePlace && !home && <p className="muted">{weatherNote || `Checking the weather in ${homePlace.name}.`}</p>}
        {home && (
          <>
            <div className="wx-home">
              <WeatherIcon kind={home.kind} night={!home.isDay} size={64} />
              <div>
                <b className="wx-temp">{home.temp}{UNITS.temp}</b>
                <span className="wx-label">{home.label}</span>
              </div>
            </div>
            <span className="muted">{homePlace.name}</span>
            <div className="wx-facts">
              <div><span>High / low</span><b>{home.high}° / {home.low}°</b></div>
              <div><span>Wind</span><b>{home.wind} {UNITS.wind}</b></div>
              <div><span>Air quality</span><b>{home.aqi ?? 'n/a'}</b><span>{home.aqiLabel}</span></div>
            </div>
          </>
        )}
        {others.length > 0 && (
          <div className="wx-rows">
            {others.map((o) => (
              <div key={o.name} className="wx-row">
                <b>{o.name.split(',')[0]}</b>
                {o.failed ? <span className="muted">Not available</span> : (
                  <>
                    <span>{o.label}</span>
                    <span>{o.temp}{UNITS.temp}</span>
                    <span>{o.wind} {UNITS.wind}</span>
                    <span>AQI {o.aqi ?? 'n/a'}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Daily check-in */}
      <section className="tile">
        <span className="eyebrow">Daily check-in</span>
        <h3 className="prompt">How are you feeling today?</h3>
        <div className="feels" role="group" aria-label="How you feel, from 1 to 5">
          {FEELS.map((label, i) => (
            <button key={label} type="button" aria-pressed={feel === i + 1} onClick={() => pick(i + 1)}>
              <b>{i + 1}</b>
              <span>{label}</span>
            </button>
          ))}
        </div>
        <label htmlFor="answer" className="prompt-q">{prompt}</label>
        <textarea id="answer" rows="3" placeholder="Optional. A line or two." value={answer} onChange={(e) => { setAnswer(e.target.value); setSaved('') }} />
        <label htmlFor="note">Anything else on your mind</label>
        <textarea id="note" rows="3" placeholder="Optional." value={noteText} onChange={(e) => { setNoteText(e.target.value); setSaved('') }} />
        <div className="row">
          <button type="button" className="btn dark" onClick={write}>Save to journal</button>
          <span className="muted" role="status">{saved}</span>
        </div>
      </section>

      {todos.length > 0 && (
        <section className="tile">
          <h3>To do</h3>
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
      )}

      {/* 4. Living journal */}
      <section className="tile">
        <span className="eyebrow">Living journal</span>
        {pastDays.length === 0 && <p className="muted">Each day you check in is kept here under its date. Nothing is ever deleted.</p>}
        {pastDays.map((d) => {
          const f = checkins.find((c) => c.entry_date === d)?.feel
          const first = entries.find((e) => e.entry_date === d)
          return (
            <div key={d} className="j-row">
              <b>{shortDate(d)}</b>
              {f && <span className="j-feel">{Number(f) ? `${f}/5` : f}</span>}
              <span className="j-text">{first?.body ?? 'Checked in'}</span>
            </div>
          )
        })}
        <button type="button" className="link" onClick={() => onGo('Journal')}>Open the full journal</button>
      </section>

      {/* 5. Human Design insight */}
      <section className="tile insight">
        <span className="eyebrow">Human Design today</span>
        <div className="gates">
          <div className="gate gold">
            <span>Sun</span>
            <b>Gate {insight.sun.gate}.{insight.sun.line}</b>
            <span>{insight.sun.name}</span>
          </div>
          <div className="gate lilac">
            <span>Earth</span>
            <b>Gate {insight.earth.gate}.{insight.earth.line}</b>
            <span>{insight.earth.name}</span>
          </div>
        </div>
        <p>
          The Sun is passing through <b>Gate {insight.sun.gate}</b> (a gate is one of 64 themes on the Human Design wheel): {insight.sun.plain}. It is in <b>line {insight.sun.line}</b> (each gate has six lines, which flavor it): {insight.sun.lineTheme}.
        </p>
        {insight.personal.map((p) => <p key={p}>{p}</p>)}
        <p>
          The Earth sits opposite the Sun and shows what keeps the day grounded: <b>Gate {insight.earth.gate}</b>, {insight.earth.plain}.
        </p>
        <div className="lesson">
          <span className="eyebrow">Today's small lesson: {insight.lesson.title}</span>
          <p>{insight.lesson.body}</p>
        </div>
      </section>

      {/* 6. Their chart, as a compact reference */}
      <section className="tile chart">
        <span className="eyebrow">Your chart</span>
        {chart ? (
          <>
            <dl>
              <div><dt>Type</dt><dd><b>{chart.type}</b><span>{TYPE_PLAIN[chart.type]}</span></dd></div>
              <div><dt>Authority</dt><dd><b>{chart.authority}</b><span>{AUTHORITY_PLAIN[chart.authority]}</span></dd></div>
              <div><dt>Profile</dt><dd><b>{chart.profile}</b><span>{chart.profile.split('/').map((l) => PROFILE_LINE[l]).join(' / ')}</span></dd></div>
              <div><dt>Defined centers</dt><dd>{chart.definedCenters.length ? <span className="tags">{chart.definedCenters.map((c) => <i key={c} title={CENTER_PLAIN[c]}>{c}</i>)}</span> : <span>None. Every center is open.</span>}</dd></div>
              <div><dt>Channels</dt><dd>{chart.channels.length ? chart.channels.map((c) => <span key={c.name}>{c.gates.join('-')} {c.name} ({c.centers.join(' to ')})</span>) : <span>None complete.</span>}</dd></div>
              <div><dt>Incarnation cross</dt><dd><b>{chart.cross.angle}</b><span>Gates {chart.cross.gates[0]}/{chart.cross.gates[1]} and {chart.cross.gates[2]}/{chart.cross.gates[3]}</span></dd></div>
              <div><dt>Hanging gates</dt><dd><span>{chart.hangingGates.join(', ') || 'None'}</span></dd></div>
            </dl>
            <p className="muted">Calculated from your birth details. Hanging gates are ones you have without their partner gate.</p>
          </>
        ) : profile.hd_type ? (
          <dl>
            <div><dt>Type</dt><dd><b>{profile.hd_type}</b><span>{TYPE_PLAIN[profile.hd_type]}</span></dd></div>
            {profile.authority && <div><dt>Authority</dt><dd><b>{profile.authority}</b><span>{AUTHORITY_PLAIN[profile.authority]}</span></dd></div>}
            {profile.hd_profile && <div><dt>Profile</dt><dd><b>{profile.hd_profile}</b></dd></div>}
            {profile.defined_centers?.length > 0 && <div><dt>Defined centers</dt><dd><span className="tags">{profile.defined_centers.map((c) => <i key={c}>{c}</i>)}</span></dd></div>}
          </dl>
        ) : (
          <>
            <p>Add your birth date, time and place and your full chart appears here.</p>
            <button type="button" className="btn dark" onClick={() => onGo('My Design')}>Add my birth details</button>
          </>
        )}
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
