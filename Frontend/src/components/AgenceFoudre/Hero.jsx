import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { animate, createTimeline, stagger } from 'animejs'
import MagneticButton from './MagneticButton'
import { splitText } from '../../pages/Landing/motion/textReveal'
import bolt from '../../pages/Landing/assets/images/bolt-shape-loader.webp'
import domixi from '../../assets/landing/domixi.jpg'
import treem from '../../assets/landing/treem.jpg'
import dayhoc from '../../assets/landing/dayhoc.avif'
import tinhnguyen from '../../assets/landing/tinhnguyen.webp'
import bodoi from '../../assets/landing/bodoi.webp'
const slides = [
  {
    image: domixi,
    kicker: 'VolunteerHub platform',
    title: 'Volunteer action network',
    side: 'Find causes, join trusted teams, and turn free time into visible impact.',
    theme: 'cream',
  },
  {
    image: bodoi,
    kicker: 'Featured mission',
    title: 'Teach and mentor',
    side: 'Support education projects that need patient hands, steady time, and real care.',
    theme: 'blue',
  },
  {
    image: treem,
    kicker: 'Local care',
    title: 'Community days',
    side: 'Clean parks, plant trees, support shelters, and make every neighborhood easier to love.',
    theme: 'green',
  },
]

const sideImages = [
  dayhoc,
  tinhnguyen,
]

const tickerItems = [
  'Volunteer action',
  'Community first',
  'Real impact',
  'Join the hub',
]

function HeroStageTickers() {
  const repeated = [...tickerItems, ...tickerItems, ...tickerItems]

  return (
    <div className="hero-stage-tickers" aria-hidden="true">
      <div className="hero-stage-ticker hero-stage-ticker--left">
        <div className="hero-stage-ticker__track">
          {repeated.map((item, index) => (
            <span key={`hero-left-${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
      <div className="hero-stage-ticker hero-stage-ticker--right">
        <div className="hero-stage-ticker__track">
          {repeated.map((item, index) => (
            <span key={`hero-right-${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const map = (start, end, progress) => start + (end - start) * progress
const segment = (progress, start, end) => clamp((progress - start) / (end - start || 1))

const MERGE_START = 0.04
const MERGE_END = 0.16
const SECOND_SLIDE_START = 0.24
const THIRD_SLIDE_START = 0.52
const HERO_SEQUENCE_END = 0.9

function Hero() {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const cardStackRef = useRef(null)
  const heroUiRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return undefined

    const root = rootRef.current
    const heroUi = heroUiRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!root || !heroUi || reduce) return undefined

    const split = splitText(heroUi.querySelector('[data-hero-title]'), 'lines, words')
    const tl = createTimeline({ autoplay: false })
      .add(root.querySelectorAll('.hero-big-logo span'), {
        translateY: ['110%', '0%'],
        rotate: ['2deg', '0deg'],
        duration: 900,
        delay: stagger(45),
        ease: 'easeOutExpo',
      })
      .add(heroUi.querySelectorAll('.hero-title .word'), {
        translateY: ['112%', '0%'],
        opacity: [0, 1],
        delay: stagger(34),
        duration: 760,
        ease: 'easeOutExpo',
      }, '-=520')
      .add(heroUi.querySelectorAll('[data-hero-ui]'), {
        translateY: [30, 0],
        opacity: [0, 1],
        delay: stagger(90),
        duration: 680,
        ease: 'easeOutCubic',
      }, '-=460')

    tl.play()

    return () => {
      tl.pause()
      split?.revert?.()
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return undefined

    const root = rootRef.current
    const stage = stageRef.current
    const cardStack = cardStackRef.current
    const heroUi = heroUiRef.current
    if (!root || !stage || !cardStack || !heroUi) return undefined

    let frame = 0
    let currentIndex = -1
    const center = cardStack.querySelector('.hero-sequence-card--center')
    const left = cardStack.querySelector('.hero-sequence-card--left')
    const right = cardStack.querySelector('.hero-sequence-card--right')
    const bg = stage.querySelector('.hero-sequence-bg')
    const kicker = heroUi.querySelector('.hero-sequence-kicker')
    const title = heroUi.querySelector('.hero-sequence-title')
    const side = heroUi.querySelector('.hero-sequence-side')
    const currentImage = center?.querySelector('.hero-sequence-image--current')
    const incomingImage = center?.querySelector('.hero-sequence-image--incoming')

    const setSlide = (index) => {
      if (index === currentIndex) return
      const isInitialSlide = currentIndex === -1
      const previousSlide = slides[currentIndex] || slides[index]
      currentIndex = index
      const slide = slides[index]
      stage.dataset.theme = slide.theme
      heroUi.dataset.theme = slide.theme

      if (isInitialSlide) {
        if (currentImage) currentImage.src = slide.image
        if (incomingImage) incomingImage.src = slide.image
        if (kicker && kicker.textContent !== slide.kicker) kicker.textContent = slide.kicker
        if (title && title.textContent !== slide.title) title.textContent = slide.title
        if (side && side.textContent !== slide.side) side.textContent = slide.side
        return
      }

      if (currentImage) currentImage.src = previousSlide.image
      if (incomingImage) incomingImage.src = slide.image
      if (kicker) kicker.textContent = slide.kicker
      if (title) title.textContent = slide.title
      if (side) side.textContent = slide.side
      animate(currentImage, {
        translateZ: [0, -90],
        rotateY: ['0deg', '-16deg'],
        scale: [1, 0.94],
        opacity: [1, 0.72],
        filter: ['brightness(1)', 'brightness(0.82)'],
        duration: 920,
        ease: 'easeOutExpo',
      })
      animate(incomingImage, {
        translateZ: [120, 0],
        rotateY: ['58deg', '0deg'],
        rotateX: ['4deg', '0deg'],
        scale: [0.92, 1],
        opacity: [0, 1],
        duration: 980,
        ease: 'easeOutExpo',
        onBegin: () => {
          if (incomingImage) incomingImage.style.opacity = '1'
        },
        onComplete: () => {
          if (currentImage) {
            currentImage.src = slide.image
            currentImage.style.transform = ''
            currentImage.style.opacity = ''
            currentImage.style.filter = ''
          }
          if (incomingImage) {
            incomingImage.style.opacity = '0'
            incomingImage.style.transform = 'translateZ(120px) rotateY(58deg) rotateX(4deg) scale(0.92)'
          }
        },
      })
      animate([kicker, title, side], {
        translateY: [28, 0],
        opacity: [0, 1],
        delay: stagger(70),
        duration: 520,
        ease: 'easeOutCubic',
      })
    }

    const render = () => {
      const rect = root.getBoundingClientRect()
      const progress = clamp(-rect.top / (rect.height - window.innerHeight || 1))
      const mergeIn = segment(progress, MERGE_START, MERGE_END)
      const spread = 1 - mergeIn
      const nextIndex = progress < SECOND_SLIDE_START ? 0 : progress < THIRD_SLIDE_START ? 1 : 2
      const inHeroSequence = progress >= 0 && progress <= HERO_SEQUENCE_END

      setSlide(nextIndex)
      if (!inHeroSequence && progress > HERO_SEQUENCE_END) {
        stage.dataset.theme = slides[0].theme
        heroUi.dataset.theme = slides[0].theme
      }

      cardStack.classList.toggle('is-card-active', inHeroSequence)
      cardStack.classList.toggle('is-card-hidden', !inHeroSequence)
      cardStack.classList.toggle('is-card-merged', spread < 0.08)
      stage.classList.toggle('is-card-active', inHeroSequence)
      heroUi.classList.toggle('is-hero-active', inHeroSequence)

      const sideX = Math.min(360, window.innerWidth * 0.22)
      left.style.opacity = spread
      right.style.opacity = spread
      left.style.transform = `translate(-50%, -50%) translate3d(${-sideX * spread}px, ${map(0, -12, spread)}px, 0) rotate(${-7 * spread}deg) scale(${map(0.9, 0.96, spread)})`
      right.style.transform = `translate(-50%, -50%) translate3d(${sideX * spread}px, ${map(0, -12, spread)}px, 0) rotate(${7 * spread}deg) scale(${map(0.9, 0.96, spread)})`
      center.style.transform = `translate(-50%, -50%) translate3d(0, 0, 0) scale(${map(1, 1.03, spread)})`
      bg.style.opacity = segment(progress, 0.22, 0.38)
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(render)
    }

    render()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [mounted])

  const cardStack = (
    <div ref={cardStackRef} className="hero-card-stack" aria-hidden="true">
      <figure className="hero-sequence-card hero-sequence-card--left">
        <img src={sideImages[0]} alt="" />
      </figure>
      <figure className="hero-sequence-card hero-sequence-card--center" data-cursor="card">
        <img className="hero-sequence-image hero-sequence-image--current" src={slides[0].image} alt="" />
        <img className="hero-sequence-image hero-sequence-image--incoming" src={slides[0].image} alt="" />
        <span className="hero-card-badge"><img src={bolt} alt="" /></span>
      </figure>
      <figure className="hero-sequence-card hero-sequence-card--right">
        <img src={sideImages[1]} alt="" />
      </figure>
    </div>
  )

  const heroUi = (
    <div ref={heroUiRef} className="hero-floating-ui" data-theme="cream">
      <div className="hero-bottom-copy" data-hero-ui>
        <p className="hero-sequence-kicker">{slides[0].kicker}</p>
        <h1 className="hero-title hero-sequence-title" data-hero-title>{slides[0].title}</h1>
      </div>

      <aside className="hero-side-case" data-hero-ui>
        <p className="hero-sequence-side">{slides[0].side}</p>
        <MagneticButton href="#contact">Start volunteering</MagneticButton>
      </aside>
    </div>
  )

  return (
    <>
      {mounted && createPortal(cardStack, document.body)}
      {mounted && createPortal(heroUi, document.body)}
      <section ref={rootRef} id="top" className="hero-section hero-sequence">
        <div ref={stageRef} className="hero-sticky-stage" data-theme="cream">
          <div className="hero-sequence-bg" aria-hidden="true" />
          <HeroStageTickers />

          <div className="hero-big-logo" aria-label="VolunteerHub">
            {'VolunteerHub'.split('').map((letter, index) => (
              <span key={`${letter}-${index}`}>{letter}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero
