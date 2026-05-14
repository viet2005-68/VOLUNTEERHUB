import SplitType from 'split-type'
import { animate, stagger } from 'animejs'
import { motion } from './config'

export function splitText(element, type = 'lines, words') {
  if (!element) return null
  const split = new SplitType(element, { types: type })
  split.lines?.forEach((line) => {
    const wrapper = document.createElement('span')
    wrapper.className = 'split-line-mask'
    line.parentNode.insertBefore(wrapper, line)
    wrapper.appendChild(line)
  })
  return split
}

export function revealLines(element) {
  const targets = element?.querySelectorAll?.('.line') || []
  return animate(targets, {
    translateY: ['110%', '0%'],
    rotate: ['2deg', '0deg'],
    opacity: [0, 1],
    duration: motion.durations.lineReveal,
    delay: stagger(motion.staggers.titleLines),
    ease: motion.easings.intro,
  })
}

export function revealWords(element) {
  const targets = element?.querySelectorAll?.('.word') || []
  return animate(targets, {
    opacity: [0.12, 1],
    translateY: [16, 0],
    duration: motion.durations.wordReveal,
    delay: stagger(motion.staggers.words),
    ease: motion.easings.soft,
  })
}
