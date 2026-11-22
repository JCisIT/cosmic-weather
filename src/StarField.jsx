import { useEffect, useRef } from 'react'

// Twinkling stars with the occasional shooting star. Draws once and stays still for people who prefer less motion.
export default function StarField() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, stars = [], shot = null, frame = 0, raf = 0

    const size = () => {
      const box = canvas.getBoundingClientRect()
      const d = Math.min(window.devicePixelRatio || 1, 2)
      w = box.width; h = box.height
      canvas.width = w * d; canvas.height = h * d
      ctx.setTransform(d, 0, 0, d, 0, 0)
      let seed = 7
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
      stars = Array.from({ length: Math.round((w * h) / 2600) }, () => ({ x: rnd() * w, y: rnd() * h, r: rnd() * 1.1 + 0.3, p: rnd() * 6.28, s: rnd() * 0.02 + 0.006, gold: rnd() > 0.82 }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        ctx.globalAlpha = still ? 0.7 : 0.35 + 0.6 * Math.abs(Math.sin(s.p + frame * s.s))
        ctx.fillStyle = s.gold ? '#F6DFA4' : '#FFFFFF'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.3); ctx.fill()
      }
      if (shot) {
        const t = shot.t / 40
        const x = shot.x + shot.len * t, y = shot.y + shot.len * 0.45 * t
        const g = ctx.createLinearGradient(x - 60, y - 27, x, y)
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(255,243,214,${0.9 * (1 - t)})`)
        ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(x - 60, y - 27); ctx.lineTo(x, y); ctx.stroke()
        if (++shot.t > 40) shot = null
      }
      ctx.globalAlpha = 1
    }

    const tick = () => {
      frame++
      if (!shot && frame % 420 === 200) shot = { x: w * (0.1 + Math.random() * 0.4), y: h * (0.05 + Math.random() * 0.25), len: w * 0.5, t: 0 }
      draw()
      raf = requestAnimationFrame(tick)
    }

    size(); draw()
    if (!still) raf = requestAnimationFrame(tick)
    const onResize = () => { size(); draw() }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return <canvas ref={ref} className="starfield" aria-hidden="true" />
}
