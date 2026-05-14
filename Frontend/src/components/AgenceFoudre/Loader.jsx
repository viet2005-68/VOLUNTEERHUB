import { useEffect, useRef } from 'react'
import { animate, createTimeline } from 'animejs'
import boltLoader from '../../pages/Landing/assets/images/bolt-shape-loader.webp'

function Loader({ onComplete }) {
  const loaderRef = useRef(null)

  useEffect(() => {
    const loader = loaderRef.current
    if (!loader) return undefined

    const complete = () => onComplete?.()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fallback = window.setTimeout(complete, 5000)

    if (reduce) {
      animate(loader, {
        opacity: [1, 0],
        duration: 300,
        ease: 'easeOutQuad',
        onComplete: complete,
      })
      return () => window.clearTimeout(fallback)
    }

    const timeline = createTimeline({
      autoplay: false,
      onComplete: () => {
        window.clearTimeout(fallback)
        complete()
      },
    })
      .add(loader.querySelectorAll('.loader-word'), {
        translateY: ['115%', '0%'],
        duration: 680,
        delay: (_, index) => index * 70,
        ease: 'easeOutExpo',
      })
      .add(loader.querySelector('.loader-thunder-wrap'), {
        opacity: [0, 1],
        translateY: [30, 0],
        rotate: ['-8deg', '0deg'],
        scale: [0.76, 1],
        duration: 420,
        ease: 'easeOutBack',
      }, '-=120')
      .add(loader, {
        opacity: [1, 0],
        duration: 420,
        ease: 'easeOutQuad',
      }, '+=220')

    timeline.play()

    return () => {
      window.clearTimeout(fallback)
      timeline.pause?.()
    }
  }, [onComplete])

  return (
    <div ref={loaderRef} className="loader" aria-label="Chargement Agence Foudre">
      <div className="loader-copy" aria-hidden="true">
        {['Se faire entendre.', 'Se faire remarquer.', 'Prendre la lumière.'].map((line) => (
          <span className="loader-line" key={line}><span className="loader-word">{line}</span></span>
        ))}
      </div>
      <div className="loader-thunder-wrap" aria-hidden="true">
        <img className="loader-thunder" src={boltLoader} alt="" />
      </div>
    </div>
  )
}

export default Loader
