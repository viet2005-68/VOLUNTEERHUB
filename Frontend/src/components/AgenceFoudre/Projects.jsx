const projects = [
  ['Yelloh! Village', 'Creation de contenu', '/media/site/1be50e9049-1764268151/yelloh-1-600x-q80.avif'],
  ['Solty Hotel', 'Social media', '/media/site/70daac3e59-1764268976/solty-hotels-1-600x-q80.avif'],
  ['Le Sac du Berger', 'Shooting photo', '/media/site/3ba9cf5374-1765366475/sac-du-berger-foudre-600x-q80.avif'],
  ['Mamy Grand', 'Image & reels', '/media/site/018bae38b6-1764705366/mamy-grand-shooting-600x-q80.avif'],
]

function Projects() {
  return (
    <section id="projets" className="projects-section section-pad" data-horizontal-section>
      <div className="projects-intro">
        <p className="section-label">Projets</p>
        <h2 data-animate="line-reveal">Des marques rendues impossibles à ignorer.</h2>
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
