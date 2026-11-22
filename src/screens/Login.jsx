import { useState } from 'react'
import { signInWithEmail, signInWithGoogle, verifyEmailCode, demo } from '../store.js'
import Moon from '../Moon.jsx'
import { sky } from '../sky.js'

export default function Login({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [code, setCode] = useState('')
  const s = sky()

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

  const email_ = (e) => {
    e.preventDefault()
    run(async () => {
      const res = await signInWithEmail(email.trim())
      if (res.user) onSignedIn(res.user)
      else setSentTo(email.trim())
    })
  }

  const verify = (e) => {
    e.preventDefault()
    run(async () => onSignedIn(await verifyEmailCode(sentTo, code.trim())))
  }

  return (
    <div className="login">
      <Moon elong={s.elong} size={120} />
      <span className="eyebrow gold">Joyful Purpose Coaching</span>
      <h1>Cosmic Weather</h1>
      <span className="by">by Astra Fox</span>
      <p className="lede">Your daily sky, read through your Human Design.</p>

      {sentTo ? (
        <form onSubmit={verify}>
          <p className="sent">We emailed a code to {sentTo}. Enter it here.</p>
          <label htmlFor="code">Sign-in code</label>
          <input id="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" required placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="submit" className="btn gold" disabled={busy}>Sign in</button>
          <button type="button" className="link" onClick={() => { setSentTo(''); setCode(''); setNote('') }}>Use a different email</button>
        </form>
      ) : (
        <>
          <button type="button" className="btn light" disabled={busy} onClick={() => run(signInWithGoogle)}>
            Continue with Google
          </button>
          <div className="or">or</div>
          <form onSubmit={email_}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" className="btn gold" disabled={busy}>
              {demo ? 'Enter' : 'Email me a sign-in code'}
            </button>
          </form>
        </>
      )}
      <p className="note" role="status">{note}</p>
    </div>
  )
}
