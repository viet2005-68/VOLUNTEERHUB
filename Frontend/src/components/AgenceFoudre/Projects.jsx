import tinhnguyen from '../../assets/landing/tinhnguyen.jpg'
import nhatrac from '../../assets/landing/nhatrac.webp'
import moitruong from '../../assets/landing/moitruong.jpg'
import trongcay from '../../assets/landing/trongcay.jpg'
const projects = [
  ['Teach for Tomorrow', 'Education support', tinhnguyen],
  ['Clean City Day', 'Environment action', nhatrac],
  ['Green Neighborhood', 'Tree planting', moitruong],
  ['Community Kitchen', 'Care and relief', trongcay],
]

function Projects() {
  return (
    <section id="projects" className="projects-section section-pad" data-horizontal-section>
      <div className="projects-intro">
        <p className="section-label">Impact stories</p>
        <h2 data-animate="line-reveal">Real missions, clear roles, visible impact.</h2>
      </div>
      <div className="project-track" data-horizontal-track>
        {projects.map(([title, tag, image]) => (
          <article key={title} className="project-card" data-project-card data-cursor="card">
            <img src={image} alt={title} loading="lazy" />
            <div>
              <span>{tag}</span>
              <h3>{title}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Projects
