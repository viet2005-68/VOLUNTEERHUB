import { useEffect } from 'react'
import { animate } from 'animejs'
import { useCursor } from '../../pages/Landing/hooks/useCursor'

function CustomCursor() {
  const { cursorRef, enabled } = useCursor()

  useEffect(() => {
    if (!enabled) return undefined

    const setState = (state) => {
      const cursor = cursorRef.current
      if (!cursor) return
      cursor.dataset.state = state
      animate(cursor, {
        scale: state === 'default' ? 1 : state === 'audio' ? 1.45 : 1.25,
        duration: 260,
        ease: 'easeOutQuad',
      })
    }

    const enter = (event) => setState(event.target.closest('[data-cursor]')?.dataset.cursor || 'default')
    const leave = () => setState('default')
    const targets = document.querySelectorAll('[data-cursor]')
    targets.forEach((target) => {
      target.addEventListener('mouseenter', enter)
      target.addEventListener('mouseleave', leave)
    })

    return () => {
      targets.forEach((target) => {
        target.removeEventListener('mouseenter', enter)
        target.removeEventListener('mouseleave', leave)
      })
    }
  }, [cursorRef, enabled])

  if (!enabled) return null

  return (
    <div ref={cursorRef} className="custom-cursor" data-state="default" aria-hidden="true">
      <span className="custom-cursor__label">View</span>
    </div>
  )
}

export default CustomCursor
