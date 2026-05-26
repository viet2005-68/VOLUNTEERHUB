import { useState } from 'react'

const faq = [
  ['How do I start volunteering?', 'Create an account, choose a cause, apply to a mission, and follow the event instructions from your dashboard.'],
  ['Can organizations post events?', 'Yes. Managers can create opportunities, review registrations, and keep volunteer teams updated.'],
  ['What happens after an event?', 'Participation can be reviewed, completions are recorded, and volunteers keep building their impact profile.'],
]

const steps = [
  ['01', 'Your cause', ['Cause', 'Availability']],
  ['02', 'Your role', ['Skills', 'Location']],
  ['03', 'Contact', ['Email', 'Message']],
]

function Contact() {
  const [openFaq, setOpenFaq] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

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

      <form className="quiz-shell" data-animate onSubmit={(event) => event.preventDefault()}>
        <div className="quiz-progress">
          {steps.map(([label], index) => (
            <button key={label} type="button" className={activeStep === index ? 'is-active' : ''} onClick={() => setActiveStep(index)}>
              {label}
            </button>
          ))}
        </div>
        <div className="quiz-step">
          <p>{steps[activeStep][0]}</p>
          <h3>{steps[activeStep][1]}</h3>
          {steps[activeStep][2].map((label) => (
            <label key={label}>
              <span>{label}</span>
              {label === 'Message' ? <textarea rows="4" /> : <input type={label === 'Email' ? 'email' : 'text'} />}
            </label>
          ))}
        </div>
        <button type="button" className="quiz-submit" onClick={() => setActiveStep((activeStep + 1) % steps.length)}>Continue</button>
      </form>
    </section>
  )
}

export default Contact
