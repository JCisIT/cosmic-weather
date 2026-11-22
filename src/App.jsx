import { useEffect, useState } from 'react'
import { getUser, onAuthChange, getProfile, signOut, demo, cameFromEmailLink } from './store.js'
import ChoosePassword from './screens/ChoosePassword.jsx'
import Login from './screens/Login.jsx'
import Design from './screens/Design.jsx'
import Today from './screens/Today.jsx'
import Journal from './screens/Journal.jsx'
import Sessions from './screens/Sessions.jsx'
import Studio from './screens/Studio.jsx'

const TABS = ['Today', 'My Design', 'Sessions', 'Journal']

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

  const tabs = profile.role === 'admin' ? [...TABS, 'Studio'] : TABS

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
      <nav className="tabs" aria-label="App sections" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((t) => (
          <button key={t} type="button" className={t === tab ? 'on' : ''} aria-current={t === tab ? 'page' : undefined} onClick={() => { setTab(t); window.scrollTo(0, 0) }}>
            {t}
          </button>
        ))}
      </nav>
    </div>
  )
}
