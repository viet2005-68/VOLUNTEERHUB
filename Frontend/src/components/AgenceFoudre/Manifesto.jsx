import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

const stats = [
  ['42', 'lancements social-first'],
  ['7M', 'vues organiques orchestrées'],
  ['3s', 'pour accrocher un regard'],
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
      <div className="section-label">Manifesto</div>
      <h2 data-animate="line-reveal">On ne poste pas. On provoque une réaction.</h2>
      <p data-animate="word-reveal">
        Foudre transforme les marques en personnages sociaux: une voix, une tension, un rythme, des images qui donnent envie de répondre avant même de comprendre pourquoi.
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
