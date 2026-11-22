import { useEffect, useMemo, useState } from 'react'
import { sky, PHASES } from '../sky.js'
import { BOOKING_URL, SAMPLE_MANTRA, promptFor } from '../content.js'
import { dayKey, listEntries, saveEntry, listCheckins, saveCheckin, mantraUrl } from '../store.js'
import { getWeatherAll, stargazing, localTime, distance, duration, UNITS } from '../weather.js'
import { buildInsight, placeEnergy, threePrompts, CENTER_PLAIN, TYPE_PLAIN, AUTHORITY_PLAIN, PROFILE_LINE } from '../insight.js'
import { useChart } from '../chart/useChart.js'
import MoonHero from '../MoonHero.jsx'
import StarField from '../StarField.jsx'
import MantraPlayer from '../MantraPlayer.jsx'
import InstallHint from '../InstallHint.jsx'
import Flourish from '../Flourish.jsx'
import Bodygraph from '../Bodygraph.jsx'
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
  const [chosen, setChosen] = useState(null) // the one prompt they picked today
  const [answer, setAnswer] = useState('')
  const [saved, setSaved] = useState('')
  const [mantraSrc, setMantraSrc] = useState(null)

  useEffect(() => {
    mantraUrl(profile.mantra_path).then(setMantraSrc)
  }, [profile.mantra_path])

  const homePlace = profile.home_place
  // Their chosen places, plus their birth place when we know where it is and it is not already listed.
  const places = useMemo(() => {
    const chosen = profile.places ?? []
    const born = profile.birth_lat != null && profile.birth_lon != null ? { name: profile.birth_place, lat: profile.birth_lat, lon: profile.birth_lon, tz: profile.birth_tz, label: 'Where you were born' } : null
    const near = (a, b) => a && b && Math.abs(a.lat - b.lat) < 0.05 && Math.abs(a.lon - b.lon) < 0.05
    return born && !near(born, profile.home_place) && !chosen.some((p) => near(born, p)) ? [...chosen, born] : chosen
  }, [profile])
  const type = chart?.type ?? profile.hd_type

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
      const mine = all.find((e) => e.entry_date === today && e.slot === 'prompt')
      setChosen(mine?.prompt ?? null)
      setAnswer(mine?.body ?? '')
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

  const prompts = useMemo(() => threePrompts(prompt, s.sunGate.num, type, now), [prompt, s, type, now])

  const write = async () => {
    if (!chosen && !answer.trim()) return setSaved('Choose a prompt or write something first.')
    try {
      const row = { entry_date: today, slot: 'prompt', prompt: chosen, body: answer.trim() || null }
      await saveEntry(user, row)
      setEntries([row, ...entries.filter((e) => !(e.entry_date === today && e.slot === 'prompt'))])
      setSaved('Saved to your journal')
    } catch {
      setSaved('Could not save. Try again.')
    }
  }

  // Past days for the journal preview: newest first, today excluded.
  const pastDays = [...new Set([...entries.map((e) => e.entry_date), ...checkins.map((c) => c.entry_date)])].filter((d) => d !== today).sort().reverse().slice(0, 3)

  const missing = [!chart && !profile.hd_type ? 'your birth details' : null, !homePlace ? 'your home town' : null].filter(Boolean)

  return (
    <>
      {/* 1. Greeting and today's Human Design, with the moon */}
      <section className="sky-panel">
        <StarField />
        <div className="sky-top">
          <span className="eyebrow gold">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <h1>{greeting(now.getHours())}, {profile.name}.</h1>
        </div>
        <div className="opening">
          <span className="eyebrow gold">Today's energy</span>
          <h2>{insight.theme}</h2>
          <div className="gates">
            <div className="gate gold"><span>Sun</span><b>Gate {insight.sun.gate}.{insight.sun.line}</b><span>{insight.sun.name}</span></div>
            <div className="gate lilac"><span>Earth</span><b>Gate {insight.earth.gate}.{insight.earth.line}</b><span>{insight.earth.name}</span></div>
          </div>
          <p className="hook">{insight.hook}</p>
          {insight.strategy && <p className="soft">For you, a {insight.type}: {insight.strategy}</p>}
          <a className="link light" href="#insight">Read today's brief</a>
        </div>
        <div className="arrive">
          <Flourish />
          <h2>{arrive ? 'You arrived at' : 'How are you arriving today?'}</h2>
          <div className="dial" role="group" aria-label="How you are arriving, from 1 to 5">
            {FEELS.map((label, i) => (
              <button key={label} type="button" aria-pressed={arrive === i + 1} onClick={() => pick('arrive', i + 1)}>
                <b>{i + 1}</b>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="moon-strip">
          <MoonHero elong={s.elong} label={`${s.phase.name}, ${s.illum} percent lit`} />
          <div>
            <span className="eyebrow gold">Tonight's moon</span>
            <h2>{s.phase.name}</h2>
            <span className="sky-fact">{s.illum}% lit, in {s.moonSign}</span>
            <span className="sky-fact">{s.next.what} {s.next.days === 0 ? 'tonight' : `in ${s.next.label}`}</span>
          </div>
        </div>
      </section>

      {missing.length > 0 && (
        <section className="tile setup">
          <span className="eyebrow">Make it yours</span>
          <p>Add {missing.join(' and ')} and this page speaks to your own chart and sky.</p>
          <button type="button" className="btn dark" onClick={() => onGo('My Design')}>Finish setting up</button>
        </section>
      )}

      <MantraPlayer
        key={mantraSrc ?? 'sample'}
        title={mantraSrc ? profile.mantra_title || 'Your mantra' : SAMPLE_MANTRA.title}
        src={mantraSrc}
        video={mantraSrc ? null : SAMPLE_MANTRA.youtube}
      />

      <InstallHint />

      {/* 2. Human Design brief */}
      <section className="tile dark insight" id="insight">
        <span className="eyebrow">Human Design today</span>
        <h3 className="prompt">{insight.sun.name}</h3>
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

      {/* 3. Their design, lit up by today's sky */}
      <section className="tile lit">
        <span className="eyebrow">Your design, lit up today</span>
        <h3 className="prompt">Where today is landing in you</h3>
        <Bodygraph
          defined={insight.definedCenters}
          channels={(chart?.channels ?? []).map((c) => c.centers)}
          today={[insight.sun.center, insight.earth.center]}
          borrowed={insight.borrowed}
          label={`Bodygraph. Today's Sun is in the ${insight.sun.center} center and the Earth is in the ${insight.earth.center} center.`}
        />
        <div className="legend">
          <span><i className="k-mine" />Yours, always on</span>
          <span><i className="k-open" />Open, takes in others</span>
          <span><i className="k-ring" />Lit by today's sky</span>
        </div>
        <p>
          The glowing rings show where today's Sun and Earth are landing: your <b>{insight.sun.center}</b> ({CENTER_PLAIN[insight.sun.center]}) and your <b>{insight.earth.center}</b> ({CENTER_PLAIN[insight.earth.center]}).
          {insight.borrowed ? ' The dashed gold line is a channel today completes for you, switched on for a few days.' : ''}
        </p>
        <div className="experiment">
          <span className="eyebrow">Today's experiment</span>
          <p>{insight.experiment}</p>
        </div>
      </section>

      {/* 4. Daily check-in */}
      <section className="tile dark checkin">
        <Flourish />
        <span className="eyebrow">Daily check-in</span>
        <h3 className="prompt">{arrive ? 'Now that you have read today, how do you feel?' : 'How are you feeling today?'}</h3>
        <div className="dial" role="group" aria-label="How you feel, from 1 to 5">
          {FEELS.map((label, i) => (
            <button key={label} type="button" aria-pressed={feel === i + 1} onClick={() => pick('feel', i + 1)}>
              <b>{i + 1}</b>
              <span>{label}</span>
            </button>
          ))}
        </div>
        {shift && <p className="shift" role="status">{shift}</p>}

        <span className="eyebrow pick-one">Choose one to sit with</span>
        <div className="prompts" role="group" aria-label="Choose one prompt">
          {prompts.map((p) => (
            <button key={p.text} type="button" aria-pressed={chosen === p.text} onClick={() => { setChosen(p.text); setSaved('') }}>
              <span>{p.from}</span>
              <b>{p.text}</b>
            </button>
          ))}
        </div>
        <label htmlFor="answer" className="sr">Your notes</label>
        <textarea id="answer" rows="4" placeholder={chosen ? 'Write whatever comes.' : 'Pick one above, then write whatever comes.'} value={answer} onChange={(e) => { setAnswer(e.target.value); setSaved('') }} />
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
              <span className="j-text">{first?.body ?? first?.prompt ?? 'Checked in'}</span>
            </div>
          )
        })}
        <button type="button" className="link" onClick={() => onGo('Journal')}>Open the full journal</button>
      </section>

      {/* 6. Weather, tonight's sky and their places */}
      {homePlace && (
        <section className="tile dark weather">
          <span className="eyebrow">Weather and tonight's sky</span>
          {!home && <p className="muted">{weatherNote || `Checking the weather in ${homePlace.name}.`}</p>}
          {home && (
            <>
              <div className="wx-home">
                <WeatherIcon kind={home.kind} night={!home.isDay} size={64} />
                <div>
                  <b className="wx-temp">{home.temp}{UNITS.temp}</b>
                  <span className="wx-label">{home.label}</span>
                </div>
              </div>
              <span className="muted">{homePlace.name} · Sunrise {home.sunrise} · Sunset {home.sunset}</span>
              <div className="wx-facts">
                <div><span>High / low</span><b>{home.high}° / {home.low}°</b></div>
                <div><span>Wind</span><b>{home.wind} {UNITS.wind}</b></div>
                <div><span>Air quality</span><b>{home.aqi ?? 'n/a'}</b><span>{home.aqiLabel}</span></div>
              </div>
              {star && (
                <div className="star-line">
                  <span className={`rating r-${star.rating.toLowerCase()}`}>Stargazing: {star.rating}</span>
                  <span className="muted">{star.reason}</span>
                </div>
              )}
            </>
          )}
          {others.length > 0 && (
            <div className="places">
              <span className="eyebrow">Your other places</span>
              {others.map((o) => {
                const town = o.name.split(',')[0]
                const stars = stargazing(o.cloudTonight, s.illum)
                const energy = placeEnergy(o, town, type)
                const special = o.moment === 'sunrise' ? 'The sun is rising there right now.' : o.moment === 'sunset' ? 'The sun is setting there right now.' : !o.isDay && s.illum >= 97 ? 'The full moon is over it tonight.' : null
                const more = home?.daylightMin != null && o.daylightMin != null ? o.daylightMin - home.daylightMin : null
                return (
                  <div key={o.name} className="place-card">
                    <div className="place-top">
                      <div>
                        <b>{o.place.label || town}</b>
                        <span className="muted">{o.place.label ? `${town} · ` : ''}{localTime(o.place.tz)} there now · {distance(homePlace, o.place)} away</span>
                      </div>
                      <div className="place-wx">
                        <WeatherIcon kind={o.kind} night={!o.isDay} size={34} />
                        <b>{o.temp}{UNITS.temp}</b>
                      </div>
                    </div>
                    {special && <span className="special">{special}</span>}
                    {energy && <span className="energy">{energy}</span>}
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
      )}

      {/* 7. Their chart, as a compact reference */}
      {(chart || profile.hd_type) && (
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
          ) : (
            <dl>
              <div><dt>Type</dt><dd><b>{profile.hd_type}</b><span>{TYPE_PLAIN[profile.hd_type]}</span></dd></div>
              {profile.authority && <div><dt>Authority</dt><dd><b>{profile.authority}</b><span>{AUTHORITY_PLAIN[profile.authority]}</span></dd></div>}
              {profile.hd_profile && <div><dt>Profile</dt><dd><b>{profile.hd_profile}</b></dd></div>}
              {profile.defined_centers?.length > 0 && <div><dt>Defined centers</dt><dd><span className="tags">{profile.defined_centers.map((c) => <i key={c}>{c}</i>)}</span></dd></div>}
            </dl>
          )}
        </section>
      )}

      <section className="tile astra">
        <span className="eyebrow gold">From Astra</span>
        <h3>Go deeper with your design</h3>
        <span className="soft">A reading or 1:1 coaching turns the daily weather into a path that is yours.</span>
        <a className="btn gold" href={BOOKING_URL} target="_blank" rel="noreferrer">Book your discovery call</a>
      </section>
    </>
  )
}
