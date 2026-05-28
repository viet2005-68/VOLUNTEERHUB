import { useState } from 'react'

const faq = [
  ['How do I start volunteering?', 'Create an account, choose a cause, apply to a mission, and follow the event instructions from your dashboard.'],
  ['Can organizations post events?', 'Yes. Managers can create opportunities, review registrations, and keep volunteer teams updated.'],
  ['What happens after an event?', 'Participation can be reviewed, completions are recorded, and volunteers keep building their impact profile.'],
]

import gieomam from '../../assets/landing/gieomam.jpeg'

function Contact() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <section id="contact" className="contact-section section-pad">
      <div className="faq-shell" data-animate="cards">
        <p className="section-label">FAQ</p>
        <h2>Ready to help where it matters?</h2>
        {faq.map(([question, answer], index) => (
          <article key={question} className={openFaq === index ? 'is-open' : ''}>
            <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
              <span>{question}</span>
              <strong>+</strong>
            </button>
            <p>{answer}</p>
          </article>
        ))}
      </div>

      <div className="quiz-shell" data-animate>
        <img
          src={gieomam}
          alt="Volunteer impact"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
        />
      </div>
    </section>
  )
}

export default Contact
