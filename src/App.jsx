import { useEffect, useState } from 'react'
import { getUser, onAuthChange, getProfile, signOut, demo, cameFromEmailLink } from './store.js'
import ChoosePassword from './screens/ChoosePassword.jsx'
import Login from './screens/Login.jsx'
import Design from './screens/Design.jsx'
import Today from './screens/Today.jsx'
import Journal from './screens/Journal.jsx'
import Sessions from './screens/Sessions.jsx'
import Studio from './screens/Studio.jsx'

const TABS = ['Today', 'Sessions', 'Journal']
const SETTINGS = 'My Design' // the settings page, opened from the cog at the right of the menu

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = still checking
  const [profile, setProfile] = useState(undefined)
  const [tab, setTab] = useState('Today')
  const [askPassword, setAskPassword] = useState(cameFromEmailLink)

  useEffect(() => {
    getUser().then(setUser)
    return onAuthChange(setUser)
  }, [])

  useEffect(() => {
    if (!user) return setProfile(undefined)
    getProfile(user)
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [user])

  if (user === undefined) return <div className="splash">Reading the sky</div>
  if (!user) return <Login onSignedIn={setUser} />
  if (askPassword) return <ChoosePassword email={user.email} onDone={() => setAskPassword(false)} />
  if (profile === undefined) return <div className="splash">Reading the sky</div>

  const leave = async () => {
    await signOut()
    setUser(null)
  }

  // First visit: collect the basics of their design before showing the day.
  if (!profile) return <Design user={user} profile={null} onSaved={setProfile} first />

  const tabs = [...TABS, ...(profile.role === 'admin' ? ['Studio'] : []), SETTINGS]

  return (
    <div className="app">
      <main className="screen">
        {tab === 'Today' && <Today user={user} profile={profile} onGo={(t) => { setTab(t); window.scrollTo(0, 0) }} />}
        {tab === 'My Design' && <Design user={user} profile={profile} onSaved={setProfile} onSignOut={leave} />}
        {tab === 'Sessions' && <Sessions user={user} />}
        {tab === 'Studio' && <Studio user={user} />}
        {tab === 'Journal' && <Journal user={user} />}
        {demo && <p className="demo-note">Demo mode: entries are saved on this device only.</p>}
      </main>
      <nav className="tabs" aria-label="App sections" style={{ gridTemplateColumns: `repeat(${tabs.length - 1}, minmax(0, 1fr)) 64px` }}>
        {tabs.map((t) => (
          <button key={t} type="button" className={t === tab ? 'on' : ''} aria-current={t === tab ? 'page' : undefined} aria-label={t === SETTINGS ? 'Settings' : undefined} onClick={() => { setTab(t); window.scrollTo(0, 0) }}>
            {t === SETTINGS ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={t === tab ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            ) : t}
          </button>
        ))}
      </nav>
    </div>
  )
}
