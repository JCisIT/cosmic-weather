import { useEffect, useRef, useState } from 'react'

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// A soft held chord made in the browser. Stands in for a recording until Astra uploads the real one.
function useSampleTone() {
  const ctxRef = useRef(null)
  const start = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const out = ctx.createGain()
    out.gain.setValueAtTime(0, ctx.currentTime)
    out.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2)
    out.connect(ctx.destination)
    for (const [f, type] of [[174.6, 'sine'], [261.6, 'sine'], [349.2, 'triangle'], [523.3, 'sine']]) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = type; o.frequency.value = f; g.gain.value = type === 'triangle' ? 0.25 : 0.5
      o.connect(g); g.connect(out); o.start()
    }
    ctxRef.current = ctx
  }
  const stop = () => { ctxRef.current?.close(); ctxRef.current = null }
  useEffect(() => stop, [])
  return { start, stop }
}

// src = a real recording; without one the card plays the sample tone and says so.
export default function MantraPlayer({ title, src, sample }) {
  const audio = useRef(null)
  const tone = useSampleTone()
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [dur, setDur] = useState(sample ? 60 : 0)

  useEffect(() => {
    if (!sample || !playing) return
    const id = setInterval(() => setPos((p) => (p + 0.25) % 60), 250)
    return () => clearInterval(id)
  }, [sample, playing])

  const toggle = () => {
    if (sample) {
      playing ? tone.stop() : tone.start()
      return setPlaying(!playing)
    }
    playing ? audio.current.pause() : audio.current.play()
  }

  const bars = Array.from({ length: 28 }, (_, i) => 22 + Math.round(60 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))))

  return (
    <section className={playing ? 'mantra playing' : 'mantra'}>
      <button type="button" className="mantra-play" aria-label={playing ? 'Pause your mantra' : 'Play your mantra'} onClick={toggle}>
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /> : <path d="M8 5l11 7-11 7z" fill="currentColor" />}
        </svg>
      </button>
      <div className="mantra-body">
        <span className="eyebrow gold">Your musical mantra</span>
        <h3>{title}</h3>
        <span className="soft">{sample ? 'Sample sound. Your own mantra from Astra will play here.' : 'Recorded for you by Astra Fox'}</span>
        <div className="mantra-wave" aria-hidden="true">
          {bars.map((hgt, i) => <i key={i} style={{ height: `${hgt}%`, opacity: dur && i / bars.length <= pos / dur ? 1 : 0.35, animationDelay: `${(i % 7) * 0.12}s` }} />)}
        </div>
        <span className="mantra-time">{clock(pos)}{dur ? ` / ${clock(dur)}` : ''}</span>
      </div>
      {!sample && (
        <audio
          ref={audio}
          src={src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setPos(0) }}
          onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
        />
      )}
    </section>
  )
}
