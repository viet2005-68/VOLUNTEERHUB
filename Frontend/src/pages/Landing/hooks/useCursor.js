import { useEffect, useRef, useState } from 'react'
import { lerp } from '../motion/scrollAnimations'

export function useCursor() {
  const cursorRef = useRef(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduce) return undefined

    setEnabled(true)
    let frame = 0
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const current = { ...target }

    const move = (event) => {
      target.x = event.clientX
      target.y = event.clientY
    }

    const tick = () => {
      current.x = lerp(current.x, target.x, 0.18)
      current.y = lerp(current.y, target.y, 0.18)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
      }
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', move)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', move)
    }
  }, [])

  return { cursorRef, enabled }
}
