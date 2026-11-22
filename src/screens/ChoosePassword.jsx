import { useState } from 'react'
import { setPassword } from '../store.js'

// Shown right after someone arrives by an emailed sign-in link, so they leave with a password that works everywhere.
export default function ChoosePassword({ email, onDone }) {
  const [pw, setPw] = useState('')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    try {
      await setPassword(pw)
      setSaved(true)
    } catch (err) {
      setNote(err.message || 'Could not save. Try again.')
    }
  }

  return (
    <div className="login">
      <span className="eyebrow gold">Cosmic Weather</span>
      {saved ? (
        <>
          <h1>Password saved</h1>
          <p className="lede">Use {email} and your new password to sign in anywhere, including the Cosmic Weather icon on your home screen.</p>
          <button type="button" className="btn gold" onClick={onDone}>Continue</button>
        </>
      ) : (
        <>
          <h1>Choose a password</h1>
          <p className="lede">So you can sign in without an email link next time.</p>
          <form onSubmit={save}>
            <label htmlFor="choose-password">New password</label>
            <input id="choose-password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" value={pw} onChange={(e) => setPw(e.target.value)} />
            <button type="submit" className="btn gold">Save password</button>
          </form>
          <button type="button" className="link" onClick={onDone}>Skip for now</button>
          <p className="note" role="status">{note}</p>
        </>
      )}
    </div>
  )
}
