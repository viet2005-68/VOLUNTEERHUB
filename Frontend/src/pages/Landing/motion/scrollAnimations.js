import { animate, stagger } from 'animejs'
import { motion } from './config'

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export const mapRange = (inMin, inMax, outMin, outMax, value) => {
  const progress = clamp((value - inMin) / (inMax - inMin || 1))
  return outMin + (outMax - outMin) * progress
}

export const lerp = (start, end, amount) => start + (end - start) * amount

export function getScrollProgress(element, viewportHeight = window.innerHeight) {
  const rect = element.getBoundingClientRect()
  const total = rect.height + viewportHeight
  return clamp((viewportHeight - rect.top) / total)
}

export function runAnimatePreset(element) {
  const preset = element.dataset.animate

  if (preset === 'line-reveal') {
    return animate(element.querySelectorAll('.line, .word'), {
      translateY: ['110%', '0%'],
      rotate: ['2deg', '0deg'],
      opacity: [0, 1],
      duration: motion.durations.lineReveal,
      delay: stagger(motion.staggers.titleLines),
      ease: motion.easings.intro,
    })
  }

  if (preset === 'word-reveal') {
    return animate(element.querySelectorAll('.word'), {
      opacity: [0.12, 1],
      translateY: [16, 0],
      duration: motion.durations.wordReveal,
      delay: stagger(motion.staggers.words),
      ease: motion.easings.soft,
    })
  }

  if (preset === 'cards') {
    return animate(element.children, {
      translateY: [90, 0],
      rotateX: ['8deg', '0deg'],
      opacity: [0, 1],
      duration: motion.durations.cardReveal,
      delay: stagger(motion.staggers.cards),
      ease: motion.easings.intro,
    })
  }

  if (preset === 'image-reveal') {
    const image = element.querySelector('img')
    animate(element, {
      clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
      duration: 900,
      ease: motion.easings.exit,
    })
    return animate(image, {
      scale: [1.15, 1],
      duration: 1100,
      ease: motion.easings.intro,
    })
  }

  return animate(element, {
    translateY: [60, 0],
    opacity: [0, 1],
    duration: motion.durations.sectionReveal,
    ease: motion.easings.intro,
  })
}
