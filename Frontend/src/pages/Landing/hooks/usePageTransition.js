import { useEffect, useRef } from 'react'
import { createPageTransition } from '../motion/pageTransitions'

export function usePageTransition() {
  const overlayRef = useRef(null)
  const pageRef = useRef(null)
  const transitionRef = useRef(null)

  useEffect(() => {
    transitionRef.current = createPageTransition({
      overlay: overlayRef.current,
      currentPage: pageRef.current,
    })
  }, [])

  return { overlayRef, pageRef, transition: transitionRef }
}
