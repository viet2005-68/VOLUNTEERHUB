import tinhnguyen from '../../assets/landing/tinhnguyen.jpg'
import green from '../../assets/landing/greeen.jpeg'
import comkitchen from '../../assets/landing/comkitchen.jpeg'
import nhatractp from "../../assets/landing/nhatractp.jpeg"
const projects = [
  ['Teach for Tomorrow', 'Education support', tinhnguyen],
  ['Clean City Day', 'Environment action', nhatractp],
  ['Green Neighborhood', 'Tree planting', green],
  ['Community Kitchen', 'Care and relief', comkitchen],
]

function Projects() {
  return (
    <section id="projects" className="projects-section section-pad" data-horizontal-section>
      <div className="projects-intro">
        <p className="section-label">Impact stories</p>
        <h2 data-animate="line-reveal" data-threshold="0.96">Real missions, clear roles, visible impact.</h2>
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
