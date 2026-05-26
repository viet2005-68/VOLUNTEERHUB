import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

const links = [
  ['Mission', '#manifesto'],
  ['Services', '#services'],
  ['Projects', '#projects'],
  ['Teams', '#team'],
  ['Contact', '#contact'],
]

function MenuOverlay({ open, onClose }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return undefined

    animate(overlay, {
      clipPath: open
        ? ['circle(0% at 96% 6%)', 'circle(145% at 96% 6%)']
        : ['circle(145% at 96% 6%)', 'circle(0% at 96% 6%)'],
      duration: open ? 850 : 600,
      ease: 'easeInOutExpo',
    })

    if (open) {
      animate(overlay.querySelectorAll('li'), {
        translateY: [60, 0],
        opacity: [0, 1],
        delay: stagger(70),
        duration: 720,
        ease: 'easeOutExpo',
      })
    }
  }, [open])

  return (
    <aside ref={overlayRef} className="menu-overlay" aria-hidden={!open}>
      <nav aria-label="Menu principal">
        <ul>
          {links.map(([label, href]) => (
            <li key={label}>
              <a href={href} onClick={onClose} data-cursor="link">{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <p>Find causes, gather teams, and make every volunteer hour count.</p>
    </aside>
  )
}

export default MenuOverlay
