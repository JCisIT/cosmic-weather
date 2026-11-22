import { useState } from 'react'
import { signInWithPassword, signUpWithPassword, signInWithEmail } from '../store.js'
import { ios, phoneBrowser } from '../device.js'

export default function Login({ onSignedIn }) {
  const [mode, setMode] = useState('in') // 'in' = sign in, 'new' = create account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [showForm, setShowForm] = useState(!phoneBrowser)

  const run = async (fn) => {
    setBusy(true)
    setNote('')
    try {
      await fn()
    } catch (e) {
      setNote(e.message || 'That did not work. Try again.')
    }
    setBusy(false)
  }

  const submit = (e) => {
    e.preventDefault()
    run(async () => {
      const addr = email.trim()
      if (mode === 'in') return onSignedIn(await signInWithPassword(addr, password))
      const res = await signUpWithPassword(addr, password)
      if (res.user) return onSignedIn(res.user)
      setMode('in')
      setNote(`Almost there. Tap the link we sent to ${addr}, then come back here and sign in.`)
    })
  }

  const link = () => {
    if (!email.trim()) return setNote('Enter your email first.')
    run(async () => {
      const res = await signInWithEmail(email.trim())
      if (res.user) onSignedIn(res.user)
      else setNote(`Link sent to ${email.trim()}. Tap it, choose a password on the page that opens, then come back here and sign in.`)
    })
  }

  return (
    <div className="login">
      <img className="brand-mark" src="./icon.svg" alt="" width={showForm ? 112 : 72} height={showForm ? 112 : 72} />
      <span className="eyebrow gold">Joyful Purpose Coaching</span>
      <h1>Cosmic Weather</h1>
      <span className="by">by Astra Fox</span>
      {showForm && <p className="lede">Your daily sky, read through your Human Design.</p>}

      {!showForm ? (
        <div className="install">
          <span className="eyebrow gold">Start here</span>
          <h2>Put it on your home screen first</h2>
          <ol>
            {ios ? (
              <li>Tap the <b>Share</b> button in your browser (a square with an arrow).</li>
            ) : (
              <li>Tap the <b>three dots</b> in your browser.</li>
            )}
            <li>Choose <b>Add to Home Screen</b>.</li>
            <li>Open the new <b>Cosmic Weather</b> icon and create your account there.</li>
          </ol>
          <p>That way you only sign in once.</p>
          <button type="button" className="link" onClick={() => setShowForm(true)}>Or continue in this browser</button>
        </div>
      ) : (
        <>
          <div className="switch" role="group" aria-label="Sign in or create an account">
            <button type="button" aria-pressed={mode === 'in'} onClick={() => { setMode('in'); setNote('') }}>Sign in</button>
            <button type="button" aria-pressed={mode === 'new'} onClick={() => { setMode('new'); setNote('') }}>Create account</button>
          </div>

          <form onSubmit={submit}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label htmlFor="password">{mode === 'new' ? 'Choose a password' : 'Password'}</label>
            <input id="password" type="password" required minLength={8} autoComplete={mode === 'new' ? 'new-password' : 'current-password'} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="btn gold" disabled={busy}>
              {mode === 'new' ? 'Create my account' : 'Sign in'}
            </button>
          </form>
          {mode === 'in' && (
            <button type="button" className="link" disabled={busy} onClick={link}>
              Forgot or never set a password? Email me a link
            </button>
          )}
        </>
      )}
      <p className="note" role="status">{note}</p>
    </div>
  )
}
