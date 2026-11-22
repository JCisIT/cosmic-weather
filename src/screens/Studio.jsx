import { useEffect, useState } from 'react'
import { listClients, saveClientDesign, listSessions, addSession, uploadMantra, dayKey, getDailyNote, saveDailyNote } from '../store.js'
import { LESSONS } from '../concepts/content.js'
import { DesignFields, blankDesign } from './Design.jsx'
import { longDate } from './Sessions.jsx'

// Astra's side of the app. Only shown to admins, and the database refuses these actions for anyone else.
export default function Studio({ user }) {
  const [clients, setClients] = useState(null)
  const [open, setOpen] = useState(null)

  const load = () => listClients().then(setClients).catch(() => setClients([]))
  useEffect(() => { load() }, [])

  if (open) return <Client admin={user} client={open} onBack={() => { setOpen(null); load() }} />

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Studio</span>
        <h1>Your people</h1>
        <p className="muted">Everyone who has signed in. Tap a name to add their design or a session recap.</p>
      </header>
      <DailyNote user={user} />
      {clients === null && <p className="muted">Loading</p>}
      {clients?.length === 0 && <div className="tile"><p>Nobody has signed in yet.</p></div>}
      {clients?.length > 0 && (
        <div className="tile list">
          {clients.map((c) => (
            <button key={c.id} type="button" className="person" onClick={() => setOpen(c)}>
              <b>{c.name || 'No name yet'}</b>
              <span className="muted">{[c.hd_type || 'Design not set', c.hd_profile].filter(Boolean).join(' ')}{c.email ? ` · ${c.email}` : ''}</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

function Client({ admin, client, onBack }) {
  const [design, setDesign] = useState(blankDesign(client))
  const [designNote, setDesignNote] = useState('')
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState({ session_date: dayKey(), title: '', recap: '', steps: '' })
  const [note, setNote] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  useEffect(() => {
    listSessions(client.id).then(setSessions).catch(() => {})
  }, [client])

  const saveDesign = async () => {
    try {
      await saveClientDesign(client.id, design)
      setDesignNote('Saved')
    } catch (e) {
      setDesignNote(e.message || 'Could not save.')
    }
  }

  const send = async (e) => {
    e.preventDefault()
    try {
      const steps = form.steps.split('\n').map((s) => s.trim()).filter(Boolean)
      const saved = await addSession(admin, client.id, { ...form, steps })
      setSessions([saved, ...sessions])
      setForm({ session_date: dayKey(), title: '', recap: '', steps: '' })
      setNote(`Sent to ${client.name || 'client'}${steps.length ? ` with ${steps.length} action step${steps.length > 1 ? 's' : ''}` : ''}`)
    } catch (err) {
      setNote(err.message || 'Could not send.')
    }
  }

  const birth = [client.birth_date && longDate(client.birth_date), client.birth_time?.slice(0, 5), client.birth_place].filter(Boolean).join(' · ')

  return (
    <>
      <header className="page-head">
        <button type="button" className="link back" onClick={onBack}>All people</button>
        <h1>{client.name || 'No name yet'}</h1>
        <span className="muted">{client.email}</span>
      </header>

      <div className="tile">
        <h2>Their design</h2>
        <p className="muted">{birth ? `Born ${birth}` : 'No birth details entered yet.'}</p>
        <DesignFields form={design} setForm={(f) => { setDesign(f); setDesignNote('') }} idPrefix="c-" />
        <div className="row">
          <button type="button" className="btn dark" onClick={saveDesign}>Save design</button>
          <span className="muted" role="status">{designNote}</span>
        </div>
      </div>

      <MantraUpload client={client} />

      <form className="tile" onSubmit={send}>
        <h2>Add a session recap</h2>
        <div className="pair">
          <div>
            <label htmlFor="s-date">Date</label>
            <input id="s-date" type="date" required value={form.session_date} onChange={set('session_date')} />
          </div>
          <div>
            <label htmlFor="s-title">Title</label>
            <input id="s-title" required placeholder="Reading, 1:1 #3" value={form.title} onChange={set('title')} />
          </div>
        </div>
        <label htmlFor="s-recap">Recap</label>
        <textarea id="s-recap" rows="6" placeholder="What you covered and what stood out." value={form.recap} onChange={set('recap')} />
        <label htmlFor="s-steps">Action steps, one per line</label>
        <textarea id="s-steps" rows="3" placeholder={'Block two unscheduled mornings\nVoice-note me after the full moon'} value={form.steps} onChange={set('steps')} />
        <div className="row">
          <button type="submit" className="btn dark">Send to their Sessions tab</button>
          <span className="muted" role="status">{note}</span>
        </div>
      </form>

      {sessions.map((s) => (
        <article key={s.id} className="tile">
          <span className="eyebrow">{longDate(s.session_date)}</span>
          <h3>{s.title}</h3>
          {s.recap && <p className="entry">{s.recap}</p>}
        </article>
      ))}
    </>
  )
}

// Upload the musical mantra Astra recorded for this person. It appears at the top of their Today page.
function MantraUpload({ client }) {
  const [title, setTitle] = useState(client.mantra_title ?? '')
  const [file, setFile] = useState(null)
  const [note, setNote] = useState(client.mantra_path ? 'A recording is already in place. Uploading replaces it.' : '')
  const [busy, setBusy] = useState(false)

  const upload = async (e) => {
    e.preventDefault()
    if (!file) return setNote('Choose an audio file first.')
    setBusy(true)
    setNote('Uploading')
    try {
      await uploadMantra(client.id, file, title.trim() || 'Your mantra')
      setNote(`Sent. It now plays at the top of ${client.name || 'their'} Today page.`)
    } catch (err) {
      setNote(err.message || 'Could not upload.')
    }
    setBusy(false)
  }

  return (
    <form className="tile" onSubmit={upload}>
      <h2>Musical mantra</h2>
      <p className="muted">Upload the recording you made for them (mp3, m4a or wav, up to 25 MB).</p>
      <label htmlFor="m-title">Title</label>
      <input id="m-title" placeholder="Name of their mantra" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label htmlFor="m-file">Recording</label>
      <input id="m-file" type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0] ?? null)} />
      <div className="row">
        <button type="submit" className="btn dark" disabled={busy}>Upload mantra</button>
        <span className="muted" role="status">{note}</span>
      </div>
    </form>
  )
}

// Astra's note for a day. It appears at the top of everyone's "deeper transit", above the automatic copy.
function DailyNote({ user }) {
  const [date, setDate] = useState(dayKey())
  const [note, setNote] = useState('')
  const [lesson, setLesson] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    setStatus('')
    getDailyNote(date).then((n) => { setNote(n?.note ?? ''); setLesson(n?.lesson_slug ?? '') }).catch(() => {})
  }, [date])

  const save = async (e) => {
    e.preventDefault()
    try {
      await saveDailyNote(user, date, note.trim(), lesson)
      setStatus('Saved. Everyone sees it on that day.')
    } catch (err) {
      setStatus(err.message || 'Could not save.')
    }
  }

  return (
    <form className="tile" onSubmit={save}>
      <h2>Your note for the day</h2>
      <p className="muted">Optional. It shows at the top of everyone's deeper transit. Leave it empty and the app writes the day for you.</p>
      <label htmlFor="dn-date">Day</label>
      <input id="dn-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
      <label htmlFor="dn-note">Note</label>
      <textarea id="dn-note" rows="4" placeholder="What do you want people to carry today?" value={note} onChange={(e) => setNote(e.target.value)} />
      <label htmlFor="dn-lesson">Lesson for the day</label>
      <select id="dn-lesson" value={lesson} onChange={(e) => setLesson(e.target.value)}>
        <option value="">Rotate automatically</option>
        {LESSONS.map((l) => <option key={l.slug} value={l.slug}>{l.topic}</option>)}
      </select>
      <div className="row">
        <button type="submit" className="btn dark">Save note</button>
        <span className="muted" role="status">{status}</span>
      </div>
    </form>
  )
}
