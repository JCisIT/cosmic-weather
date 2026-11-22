import { useEffect, useMemo, useState } from 'react'
import { sky, PHASES } from '../sky.js'
import { BOOKING_URL, SAMPLE_MANTRA, promptFor } from '../content.js'
import { dayKey, listEntries, saveEntry, listCheckins, saveCheckin, mantraUrl } from '../store.js'
import { getWeatherAll, stargazing, localTime, distance, duration, UNITS } from '../weather.js'
import { buildInsight, CENTER_PLAIN, TYPE_PLAIN, AUTHORITY_PLAIN, PROFILE_LINE } from '../insight.js'
import { useChart } from '../chart/useChart.js'
import MoonHero from '../MoonHero.jsx'
import StarField from '../StarField.jsx'
import MantraPlayer from '../MantraPlayer.jsx'
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
  const [mantraSrc, setMantraSrc] = useState(null)

  useEffect(() => {
    mantraUrl(profile.mantra_path).then(setMantraSrc)
  }, [profile.mantra_path])

  const homePlace = profile.home_place
  const places = profile.places ?? []

  useEffect(() => {
    if (!homePlace) return
    setWeatherNote('')
    getWeatherAll([homePlace, ...places])
      .then(([h, ...rest]) => {
        setHome(h)
        setOthers(rest.map((w, i) => ({ ...w, name: places[i].name, place: places[i] })))
      })
      .catch(() => setWeatherNote('Weather is not answering right now.'))
  }, [homePlace?.lat, homePlace?.lon, JSON.stringify(places)])

  useEffect(() => {
    listEntries(user).then((all) => {
      setEntries(all)
      setAnswer(all.find((e) => e.entry_date === today && e.slot === 'prompt')?.body ?? '')
      setNoteText(all.find((e) => e.entry_date === today && e.slot === 'note')?.body ?? '')
    }).catch(() => {})
    listCheckins(user).then(setCheckins).catch(() => {})
  }, [user, today])

  const todayCheckin = checkins.find((c) => c.entry_date === today)
  const feel = Number(todayCheckin?.feel) || null
  const arrive = Number(todayCheckin?.arrive) || null
  const star = home ? stargazing(home.cloudTonight, s.illum) : null

  // kind is 'arrive' (tapped at the top, before reading) or 'feel' (tapped after the Human Design brief).
  const pick = async (kind, n) => {
    setCheckins([{ ...todayCheckin, entry_date: today, [kind]: String(n) }, ...checkins.filter((c) => c.entry_date !== today)])
    await saveCheckin(user, today, { [kind]: n }).catch(() => {})
  }

  const shift = arrive && feel ? (feel > arrive ? `You arrived at ${arrive} and you are at ${feel} now. Something lifted.` : feel < arrive ? `You arrived at ${arrive} and you are at ${feel} now. Be gentle with yourself today.` : `Steady at ${feel}, before and after.`) : null

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

  // Past days for the journal preview: newest first, today excluded.
  const pastDays = [...new Set([...entries.map((e) => e.entry_date), ...checkins.map((c) => c.entry_date)])].filter((d) => d !== today).sort().reverse().slice(0, 3)

  return (
    <>
      {/* 1. Greeting and tonight's sky */}
      <section className="sky-panel">
        <StarField />
        <div className="sky-top">
          <span className="eyebrow gold">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <h1>{greeting(now.getHours())}, {profile.name}.</h1>
        </div>
        <div className="opening">
          <span className="eyebrow gold">Today's energy · Sun in Gate {insight.sun.gate}.{insight.sun.line}</span>
          <h2>{insight.theme}</h2>
          <p className="hook">{insight.hook}</p>
          {insight.strategy && <p className="soft">For you, a {insight.type}: {insight.strategy}</p>}
          <a className="link light" href="#insight">See what it means for you</a>
        </div>
        <div className="arrive">
          <span>{arrive ? 'You arrived at' : 'Before you read on, how are you arriving?'}</span>
          <div role="group" aria-label="How you are arriving, from 1 to 5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-pressed={arrive === n} aria-label={`${n} of 5, ${FEELS[n - 1]}`} onClick={() => pick('arrive', n)}>{n}</button>
            ))}
          </div>
        </div>
        <MoonHero elong={s.elong} label={`${s.phase.name}, ${s.illum} percent lit`} />
        <div className="sky-caption">
          <span className="eyebrow gold">Tonight's sky</span>
          <h2>{s.phase.name}</h2>
          <div className="sky-facts">
            <div><b>{s.illum}%</b><span>lit</span></div>
            <div><b>{s.moonSign}</b><span>moon sign</span></div>
            <div><b>{s.next.days === 0 ? 'Tonight' : s.next.label}</b><span>to {s.next.what.toLowerCase()}</span></div>
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

<MantraPlayer
        key={mantraSrc ?? 'sample'}
        title={mantraSrc ? profile.mantra_title || 'Your mantra' : SAMPLE_MANTRA.title}
        src={mantraSrc}
        video={mantraSrc ? null : SAMPLE_MANTRA.youtube}
      />

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
        {home && (home.sunrise || home.sunset) && <span className="muted">Sunrise {home.sunrise} · Sunset {home.sunset}</span>}
        {others.length > 0 && (
          <div className="places">
            <span className="eyebrow">Your other places</span>
            {others.map((o) => {
              if (o.failed) return <div key={o.name} className="place-card"><b>{o.name.split(',')[0]}</b><span className="muted">Not available right now</span></div>
              const stars = stargazing(o.cloudTonight, s.illum)
              const more = home?.daylightMin != null && o.daylightMin != null ? o.daylightMin - home.daylightMin : null
              return (
                <div key={o.name} className="place-card">
                  <div className="place-top">
                    <div>
                      <b>{o.name.split(',')[0]}</b>
                      <span className="muted">{localTime(o.place.tz)} there now · {distance(homePlace, o.place)} away</span>
                    </div>
                    <div className="place-wx">
                      <WeatherIcon kind={o.kind} night={!o.isDay} size={34} />
                      <b>{o.temp}{UNITS.temp}</b>
                    </div>
                  </div>
                  <span>{o.label}, wind {o.wind} {UNITS.wind}, air quality {o.aqi ?? 'n/a'}{o.aqiLabel ? ` (${o.aqiLabel.toLowerCase()})` : ''}</span>
                  <span className="muted">
                    Sunrise {o.sunrise} · Sunset {o.sunset}
                    {more != null && Math.abs(more) >= 5 ? ` · ${duration(Math.abs(more))} ${more > 0 ? 'more' : 'less'} daylight than home` : ''}
                  </span>
                  {stars && <span className="muted">Stargazing tonight: {stars.rating.toLowerCase()}. Same moon as yours.</span>}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 3. Human Design insight */}
      <section className="tile insight" id="insight">
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

      {/* 4. Daily check-in */}
      <section className="tile">
        <span className="eyebrow">Daily check-in</span>
        <h3 className="prompt">{arrive ? 'Now that you have read today, how do you feel?' : 'How are you feeling today?'}</h3>
        <div className="feels" role="group" aria-label="How you feel, from 1 to 5">
          {FEELS.map((label, i) => (
            <button key={label} type="button" aria-pressed={feel === i + 1} onClick={() => pick('feel', i + 1)}>
              <b>{i + 1}</b>
              <span>{label}</span>
            </button>
          ))}
        </div>
        {shift && <p className="shift" role="status">{shift}</p>}
        <label htmlFor="answer" className="prompt-q">{prompt}</label>
        <textarea id="answer" rows="3" placeholder="Optional. A line or two." value={answer} onChange={(e) => { setAnswer(e.target.value); setSaved('') }} />
        <label htmlFor="note">Anything else on your mind</label>
        <textarea id="note" rows="3" placeholder="Optional." value={noteText} onChange={(e) => { setNoteText(e.target.value); setSaved('') }} />
        <div className="row">
          <button type="button" className="btn dark" onClick={write}>Save to journal</button>
          <span className="muted" role="status">{saved}</span>
        </div>
      </section>

      {/* 5. Living journal */}
      <section className="tile">
        <span className="eyebrow">Living journal</span>
        {pastDays.length === 0 && <p className="muted">Each day you check in is kept here under its date. Nothing is ever deleted.</p>}
        {pastDays.map((d) => {
          const c = checkins.find((x) => x.entry_date === d)
          const f = c?.arrive && c?.feel ? `${c.arrive} → ${c.feel}` : c?.feel ?? c?.arrive
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
