import { useState } from 'react'
import { href } from './concepts/content.js'
import { openConcept } from './concepts/ConceptDrawer.jsx'
import { sunTransitCopy, earthTransitCopy, personalCopy } from './copy/transitCopy.js'

// Renders copy segments: strings as text, { label, href } as tappable concept pills.
function Rich({ parts }) {
  return parts.map((p, i) =>
    typeof p === 'string' ? <span key={i}>{p}</span> : (
      <a key={i} className="pill" href={p.href} onClick={(e) => openConcept(e, p.href)}>{p.label}</a>
    )
  )
}

const Arrow = () => (
  <svg className="tile-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
)

// "Nested Focus": Sun and Earth tiles, the deeper transit with the personal read, then today's lesson.
// brief = { sunTransit, earthTransit, astraNote, dailyLesson }, all pulled from the data layer by Today.
export default function HumanDesignCard({ brief, chart, type, onSetup }) {
  const [open, setOpen] = useState(true)
  const { sunTransit: sun, earthTransit: earth, astraNote, dailyLesson } = brief

  const tile = (kind, t) => (
    <a className={`hd-tile ${kind}`} href={href.gate(t.num)} onClick={(e) => openConcept(e, href.gate(t.num))} aria-label={`${kind === 'sun' ? 'Sun' : 'Earth'} in Gate ${t.num}, line ${t.line}, ${t.name}. Open the gate.`}>
      <span className="hd-tile-k">{kind === 'sun' ? 'Sun' : 'Earth'}</span>
      <b>Gate {t.num}.{t.line}</b>
      <span className="hd-tile-name">{t.name}</span>
      <Arrow />
    </a>
  )

  return (
    <section className="hd-card" id="insight" aria-label="Human Design today">
      <div className="hd-tiles">
        {tile('sun', sun)}
        {tile('earth', earth)}
      </div>

      <div className={open ? 'hd-panel open' : 'hd-panel'}>
        <button type="button" className="hd-panel-head" aria-expanded={open} aria-controls="hd-deeper" onClick={() => setOpen(!open)}>
          <span>The deeper transit</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <div className="hd-collapse" id="hd-deeper">
          <div className="hd-collapse-inner">
            {astraNote && (
              <blockquote className="hd-note">
                <p>{astraNote}</p>
                <cite>Astra</cite>
              </blockquote>
            )}
            <p><Rich parts={sunTransitCopy(sun)} /></p>
            <p><Rich parts={earthTransitCopy(earth)} /></p>
            <div className="hd-divider" role="separator" />
            <span className="hd-sub">Your personal chart</span>
            {chart ? (
              personalCopy(sun, earth, chart, type).map((parts, i) => <p key={i}><Rich parts={parts} /></p>)
            ) : (
              <button type="button" className="hd-cta" onClick={onSetup}>
                See how today's sky lights up your personal chart <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hd-lesson">
        <span className="hd-lesson-k">Today's lesson: {dailyLesson.topic}</span>
        <p>{dailyLesson.hook}</p>
        <a className="hd-lesson-btn" href={href.lesson(dailyLesson.slug)} onClick={(e) => openConcept(e, href.lesson(dailyLesson.slug))}>
          Read full lesson <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}
