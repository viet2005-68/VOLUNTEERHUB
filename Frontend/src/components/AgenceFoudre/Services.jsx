import { useState } from 'react'
import { animate } from 'animejs'
import ImageReveal from './ImageReveal'
import bolt from '../../pages/Landing/assets/images/bolt-shape-scroll.png'
import vietnam from '../../assets/landing/vietnam.jpg'
import volunteer from '../../assets/landing/volunteer.png'
import chua from '../../assets/landing/chua.jpg'

const services = [
  ['Discover', 'Browse verified opportunities by cause, schedule, location, and the kind of help each team needs.'],
  ['Coordinate', 'Manage registrations, updates, volunteer lists, and event roles without losing the human energy.'],
  ['Celebrate', 'Track hours, badges, completions, and the local impact created by every mission.'],
]

const serviceImages = [vietnam, volunteer, chua]

const process = [
  ['01', 'Choose a cause', 'Pick education, environment, health, relief, or any mission that fits your values.'],
  ['02', 'Join a team', 'Apply, get approved, and receive the details you need before the event starts.'],
  ['03', 'Show impact', 'Complete the mission, record participation, and keep building your volunteer story.'],
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
        <h2 className="frapper-word">SHOW UP STRONG</h2>
        <img src={bolt} alt="" aria-hidden="true" />
      </div>

      <div className="services-grid" data-animate="cards">
        {services.map(([title, copy], index) => (
          <article key={title} className="service-card" onMouseEnter={onCardEnter} onMouseLeave={onCardLeave} data-cursor="card">
            <ImageReveal src={serviceImages[index]} alt="" />
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
