import { useState } from 'react'
import { searchPlaces } from './weather.js'

// Search for a town and pick it. Gives back { name, lat, lon, tz }.
export default function PlacePicker({ id, label, value, onPick, onClear, placeholder = 'Town or city' }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [note, setNote] = useState('')

  const search = async () => {
    if (q.trim().length < 2) return
    setNote('Searching')
    try {
      const found = await searchPlaces(q.trim())
      setResults(found)
      setNote(found.length ? '' : 'No match. Try the nearest larger town.')
    } catch {
      setNote('Could not search right now. Try again.')
    }
  }

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

  return (
    <div className="place-picker">
      <label htmlFor={id}>{label}</label>
      <div className="add">
        <input id={id} placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search() } }} />
        <button type="button" className="btn dark small" onClick={search}>Search</button>
      </div>
      {note && <span className="muted" role="status">{note}</span>}
      {results?.map((r) => (
        <button key={`${r.lat},${r.lon}`} type="button" className="place-result" onClick={() => { onPick(r); setResults(null); setQ('') }}>
          {r.name}
        </button>
      ))}
    </div>
  )
}
