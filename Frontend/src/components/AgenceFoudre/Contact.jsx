import { useState } from 'react'

const faq = [
  ['Vous accompagnez seulement les réseaux sociaux ?', 'Les réseaux sont le terrain principal, mais la stratégie, la production et le ton structurent tout le dispositif.'],
  ['Peut-on démarrer avec un seul besoin ?', 'Oui. On peut commencer par un audit, une campagne, un shooting ou une ligne éditoriale courte.'],
  ['Comment se passe le lancement ?', 'On qualifie le contexte, on choisit le niveau d accompagnement, puis on construit un plan clair en trois temps.'],
]

const steps = [
  ['01', 'Votre marque', ['Nom', 'Marque']],
  ['02', 'Votre besoin', ['Objectif', 'Budget']],
  ['03', 'Contact', ['Email', 'Message']],
]

function Contact() {
  const [openFaq, setOpenFaq] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section id="contact" className="contact-section section-pad">
      <div className="faq-shell" data-animate="cards">
        <p className="section-label">FAQ</p>
        <h2>Avant de lancer la foudre.</h2>
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
        <button type="button" className="quiz-submit" onClick={() => setActiveStep((activeStep + 1) % steps.length)}>Continuer</button>
      </form>
    </section>
  )
}

export default Contact
