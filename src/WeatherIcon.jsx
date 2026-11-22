// Simple line icons for the six kinds of weather we show.
export default function WeatherIcon({ kind, night, size = 48 }) {
  const cloud = <path d="M18 40h24a9 9 0 0 0 1-17.9A13 13 0 0 0 18.5 25 7.5 7.5 0 0 0 18 40z" />
  const sun = night
    ? <path d="M40 30a13 13 0 1 1-13-17 10 10 0 0 0 13 17z" />
    : <><circle cx="30" cy="30" r="9" /><path d="M30 10v6M30 44v6M10 30h6M44 30h6M16 16l4 4M40 40l4 4M44 16l-4 4M20 40l-4 4" /></>
  const art = {
    clear: sun,
    cloud,
    fog: <>{cloud}<path d="M16 47h28M20 53h20" /></>,
    rain: <>{cloud}<path d="M22 46l-2 6M30 46l-2 6M38 46l-2 6" /></>,
    snow: <>{cloud}<path d="M22 48h.01M30 52h.01M38 48h.01" strokeWidth="4" /></>,
    storm: <>{cloud}<path d="M31 43l-5 8h7l-4 7" /></>,
  }[kind] ?? cloud
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}>
      {art}
    </svg>
  )
}
