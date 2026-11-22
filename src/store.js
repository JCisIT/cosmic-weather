// One data layer with two backends: Supabase when keys are set, this browser's storage otherwise (demo mode).
import { createClient } from '@supabase/supabase-js'

// True when this page load came from an emailed sign-in link. Read before the client clears the address.
export const cameFromEmailLink = /type=(magiclink|recovery|signup|email)/.test(window.location.hash)

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && key ? createClient(url, key) : null
export const demo = !supabase

const local = {
  get(k, fallback) {
    try {
      const v = localStorage.getItem('cw:' + k)
      return v ? JSON.parse(v) : fallback
    } catch {
      return fallback
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('cw:' + k, JSON.stringify(v))
    } catch {
      /* storage unavailable: keep working in memory */
    }
  },
}

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function check({ data, error }) {
  if (error) throw error
  return data
}

const here = () => window.location.origin + window.location.pathname

/* ---------- auth ---------- */
export async function getUser() {
  if (demo) return local.get('user', null)
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

export function onAuthChange(cb) {
  if (demo) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session?.user ?? null))
  return () => data.subscription.unsubscribe()
}

export async function signInWithEmail(email) {
  if (demo) {
    const user = { id: 'demo', email }
    local.set('user', user)
    return { user }
  }
  check(await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: here() } }))
  return { sent: true }
}

export async function signInWithPassword(email, password) {
  if (demo) {
    const user = { id: 'demo', email }
    local.set('user', user)
    return user
  }
  return check(await supabase.auth.signInWithPassword({ email, password })).user
}

// Returns { user } when signed in straight away, or { confirm: true } when they must tap an emailed link first.
export async function signUpWithPassword(email, password) {
  if (demo) return { user: await signInWithPassword(email, password) }
  const data = check(await supabase.auth.signUp({ email, password, options: { emailRedirectTo: here() } }))
  // Supabase hides whether an address is already registered by returning a user with no identities.
  if (data.user && data.user.identities?.length === 0) throw new Error('That email already has an account. Sign in instead.')
  return data.session ? { user: data.user } : { confirm: true }
}

export async function setPassword(password) {
  if (demo) return
  check(await supabase.auth.updateUser({ password }))
}

export async function signInWithGoogle() {
  if (demo) throw new Error('Google sign-in turns on once the app is connected to its database.')
  check(await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: here() } }))
}

export async function signOut() {
  if (demo) return local.set('user', null)
  await supabase.auth.signOut()
}

/* ---------- profile ---------- */
export async function getProfile(user) {
  if (demo) return local.get('profile', null)
  return check(await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle())
}

const DESIGN_FIELDS = ['name', 'email', 'hd_type', 'hd_profile', 'authority', 'defined_centers', 'birth_date', 'birth_time', 'birth_place', 'birth_tz', 'birth_lat', 'birth_lon', 'home_place', 'places']

// Only the fields a person may set. Role and tier are never sent from the browser.
function designRow(p) {
  const row = {}
  for (const k of DESIGN_FIELDS) if (p[k] !== undefined) row[k] = p[k] === '' ? null : p[k]
  return row
}

export async function saveProfile(user, profile) {
  const row = { ...designRow(profile), id: user.id }
  if (demo) {
    const merged = { ...local.get('profile', {}), ...row }
    local.set('profile', merged)
    return merged
  }
  return check(await supabase.from('profiles').upsert(row).select().single())
}

/* ---------- sessions with Astra ---------- */
export async function listSessions(clientId) {
  if (demo) return local.get('sessions', []).filter((s) => s.client_id === clientId)
  return check(await supabase.from('sessions').select('*').eq('client_id', clientId).order('session_date', { ascending: false }))
}

/* ---------- studio (admin only; the database enforces it) ---------- */
export async function listClients() {
  if (demo) return [local.get('profile', null)].filter(Boolean)
  return check(await supabase.from('profiles').select('*').order('name'))
}

export async function saveClientDesign(clientId, fields) {
  if (demo) return saveProfile({ id: clientId }, fields)
  return check(await supabase.from('profiles').update(designRow(fields)).eq('id', clientId).select().single())
}

export async function addSession(admin, clientId, { session_date, title, recap, steps }) {
  const row = { client_id: clientId, session_date, title, recap, created_by: admin.id }
  const todos = steps.map((s) => ({ user_id: clientId, title: s, source: 'session', done: false }))
  if (demo) {
    const saved = { ...row, id: String(Date.now()) }
    local.set('sessions', [saved, ...local.get('sessions', [])])
    local.set('todos', [...local.get('todos', []), ...todos.map((t, i) => ({ ...t, id: `${Date.now()}-${i}` }))])
    return saved
  }
  const saved = check(await supabase.from('sessions').insert(row).select().single())
  if (todos.length) check(await supabase.from('todos').insert(todos))
  return saved
}

/* ---------- Astra's daily note ---------- */
export async function getDailyNote(date) {
  if (demo) return local.get('daily-notes', {})[date] ?? null
  return check(await supabase.from('daily_notes').select('note, lesson_slug').eq('note_date', date).maybeSingle())
}

export async function saveDailyNote(admin, date, note, lessonSlug) {
  const row = { note_date: date, note: note || null, lesson_slug: lessonSlug || null, updated_by: admin.id, updated_at: new Date().toISOString() }
  if (demo) return local.set('daily-notes', { ...local.get('daily-notes', {}), [date]: row })
  check(await supabase.from('daily_notes').upsert(row))
}

/* ---------- musical mantra ---------- */
// A private, one-hour link to a client's recording. Returns null when there is none.
export async function mantraUrl(path) {
  if (demo || !path) return null
  const { data, error } = await supabase.storage.from('mantras').createSignedUrl(path, 3600)
  return error ? null : data.signedUrl
}

export async function uploadMantra(clientId, file, title) {
  if (demo) throw new Error('Uploading needs the live app.')
  const ext = (file.name.split('.').pop() || 'mp3').toLowerCase()
  const path = `${clientId}/mantra-${Date.now()}.${ext}`
  check(await supabase.storage.from('mantras').upload(path, file, { contentType: file.type || 'audio/mpeg' }))
  return check(await supabase.from('profiles').update({ mantra_path: path, mantra_title: title }).eq('id', clientId).select().single())
}

/* ---------- journal ---------- */
export async function listEntries(user) {
  if (demo) return local.get('entries', [])
  return check(await supabase.from('journal_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(200))
}

// Entries are permanent. Today's entry can be added to or reworded, but an empty save never wipes one out.
export async function saveEntry(user, entry) {
  const row = { ...entry, user_id: user.id }
  if (!row.body && !row.prompt) return null
  if (demo) {
    const rest = local.get('entries', []).filter((e) => !(e.entry_date === row.entry_date && e.slot === row.slot))
    local.set('entries', [row, ...rest].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1)))
    return row
  }
  return check(await supabase.from('journal_entries').upsert(row, { onConflict: 'user_id,entry_date,slot' }).select().single())
}

/* ---------- to-dos ---------- */
export async function listTodos(user) {
  if (demo) return local.get('todos', [])
  return check(await supabase.from('todos').select('*').eq('user_id', user.id).order('created_at'))
}

export async function addTodo(user, title) {
  const row = { user_id: user.id, title, done: false, source: 'self' }
  if (demo) {
    const todo = { ...row, id: String(Date.now()) }
    local.set('todos', [...local.get('todos', []), todo])
    return todo
  }
  return check(await supabase.from('todos').insert(row).select().single())
}

export async function toggleTodo(user, todo) {
  const done = !todo.done
  if (demo) return local.set('todos', local.get('todos', []).map((t) => (t.id === todo.id ? { ...t, done } : t)))
  check(await supabase.from('todos').update({ done }).eq('id', todo.id))
}

/* ---------- evening check-in ---------- */
// Demo storage keeps { arrive, feel } per date; older demo data stored a bare value for feel.
const demoCheckin = (v) => (v && typeof v === 'object' ? v : { feel: v ?? null, arrive: null })

export async function listCheckins(user) {
  if (demo) return Object.entries(local.get('checkins', {})).map(([entry_date, v]) => ({ entry_date, ...demoCheckin(v) }))
  return check(await supabase.from('checkins').select('entry_date, feel, arrive').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(400))
}

// fields is { arrive } or { feel }. Only the reading given is written, so one never wipes the other.
export async function saveCheckin(user, date, fields) {
  const row = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v)]))
  if (demo) {
    const all = local.get('checkins', {})
    return local.set('checkins', { ...all, [date]: { ...demoCheckin(all[date]), ...row } })
  }
  check(await supabase.from('checkins').upsert({ user_id: user.id, entry_date: date, ...row }))
}
