import { useState } from 'react'
import { saveProfile, setPassword } from '../store.js'
import { TYPES, PROFILES, AUTHORITIES, CENTERS } from '../content.js'
import { chartFor } from '../chart/useChart.js'
import PlacePicker from '../PlacePicker.jsx'

export const blankDesign = (p) => ({
  hd_type: p?.hd_type ?? '',
  hd_profile: p?.hd_profile ?? '',
  authority: p?.authority ?? '',
  defined_centers: p?.defined_centers ?? [],
})

// Type, profile, authority and defined centers, entered by hand. Used when there is no birth time, and in Astra's studio.
export function DesignFields({ form, setForm, idPrefix = '' }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggle = (c) =>
    setForm({ ...form, defined_centers: form.defined_centers.includes(c) ? form.defined_centers.filter((x) => x !== c) : [...form.defined_centers, c] })
  return (
    <>
      <label htmlFor={idPrefix + 'type'}>Type</label>
      <select id={idPrefix + 'type'} value={form.hd_type} onChange={set('hd_type')}>
        <option value="">Not sure yet</option>
        {TYPES.map((t) => <option key={t}>{t}</option>)}
      </select>
      <div className="pair">
        <div>
          <label htmlFor={idPrefix + 'profile'}>Profile</label>
          <select id={idPrefix + 'profile'} value={form.hd_profile} onChange={set('hd_profile')}>
            <option value="">Not sure</option>
            {PROFILES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={idPrefix + 'authority'}>Authority</label>
          <select id={idPrefix + 'authority'} value={form.authority} onChange={set('authority')}>
            <option value="">Not sure</option>
            {AUTHORITIES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <span className="field-label">Defined centers</span>
      <div className="chips">
        {CENTERS.map((c) => (
          <button key={c} type="button" aria-pressed={form.defined_centers.includes(c)} onClick={() => toggle(c)}>
            {c}
          </button>
        ))}
      </div>
    </>
  )
}

export default function Design({ user, profile, onSaved, onSignOut, first }) {
  const [form, setForm] = useState({
    name: profile?.name ?? '',
    birth_date: profile?.birth_date ?? '',
    birth_time: profile?.birth_time?.slice(0, 5) ?? '',
    birth_place: profile?.birth_place ?? '',
    birth_tz: profile?.birth_tz ?? '',
    home_place: profile?.home_place ?? null,
    places: profile?.places ?? [],
    ...blankDesign(profile),
  })
  const [note, setNote] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const chart = chartFor(form)

  const submit = async (e) => {
    e.preventDefault()
    // When the chart can be calculated, it is the source of truth for the design fields.
    const design = chart ? { hd_type: chart.type, hd_profile: chart.profile, authority: chart.authority, defined_centers: chart.definedCenters } : {}
    try {
      onSaved(await saveProfile(user, { ...form, ...design, email: user.email }))
      setNote('Saved')
    } catch (err) {
      setNote(err.message || 'Could not save. Try again.')
    }
  }

  const birthPlace = form.birth_place && form.birth_tz ? { name: form.birth_place } : null

  return (
    <form className={first ? 'design first' : 'design'} onSubmit={submit}>
      <header className="page-head">
        <span className="eyebrow">{first ? 'Welcome' : 'Settings'}</span>
        <h1>{first ? 'Tell us about you' : 'Your details'}</h1>
      </header>

      <div className="tile">
        <label htmlFor="name">First name</label>
        <input id="name" required value={form.name} onChange={set('name')} autoComplete="given-name" />
        <h2>Birth details</h2>
        <p className="muted">Your chart is calculated from these. The time matters, so check a birth certificate if you can.</p>
        <div className="pair">
          <div>
            <label htmlFor="birth_date">Birth date</label>
            <input id="birth_date" type="date" value={form.birth_date} onChange={set('birth_date')} />
          </div>
          <div>
            <label htmlFor="birth_time">Birth time</label>
            <input id="birth_time" type="time" value={form.birth_time} onChange={set('birth_time')} />
          </div>
        </div>
        <PlacePicker
          id="birth_place"
          label="Birth place"
          value={birthPlace}
          onPick={(p) => setForm({ ...form, birth_place: p.name, birth_tz: p.tz })}
          onClear={() => setForm({ ...form, birth_place: '', birth_tz: '' })}
        />
        {form.birth_place && !form.birth_tz && <p className="muted">Search and pick your birth place so we know its time zone.</p>}
        {chart ? (
          <p className="chart-ready">Your chart: <b>{chart.type}</b>, {chart.profile} profile, {chart.authority} authority.</p>
        ) : (
          <p className="muted">Add the date, time and place and your chart appears here.</p>
        )}
      </div>

      {!chart && (
        <div className="tile">
          <h2>No birth time?</h2>
          <p className="muted">If you already know your design, fill it in by hand. Otherwise leave this and Astra can add it for you.</p>
          <DesignFields form={form} setForm={setForm} />
        </div>
      )}

      <div className="tile">
        <h2>Your places</h2>
        <p className="muted">Home gets the full weather and tonight's sky. Add up to three more places you care about.</p>
        <PlacePicker id="home_place" label="Home" value={form.home_place} onPick={(p) => setForm({ ...form, home_place: p })} onClear={() => setForm({ ...form, home_place: null })} />
        {form.places.map((p, i) => (
          <PlacePicker key={p.name + i} id={`place-${i}`} label={`Place ${i + 1}`} value={p} onClear={() => setForm({ ...form, places: form.places.filter((_, j) => j !== i) })} />
        ))}
        {form.places.length < 3 && (
          <PlacePicker id="place-new" label="Add a place" value={null} onPick={(p) => setForm({ ...form, places: [...form.places, p] })} />
        )}
      </div>

      <div className="row">
        <button type="submit" className="btn dark">{first ? 'See my weather' : 'Save'}</button>
        <span className="muted" role="status">{note}</span>
      </div>
      {onSignOut && <PasswordTile />}
      {onSignOut && (
        <button type="button" className="link" onClick={onSignOut}>
          Sign out{user.email ? ` (${user.email})` : ''}
        </button>
      )}
    </form>
  )
}

// Lets someone who signed in by email link set a password, so they can sign in anywhere (including the home-screen app).
function PasswordTile() {
  const [pw, setPw] = useState('')
  const [note, setNote] = useState('')
  const save = async () => {
    if (pw.length < 8) return setNote('Use at least 8 characters.')
    try {
      await setPassword(pw)
      setPw('')
      setNote('Password saved')
    } catch (e) {
      setNote(e.message || 'Could not save.')
    }
  }
  return (
    <div className="tile">
      <h2>Password</h2>
      <p className="muted">Set or change the password you sign in with.</p>
      <label htmlFor="new-password">New password</label>
      <input id="new-password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={pw} onChange={(e) => { setPw(e.target.value); setNote('') }} />
      <div className="row">
        <button type="button" className="btn dark" onClick={save}>Save password</button>
        <span className="muted" role="status">{note}</span>
      </div>
    </div>
  )
}
