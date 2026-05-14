import { useEffect, useRef, useState } from 'react'
import { createTimeline } from 'animejs'
import { LocomotiveProvider, useLocomotive } from '../../pages/Landing/hooks/useLocomotiveScroll'
import Header from './Header'
import MenuOverlay from './MenuOverlay'
import CustomCursor from './CustomCursor'
import Hero from './Hero'
import Agency from './Agency'
import Manifesto from './Manifesto'
import Marquee from './Marquee'
import Projects from './Projects'
import Services from './Services'
import Team from './Team'
import Contact from './Contact'
import Footer from './Footer'
import bolt from '../../pages/Landing/assets/images/bolt-shape-loader.webp'

function ScrollScene() {
  const { scrollRef, update } = useLocomotive()
  const [menuOpen, setMenuOpen] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const introRef = useRef(null)
  const pageRef = useRef(null)

  useEffect(() => {
    const intro = introRef.current
    const page = pageRef.current
    if (!intro || !page) return undefined

    document.body.style.overflow = 'hidden'
    const timeline = createTimeline({
      autoplay: false,
      onComplete: () => {
        document.body.style.overflow = ''
        setIntroDone(true)
        update?.()
      },
    })
      .add(intro.querySelector('.intro-bolt'), {
        opacity: [0, 1],
        scale: [0.22, 0.72],
        rotate: ['-24deg', '18deg'],
        duration: 520,
        ease: 'easeOutExpo',
      })
      .add(intro.querySelector('.intro-bolt'), {
        scale: [0.72, 8.5],
        rotate: ['18deg', '210deg'],
        opacity: [1, 0],
        duration: 920,
        ease: 'easeInOutExpo',
      }, '+=180')
      .add(intro, {
        opacity: [1, 0],
        duration: 420,
        ease: 'easeOutQuad',
      }, '-=520')
      .add(page, {
        opacity: [0, 1],
        scale: [0.985, 1],
        translateY: [28, 0],
        duration: 760,
        ease: 'easeOutExpo',
      }, '-=460')

    timeline.play()

    return () => {
      document.body.style.overflow = ''
      timeline.pause?.()
    }
  }, [update])

  return (
    <>
      {!introDone && (
        <div ref={introRef} className="intro-overlay" aria-hidden="true">
          <img className="intro-bolt" src={bolt} alt="" />
        </div>
      )}
      <div ref={pageRef} className="page-reveal-shell">
        <CustomCursor />
        <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((value) => !value)} />
        <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main ref={scrollRef} className="scroll-container" data-scroll-container>
          <Hero />
          <Marquee items={['Social', 'Motion', 'Brand', 'Reels', 'Community']} />
          <Agency />
          <Manifesto />
          <Projects />
          <Services />
          <Team />
          <Contact />
          <Footer />
        </main>
      </div>
    </>
  )
}

function AppShell() {
  return (
    <LocomotiveProvider>
      <ScrollScene />
    </LocomotiveProvider>
  )
}

export default AppShell
