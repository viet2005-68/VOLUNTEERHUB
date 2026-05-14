import { useEffect, useRef } from 'react'
import { splitText } from '../motion/textReveal'

export function useSplitText(type = 'lines, words') {
  const ref = useRef(null)
  const splitRef = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    splitRef.current = splitText(element, type)

    return () => {
      splitRef.current?.revert?.()
      splitRef.current = null
    }
  }, [type])

  return ref
}
