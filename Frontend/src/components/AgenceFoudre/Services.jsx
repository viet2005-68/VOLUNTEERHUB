import { useState } from 'react'
import { animate } from 'animejs'
import ImageReveal from './ImageReveal'
import bolt from '../../pages/Landing/assets/images/bolt-shape-scroll.png'

const services = [
  ['Stratégie', 'Architecture éditoriale, plateformes, angles et calendrier de prises de parole.'],
  ['Production', 'Photos, reels, motion cuts, formats courts et direction de plateau.'],
  ['Community', 'Conversation, modération créative, réactivité et rituels de marque.'],
]

const process = [
  ['01', 'Allumer', 'Trouver la tension sociale et la transformer en territoire créatif.'],
  ['02', 'Frapper', 'Produire des formats courts, nets, reconnaissables et mémorisables.'],
  ['03', 'Résonner', 'Lire les signaux, amplifier les réponses et garder le rythme.'],
]

function Services() {
  const [openIndex, setOpenIndex] = useState(0)

  const onCardEnter = (event) => {
    animate(event.currentTarget, { translateY: -12, scale: 1.015, duration: 320, ease: 'easeOutQuad' })
  }

  const onCardLeave = (event) => {
    animate(event.currentTarget, { translateY: 0, scale: 1, duration: 520, ease: 'easeOutElastic(1, .65)' })
  }

  return (
    <section id="services" className="services-section section-pad">
      <div className="frapper-section" data-animate="line-reveal" data-parallax="90">
        <h2 className="frapper-word">FRAPPER FORT</h2>
        <img src={bolt} alt="" aria-hidden="true" />
      </div>

      <div className="services-grid" data-animate="cards">
        {services.map(([title, copy], index) => (
          <article key={title} className="service-card" onMouseEnter={onCardEnter} onMouseLeave={onCardLeave} data-cursor="card">
            <ImageReveal src={`/media/site/${index === 0 ? 'b89fc535d3-1764264576/agence-foudre-3-600x-q80.avif' : index === 1 ? '0ee0e5dc47-1765190556/mg-@agence.foudre-137-600x-q80.avif' : 'cca40ed208-1764264583/agence-foudre-2-600x-q80.avif'}`} alt="" />
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>

      <div className="process-list">
        {process.map(([number, title, copy], index) => (
          <article key={number} className={openIndex === index ? 'is-open' : ''}>
            <button type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)} aria-expanded={openIndex === index}>
              <span>{number}</span>
              <strong>{title}</strong>
            </button>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Services
