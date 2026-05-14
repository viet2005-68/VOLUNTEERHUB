import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import nuoiemImage from '../../assets/landing/nuoiem.jpg'
import baove from '../../assets/landing/baove.jpg'
import tinhnguyen from '../../assets/landing/tinhnguyen.jpg'
import trongcay from '../../assets/landing/trongcay.jpg'

const members = [
  ['Mentors', 'Education support', nuoiemImage, '/media/site/e705d77393-1766136288/margaux-audio.mp3'],
  ['Protectors', 'Community safety', baove, '/media/site/e9bbd985e2-1766136304/mathieu-audio.mp3'],
  ['Helpers', 'Event volunteers', tinhnguyen, '/media/site/b6db5aab54-1766136315/florent_3.mp3'],
  ['Planters', 'Green action', trongcay, '/media/site/a39e6834f4-1766136357/johane-audio.mp3'],
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
        <p className="section-label">Volunteer teams</p>
        <h2 data-animate="line-reveal">Every mission needs people who show up.</h2>
      </div>
      <article ref={cardRef} className="team-card" data-cursor="audio">
        <img src={member[2]} alt={member[0]} />
        <div>
          <span>{member[1]}</span>
          <h3>{member[0].split('').join(' ')}</h3>
          <button type="button" onClick={toggleAudio} className={playing ? 'is-playing' : ''} data-cursor="audio">
            {playing ? 'Pause story' : 'Hear story'}
          </button>
        </div>
      </article>
      <div className="team-dots">
        {members.map(([name], index) => (
          <button key={name} type="button" className={index === active ? 'is-active' : ''} onClick={() => setMember(index)} aria-label={`View ${name}`} />
        ))}
      </div>
    </section>
  )
}

export default Team
