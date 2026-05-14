import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

export function useMagnetic(strength = 0.34) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!element || reduce) return undefined

    const move = (event) => {
      const rect = element.getBoundingClientRect()
      const x = (event.clientX - rect.left - rect.width / 2) * strength
      const y = (event.clientY - rect.top - rect.height / 2) * strength
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    const leave = () => animate(element, {
      translateX: 0,
      translateY: 0,
      duration: 650,
      ease: 'easeOutElastic(1, .55)',
    })

    element.addEventListener('mousemove', move)
    element.addEventListener('mouseleave', leave)

    return () => {
      element.removeEventListener('mousemove', move)
      element.removeEventListener('mouseleave', leave)
    }
  }, [strength])

  return ref
}
