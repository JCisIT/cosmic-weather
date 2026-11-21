import { useEffect, useState } from 'react'
import { listEntries } from '../store.js'

export default function Journal({ user }) {
  const [entries, setEntries] = useState(null)
  useEffect(() => {
    listEntries(user).then(setEntries).catch(() => setEntries([]))
  }, [user])

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Journal</span>
        <h1>What you have written</h1>
      </header>
      {entries === null && <p className="muted">Loading</p>}
      {entries?.length === 0 && (
        <div className="tile">
          <p>Your entries will collect here. Answer today's prompt on the Today tab to write the first one.</p>
        </div>
      )}
      {entries?.map((e) => (
        <article key={e.entry_date + e.slot} className="tile">
          <span className="eyebrow">
            {new Date(e.entry_date + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          {e.prompt && <h3 className="prompt">{e.prompt}</h3>}
          <p className="entry">{e.body}</p>
        </article>
      ))}
    </>
  )
}
