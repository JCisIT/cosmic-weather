import { useState } from 'react'
import { saveProfile } from '../store.js'
import { TYPES, PROFILES, AUTHORITIES, CENTERS } from '../content.js'

export default function Design({ user, profile, onSaved, onSignOut, first }) {
  const [form, setForm] = useState({
    name: profile?.name ?? '',
    hd_type: profile?.hd_type ?? '',
    hd_profile: profile?.hd_profile ?? '',
    authority: profile?.authority ?? '',
    defined_centers: profile?.defined_centers ?? [],
  })
  const [note, setNote] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggle = (c) =>
    setForm({ ...form, defined_centers: form.defined_centers.includes(c) ? form.defined_centers.filter((x) => x !== c) : [...form.defined_centers, c] })

  const submit = async (e) => {
    e.preventDefault()
    try {
      onSaved(await saveProfile(user, form))
      setNote('Saved')
    } catch (err) {
      setNote(err.message || 'Could not save. Try again.')
    }
  }

  return (
    <form className={first ? 'design first' : 'design'} onSubmit={submit}>
      <header className="page-head">
        <span className="eyebrow">{first ? 'Welcome' : 'My Design'}</span>
        <h1>{first ? 'Tell us about your design' : 'Your Human Design'}</h1>
        <p className="muted">From your reading or chart. Leave anything blank if you are not sure yet.</p>
      </header>

      <div className="tile">
        <label htmlFor="name">First name</label>
        <input id="name" required value={form.name} onChange={set('name')} autoComplete="given-name" />

        <label htmlFor="type">Type</label>
        <select id="type" value={form.hd_type} onChange={set('hd_type')}>
          <option value="">Not sure yet</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        <div className="pair">
          <div>
            <label htmlFor="profile">Profile</label>
            <select id="profile" value={form.hd_profile} onChange={set('hd_profile')}>
              <option value="">Not sure</option>
              {PROFILES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="authority">Authority</label>
            <select id="authority" value={form.authority} onChange={set('authority')}>
              <option value="">Not sure</option>
              {AUTHORITIES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="tile">
        <h2>Defined centers</h2>
        <p className="muted">Tap the centers that are colored in on your chart.</p>
        <div className="chips">
          {CENTERS.map((c) => (
            <button key={c} type="button" aria-pressed={form.defined_centers.includes(c)} onClick={() => toggle(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <button type="submit" className="btn dark">{first ? 'See my weather' : 'Save'}</button>
        <span className="muted" role="status">{note}</span>
      </div>
      {onSignOut && (
        <button type="button" className="link" onClick={onSignOut}>
          Sign out{user.email ? ` (${user.email})` : ''}
        </button>
      )}
    </form>
  )
}
