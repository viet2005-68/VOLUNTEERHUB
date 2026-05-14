import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

const stats = [
  ['120+', 'open volunteer missions'],
  ['8K', 'hours coordinated'],
  ['24h', 'to find a cause'],
]

function Manifesto() {
  const statsRef = useRef(null)

  useEffect(() => {
    const root = statsRef.current
    if (!root) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animate(root.querySelectorAll('[data-stat]'), {
        translateY: [50, 0],
        opacity: [0, 1],
        delay: stagger(120),
        duration: 850,
        ease: 'easeOutExpo',
      })
      observer.disconnect()
    }, { threshold: 0.25 })

    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="manifesto" className="manifesto section-pad">
      <div className="section-label">Mission</div>
      <h2 data-animate="line-reveal">Impact starts when showing up becomes simple.</h2>
      <p data-animate="word-reveal">
        VolunteerHub turns scattered goodwill into organized action: clear roles, trusted events, committed teams, and progress people can see after every mission.
      </p>
      <div ref={statsRef} className="manifesto-stats">
        {stats.map(([value, label]) => (
          <article key={label} data-stat>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Manifesto
