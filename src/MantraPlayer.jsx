import { useRef, useState } from 'react'

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// The musical mantra card.
// src = the client's own recording, uploaded by Astra. Without one, `video` is a YouTube id for one of
// Astra's public songs, which plays inside the card as a stand-in.
export default function MantraPlayer({ title, src, video }) {
  const audio = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [dur, setDur] = useState(0)

  const toggle = () => {
    if (!src) return setPlaying(!playing) // the video mounts and unmounts with this flag
    playing ? audio.current.pause() : audio.current.play()
  }

  const bars = Array.from({ length: 28 }, (_, i) => 22 + Math.round(60 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))))

  return (
    <section className={playing ? 'mantra light playing' : 'mantra light'}>
      <button type="button" className="mantra-play" aria-label={playing ? 'Stop' : `Play ${title}`} onClick={toggle}>
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /> : <path d="M8 5l11 7-11 7z" fill="currentColor" />}
        </svg>
      </button>
      <div className="mantra-body">
        <span className="eyebrow gold">{src ? 'Your musical mantra' : 'Music as medicine'}</span>
        <h3>{title}</h3>
        <span className="soft">{src ? 'Recorded for you by Astra Fox' : 'A song from Astra Fox. Your own mantra will play here once she records it.'}</span>
        {src && (
          <>
            <div className="mantra-wave" aria-hidden="true">
              {bars.map((hgt, i) => <i key={i} style={{ height: `${hgt}%`, opacity: dur && i / bars.length <= pos / dur ? 1 : 0.35, animationDelay: `${(i % 7) * 0.12}s` }} />)}
            </div>
            <span className="mantra-time">{clock(pos)}{dur ? ` / ${clock(dur)}` : ''}</span>
          </>
        )}
      </div>
      {src && (
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
      {!src && playing && video && (
        <iframe
          className="mantra-video"
          title={`${title} by Astra Fox`}
          src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1&playsinline=1&rel=0`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}
    </section>
  )
}
