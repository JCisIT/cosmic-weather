import { useEffect, useState } from 'react'
import { resolveConcept } from './resolve.js'

// A slide-over that opens whenever the address ends in #/concepts/..., so every concept has its own link.
// Closing goes back in history when we opened it, otherwise it clears the hash.
const PREFIX = '#/concepts/'
const read = () => (location.hash.startsWith(PREFIX) ? decodeURIComponent(location.hash.slice(PREFIX.length)) : null)

export default function ConceptDrawer({ chart }) {
  const [path, setPath] = useState(read)
  const [shown, setShown] = useState(null) // keeps content on screen while sliding out

  useEffect(() => {
    const onHash = () => setPath(read())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const concept = path ? resolveConcept(path, { chart }) : null
  useEffect(() => {
    if (concept) setShown(concept)
  }, [path])

  const close = () => {
    if (history.state?.conceptOpened) history.back()
    else history.replaceState(null, '', location.pathname + location.search)
    setPath(null)
  }

  useEffect(() => {
    if (!path) return
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [path])

  const open = Boolean(path && concept)
  const c = concept ?? shown
  return (
    <div className={open ? 'drawer open' : 'drawer'} aria-hidden={!open}>
      <button type="button" className="drawer-scrim" aria-label="Close" tabIndex={-1} onClick={close} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label={c?.title ?? 'Concept'}>
        <button type="button" className="drawer-close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        {c && (
          <div className="drawer-body">
            <span className="eyebrow gold">{c.eyebrow}</span>
            <h2>{c.title}</h2>
            <p className="drawer-lead">{c.lead}</p>
            {c.body.map((p) => <p key={p}>{p}</p>)}
            {c.personal && <p className="drawer-personal">{c.personal}</p>}
            {c.related.length > 0 && (
              <div className="drawer-related">
                <span className="eyebrow">Keep exploring</span>
                <div>{c.related.map((r) => <a key={r.href} className="pill" href={r.href} onClick={(e) => { e.preventDefault(); history.replaceState(history.state, '', r.href); window.dispatchEvent(new HashChangeEvent('hashchange')) }}>{r.label}</a>)}</div>
              </div>
            )}
            <p className="drawer-note">Astra's full writing on this is coming soon.</p>
          </div>
        )}
      </aside>
    </div>
  )
}

// Open a concept and remember that we did, so closing can step back instead of leaving the user stranded.
export function openConcept(e, to) {
  e.preventDefault()
  history.pushState({ conceptOpened: true }, '', to)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}
