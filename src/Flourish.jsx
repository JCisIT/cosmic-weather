// A small gold crescent between two fine lines. Used to mark a pause in the page.
export default function Flourish() {
  return (
    <svg className="flourish" viewBox="0 0 160 24" width="160" height="24" aria-hidden="true">
      <path d="M4 12h52M104 12h52" stroke="#D3A955" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <circle cx="64" cy="12" r="1.6" fill="#D3A955" />
      <circle cx="96" cy="12" r="1.6" fill="#D3A955" />
      <path d="M86 12a8 8 0 1 1-8-8 6.2 6.2 0 0 0 8 8z" fill="#D3A955" />
    </svg>
  )
}
