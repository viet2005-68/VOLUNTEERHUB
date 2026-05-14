import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import MagneticButton from './MagneticButton'

function Header({ menuOpen = false, onToggleMenu = () => {} }) {
  const headerRef = useRef(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let previous = window.scrollY
    const onScroll = () => {
      const current = window.scrollY
      setHidden(current > previous && current > 120 && !menuOpen)
      previous = current
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  useEffect(() => {
    if (!headerRef.current) return
    animate(headerRef.current, {
      translateY: hidden ? '-120%' : '0%',
      scale: window.scrollY > 80 ? 0.94 : 1,
      duration: 420,
      ease: 'easeOutExpo',
    })
  }, [hidden])

  return (
    <header ref={headerRef} className="site-header">
      <a className="site-logo" href="#top" data-cursor="link">VolunteerHub</a>
      <nav className="site-nav" aria-label="Sections">
        <a href="#manifesto" data-cursor="link">Manifesto</a>
        <a href="#services" data-cursor="link">Services</a>
        <a href="#projets" data-cursor="link">Projets</a>
        <a href="#contact" data-cursor="link">Contact</a>
      </nav>
      <MagneticButton className="menu-button" onClick={onToggleMenu} aria-expanded={menuOpen} aria-label="Ouvrir le menu">
        {menuOpen ? 'Close' : 'Menu'}
      </MagneticButton>
    </header>
  )
}

export default Header
