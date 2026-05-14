import { useEffect, useRef } from 'react'

function Marquee({ items }) {
  const trackRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!track || reduce) return undefined

    let frame = 0
    let x = 0
    let speed = 0.7
    const tick = () => {
      x -= speed
      const half = track.scrollWidth / 2
      if (Math.abs(x) >= half) x = 0
      track.style.transform = `translate3d(${x}px, 0, 0)`
      frame = requestAnimationFrame(tick)
    }
    const slow = () => { speed = 0.28 }
    const normal = () => { speed = 0.7 }

    track.addEventListener('mouseenter', slow)
    track.addEventListener('mouseleave', normal)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('mouseenter', slow)
      track.removeEventListener('mouseleave', normal)
    }
  }, [])

  const repeated = [...items, ...items]

  return (
    <section className="marquee-section" aria-label="Expertises">
      <div ref={trackRef} className="marquee-track">
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </section>
  )
}

export default Marquee
