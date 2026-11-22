import { useState } from 'react'
import { ios, android, installed } from './device.js'

// A one-time nudge to put the app on the phone's home screen. Hidden once installed or dismissed.
export default function InstallHint() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem('cw:install-hint') === 'off'
    } catch {
      return false
    }
  })
  if (hidden || installed || !(ios || android)) return null

  const dismiss = () => {
    setHidden(true)
    try {
      localStorage.setItem('cw:install-hint', 'off')
    } catch {
      /* fine: it just shows again next time */
    }
  }

  return (
    <section className="tile hint">
      <span className="eyebrow">Keep it on your phone</span>
      {ios ? (
        <p>Tap the <b>Share</b> button in your browser, then <b>Add to Home Screen</b>. Leave <b>Open as Web App</b> switched on. Then open the Cosmic Weather icon and sign in there once. It stays signed in after that.</p>
      ) : (
        <p>Tap the <b>three dots</b> in your browser, then <b>Add to Home screen</b> or <b>Install app</b>.</p>
      )}
      <button type="button" className="link" onClick={dismiss}>Got it</button>
    </section>
  )
}
