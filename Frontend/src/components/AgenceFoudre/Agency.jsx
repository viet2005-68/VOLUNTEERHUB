import tronglua from '../../assets/landing/tronglua.jpg'
function Agency() {
  return (
    <section id="agency" className="agency-section section-pad">
      <div className="agency-parallax" data-parallax="130" aria-hidden="true">HELP FIRST</div>
      <div className="agency-grid">
        <div>
          <p className="section-label">VolunteerHub</p>
          <h2 data-animate="line-reveal">We connect people, causes, and local action in one clear place.</h2>
        </div>
        <div className="agency-device" data-animate="image-reveal" data-cursor="card">
          <img src={tronglua} alt="Volunteers working together" />
          <span>See impact</span>
        </div>
        <div className="agency-text" data-animate>
          <p>Volunteering should be easy to discover, simple to join, and organized enough for every hour to matter.</p>
          <p>VolunteerHub brings opportunities, registrations, teams, and impact tracking into a focused experience for communities that move together.</p>
        </div>
      </div>
    </section>
  )
}

export default Agency
