import { useEffect, useRef, useState } from 'react'
import { searchPlaces } from './weather.js'

// Type a town and matches appear underneath as you go. Picking one gives back { name, lat, lon, tz }.
export default function PlacePicker({ id, label, value, onPick, onClear, placeholder = 'Start typing a town or city' }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [note, setNote] = useState('')
  const latest = useRef(0)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 3) {
      setResults(null)
      setNote('')
      return
    }
    // Wait for a short pause in typing, and ignore answers that arrive out of order.
    const mine = ++latest.current
    const timer = setTimeout(async () => {
      try {
        const found = await searchPlaces(term)
        if (mine !== latest.current) return
        setResults(found)
        setNote(found.length ? '' : 'No match yet. Keep typing, or try the nearest larger town.')
      } catch {
        if (mine === latest.current) setNote('Could not search right now. Try again.')
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [q])

  if (value) {
    return (
      <div className="place-set">
        <div>
          <span className="field-label">{label}</span>
          <span>{value.name}</span>
        </div>
        <button type="button" className="link" onClick={onClear}>Change</button>
      </div>
    )
  }

  const pick = (r) => {
    onPick(r)
    setResults(null)
    setQ('')
  }

  return (
    <div className="place-picker">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        placeholder={placeholder}
        autoComplete="off"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          e.preventDefault() // never submit the whole form from here
          if (results?.length) pick(results[0])
        }}
      />
      {note && <span className="muted" role="status">{note}</span>}
      {results?.length > 0 && (
        <div className="place-list">
          {results.map((r) => (
            <button key={`${r.lat},${r.lon}`} type="button" className="place-result" onClick={() => pick(r)}>
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
