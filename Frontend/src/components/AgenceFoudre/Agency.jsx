function Agency() {
  return (
    <section id="agency" className="agency-section section-pad">
      <div className="agency-parallax" data-parallax="130" aria-hidden="true">SOCIAL FIRST</div>
      <div className="agency-grid">
        <div>
          <p className="section-label">Agence</p>
          <h2 data-animate="line-reveal">Nous électrisons les réseaux avec une direction qui se voit.</h2>
        </div>
        <div className="agency-device" data-animate="image-reveal" data-cursor="card">
          <img src="/media/site/9e2180cad6-1764264569/agence-foudre-1-600x-q80.avif" alt="Equipe agence Foudre" />
          <span>Play reel</span>
        </div>
        <div className="agency-text" data-animate>
          <p>La communication digitale n'est pas une suite de posts: c'est une voix, une tension, une cadence et une présence que l'on retient.</p>
          <p>Stratégie, création, community: chaque contenu doit pouvoir se lire vite, se sentir fort et rester en tête.</p>
        </div>
      </div>
    </section>
  )
}

export default Agency
