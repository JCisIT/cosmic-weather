import { useState } from 'react'

// A one-time nudge to put the app on the phone's home screen. Hidden once installed or dismissed.
export default function InstallHint() {
  const ua = navigator.userAgent
  const ios = /iPhone|iPad|iPod/.test(ua)
  const android = /Android/.test(ua)
  const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
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
        <p>Tap the <b>Share</b> button in your browser, then <b>Add to Home Screen</b>. Leave <b>Open as Web App</b> switched on. Cosmic Weather will open like an app, and you sign in once more inside it.</p>
      ) : (
        <p>Tap the <b>three dots</b> in your browser, then <b>Add to Home screen</b> or <b>Install app</b>.</p>
      )}
      <button type="button" className="link" onClick={dismiss}>Got it</button>
    </section>
  )
}
