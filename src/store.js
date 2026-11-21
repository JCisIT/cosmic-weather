// One data layer with two backends: Supabase when keys are set, this browser's storage otherwise (demo mode).
import { createClient } from '@supabase/supabase-js'

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
  check(await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } }))
  return { sent: true }
}

export async function signInWithGoogle() {
  if (demo) throw new Error('Google sign-in turns on once the app is connected to its database.')
  check(await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }))
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

export async function saveProfile(user, profile) {
  const row = { ...profile, id: user.id }
  if (demo) return local.set('profile', row), row
  return check(await supabase.from('profiles').upsert(row).select().single())
}

/* ---------- journal ---------- */
export async function listEntries(user) {
  if (demo) return local.get('entries', [])
  return check(await supabase.from('journal_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(200))
}

export async function saveEntry(user, entry) {
  const row = { ...entry, user_id: user.id }
  if (demo) {
    const rest = local.get('entries', []).filter((e) => !(e.entry_date === row.entry_date && e.slot === row.slot))
    local.set('entries', row.body ? [row, ...rest].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1)) : rest)
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
export async function getCheckin(user, date) {
  if (demo) return local.get('checkins', {})[date] ?? null
  const row = check(await supabase.from('checkins').select('feel').eq('user_id', user.id).eq('entry_date', date).maybeSingle())
  return row?.feel ?? null
}

export async function saveCheckin(user, date, feel) {
  if (demo) return local.set('checkins', { ...local.get('checkins', {}), [date]: feel })
  check(await supabase.from('checkins').upsert({ user_id: user.id, entry_date: date, feel }))
}
