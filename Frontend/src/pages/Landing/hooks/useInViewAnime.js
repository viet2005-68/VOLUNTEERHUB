import { useEffect, useRef } from 'react'
import { runAnimatePreset } from '../motion/scrollAnimations'

export function useInViewAnime(options = {}) {
  const ref = useRef(null)
  const hasRunRef = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || hasRunRef.current) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hasRunRef.current) return
      hasRunRef.current = true
      runAnimatePreset(element)
      observer.disconnect()
    }, {
      threshold: options.threshold ?? 0.18,
      rootMargin: options.rootMargin ?? '0px 0px -12% 0px',
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [options.rootMargin, options.threshold])

  return ref
}
