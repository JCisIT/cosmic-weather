import { useEffect, useState } from 'react'
import { BOOKING_URL } from '../content.js'
import { listSessions } from '../store.js'

export const longDate = (d) => new Date(d + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

export default function Sessions({ user }) {
  const [sessions, setSessions] = useState(null)
  useEffect(() => {
    listSessions(user.id).then(setSessions).catch(() => setSessions([]))
  }, [user])

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Sessions</span>
        <h1>Your work with Astra</h1>
      </header>
      {sessions?.map((s) => (
        <article key={s.id} className="tile">
          <span className="eyebrow">{longDate(s.session_date)}</span>
          <h3>{s.title}</h3>
          {s.recap && <p className="entry">{s.recap}</p>}
        </article>
      ))}
      {sessions?.length === 0 && (
        <div className="tile">
          <p>After a reading or a 1:1 session, your recap will appear here and the action steps will land in your to-do list.</p>
        </div>
      )}
      <div className="tile astra">
        <span className="eyebrow gold">Work with Astra</span>
        <h3>{sessions?.length ? 'Book your next session' : 'Start with a discovery call'}</h3>
        <span className="soft">Human Design readings, the Breakthrough Intensive, and 12-week coaching.</span>
        <a className="btn gold" href={BOOKING_URL} target="_blank" rel="noreferrer">Book your discovery call</a>
      </div>
    </>
  )
}
