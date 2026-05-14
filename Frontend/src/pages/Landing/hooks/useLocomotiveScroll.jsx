import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import LocomotiveScroll from 'locomotive-scroll'
import { getScrollProgress, mapRange, runAnimatePreset } from '../motion/scrollAnimations'

const LocomotiveContext = createContext(null)

export const useLocomotive = () => useContext(LocomotiveContext)

export function LocomotiveProvider({ children }) {
  const scrollRef = useRef(null)
  const instanceRef = useRef(null)
  const animatedRef = useRef(new WeakSet())
  const frameRef = useRef(0)
  const previousRef = useRef({ y: 0, time: 0 })
  const [state, setState] = useState({ instance: null, scrollY: 0, velocity: 0 })

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return undefined

    previousRef.current = { y: window.scrollY, time: performance.now() }

    const runScrollAnimations = (scrollY, velocity) => {
      container.querySelectorAll('[data-animate]').forEach((element) => {
        if (animatedRef.current.has(element)) return
        const rect = element.getBoundingClientRect()
        const threshold = Number(element.dataset.threshold || 0.78)
        if (rect.top < window.innerHeight * threshold) {
          animatedRef.current.add(element)
          runAnimatePreset(element)
        }
      })

      container.querySelectorAll('[data-parallax]').forEach((element) => {
        const progress = getScrollProgress(element)
        const distance = Number(element.dataset.parallax || 80)
        element.style.transform = `translate3d(0, ${mapRange(0, 1, distance, -distance, progress)}px, 0)`
      })

      container.querySelectorAll('[data-horizontal-track]').forEach((track) => {
        const section = track.closest('[data-horizontal-section]')
        if (!section) return
        const rect = section.getBoundingClientRect()
        const scrollable = Math.max(0, track.scrollWidth - window.innerWidth)
        const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (rect.height || 1)))
        track.style.transform = `translate3d(${-scrollable * progress}px, 0, 0)`
        track.querySelectorAll('[data-project-card]').forEach((card) => {
          const cardRect = card.getBoundingClientRect()
          const centerDistance = Math.abs(cardRect.left + cardRect.width / 2 - window.innerWidth / 2)
          const normalized = Math.min(1, centerDistance / window.innerWidth)
          card.style.opacity = mapRange(0, 1, 1, 0.55, normalized)
          card.style.transform = `scale(${mapRange(0, 1, 1, 0.94, normalized)})`
          const image = card.querySelector('img')
          if (image) image.style.transform = `translateX(${mapRange(0, 1, -8, 8, normalized)}%) scale(1.08)`
        })
      })

      container.style.setProperty('--scroll-velocity', velocity)
    }

    const handleScroll = (scrollY = window.scrollY) => {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(() => {
        const now = performance.now()
        const previous = previousRef.current
        const dt = Math.max(16, now - previous.time)
        const velocity = (scrollY - previous.y) / dt
        previousRef.current = { y: scrollY, time: now }
        runScrollAnimations(scrollY, velocity)
        setState({ instance: instanceRef.current, scrollY, velocity })
      })
    }

    let locomotive = null
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReduced) {
      locomotive = new LocomotiveScroll({
        lenisOptions: {
          lerp: 0.08,
          smoothWheel: true,
          syncTouch: false,
        },
        scrollCallback: ({ scroll }) => handleScroll(scroll || window.scrollY),
      })
      instanceRef.current = locomotive
    }

    const update = () => {
      locomotive?.resize?.()
      handleScroll(window.scrollY)
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('load', update)
    window.addEventListener('resize', update)
    container.querySelectorAll('img').forEach((image) => image.addEventListener('load', update, { once: true }))

    setState((current) => ({ ...current, instance: locomotive }))
    requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('scroll', update)
      window.removeEventListener('load', update)
      window.removeEventListener('resize', update)
      locomotive?.destroy?.()
      instanceRef.current = null
    }
  }, [])

  const value = useMemo(() => ({
    ...state,
    scrollRef,
    update: () => {
      instanceRef.current?.resize?.()
      window.dispatchEvent(new Event('scroll'))
    },
  }), [state])

  return <LocomotiveContext.Provider value={value}>{children}</LocomotiveContext.Provider>
}
