import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

const members = [
  ['Margaux', 'Direction creative', '/media/site/0ee0e5dc47-1765190556/mg-@agence.foudre-137-600x-q80.avif', '/media/site/e705d77393-1766136288/margaux-audio.mp3'],
  ['Mathieu', 'Strategie social media', '/media/site/b89fc535d3-1764264576/agence-foudre-3-600x-q80.avif', '/media/site/e9bbd985e2-1766136304/mathieu-audio.mp3'],
  ['Florent', 'Content creator', '/media/site/9e2180cad6-1764264569/agence-foudre-1-600x-q80.avif', '/media/site/b6db5aab54-1766136315/florent_3.mp3'],
  ['Johane', 'Image & production', '/media/site/018bae38b6-1764705366/mamy-grand-shooting-600x-q80.avif', '/media/site/a39e6834f4-1766136357/johane-audio.mp3'],
]

function Team() {
  const audioRef = useRef(null)
  const cardRef = useRef(null)
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => () => audioRef.current?.pause(), [])

  useEffect(() => {
    if (!cardRef.current) return
    animate(cardRef.current, { translateY: [34, 0], opacity: [0.35, 1], duration: 520, ease: 'easeOutExpo' })
  }, [active])

  const member = members[active]

  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }
    audio.src = member[3]
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  const setMember = (index) => {
    setActive(index)
    setPlaying(false)
    audioRef.current?.pause()
  }

  return (
    <section id="team" className="team-section section-pad">
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />
      <div className="team-copy">
        <p className="section-label">Team</p>
        <h2 data-animate="line-reveal">Des voix qui frappent juste.</h2>
      </div>
      <article ref={cardRef} className="team-card" data-cursor="audio">
        <img src={member[2]} alt={member[0]} />
        <div>
          <span>{member[1]}</span>
          <h3>{member[0].split('').join(' ')}</h3>
          <button type="button" onClick={toggleAudio} className={playing ? 'is-playing' : ''} data-cursor="audio">
            {playing ? 'Pause audio' : 'Play audio'}
          </button>
        </div>
      </article>
      <div className="team-dots">
        {members.map(([name], index) => (
          <button key={name} type="button" className={index === active ? 'is-active' : ''} onClick={() => setMember(index)} aria-label={`Voir ${name}`} />
        ))}
      </div>
    </section>
  )
}

export default Team
