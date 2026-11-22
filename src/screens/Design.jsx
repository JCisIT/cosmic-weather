import { useState } from 'react'
import { saveProfile, setPassword } from '../store.js'
import { TYPES, PROFILES, AUTHORITIES, CENTERS } from '../content.js'

export const blankDesign = (p) => ({
  hd_type: p?.hd_type ?? '',
  hd_profile: p?.hd_profile ?? '',
  authority: p?.authority ?? '',
  defined_centers: p?.defined_centers ?? [],
})

// Type, profile, authority and defined centers. Shared by the client's own page and Astra's studio.
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
    ...blankDesign(profile),
  })
  const [note, setNote] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      onSaved(await saveProfile(user, { ...form, email: user.email }))
      setNote('Saved')
    } catch (err) {
      setNote(err.message || 'Could not save. Try again.')
    }
  }

  return (
    <form className={first ? 'design first' : 'design'} onSubmit={submit}>
      <header className="page-head">
        <span className="eyebrow">{first ? 'Welcome' : 'My Design'}</span>
        <h1>{first ? 'Tell us about you' : 'Your Human Design'}</h1>
      </header>

      <div className="tile">
        <label htmlFor="name">First name</label>
        <input id="name" required value={form.name} onChange={set('name')} autoComplete="given-name" />
        <h2>Birth details</h2>
        <p className="muted">Your chart is drawn from these. The time matters, so check a birth certificate if you can.</p>
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
        <label htmlFor="birth_place">Birth city</label>
        <input id="birth_place" placeholder="City, state or country" value={form.birth_place} onChange={set('birth_place')} />
      </div>

      <div className="tile">
        <h2>Your design</h2>
        <p className="muted">If you already know your chart, fill this in. If not, leave it and Astra can add it for you.</p>
        <DesignFields form={form} setForm={setForm} />
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
