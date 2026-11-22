import { useEffect, useState } from 'react'
import { listEntries, listCheckins } from '../store.js'

const SLOT_ORDER = { prompt: 0, note: 1 }

// The living journal: every day's check-in, prompt answer and note, kept under its date. Read-only and permanent.
export default function Journal({ user }) {
  const [days, setDays] = useState(null)

  useEffect(() => {
    Promise.all([listEntries(user), listCheckins(user)])
      .then(([entries, checkins]) => {
        const dates = [...new Set([...entries.map((e) => e.entry_date), ...checkins.map((c) => c.entry_date)])].sort().reverse()
        setDays(
          dates.map((d) => ({
            date: d,
            feel: checkins.find((c) => c.entry_date === d)?.feel,
            entries: entries.filter((e) => e.entry_date === d).sort((a, b) => (SLOT_ORDER[a.slot] ?? 2) - (SLOT_ORDER[b.slot] ?? 2)),
          }))
        )
      })
      .catch(() => setDays([]))
  }, [user])

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Living journal</span>
        <h1>Your days</h1>
        <p className="muted">Everything you save is kept under its date. Nothing is ever deleted.</p>
      </header>
      {days === null && <p className="muted">Loading</p>}
      {days?.length === 0 && (
        <div className="tile">
          <p>Your days will collect here. Do today's check-in on the Today tab to start.</p>
        </div>
      )}
      {days?.map((d) => (
        <article key={d.date} className="tile">
          <div className="j-head">
            <span className="eyebrow">{new Date(d.date + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            {d.feel && <span className="j-feel">{Number(d.feel) ? `Feeling ${d.feel}/5` : d.feel}</span>}
          </div>
          {d.entries.map((e) => (
            <div key={e.slot} className="j-entry">
              {e.prompt && <h3 className="prompt">{e.prompt}</h3>}
              <p className="entry">{e.body}</p>
            </div>
          ))}
        </article>
      ))}
    </>
  )
}
