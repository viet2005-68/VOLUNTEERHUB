import { animate } from 'animejs'
import { motion } from './config'

export function animateCardHover(card, entering = true) {
  const image = card.querySelector('img')
  const overlay = card.querySelector('[data-card-overlay]')
  const icon = card.querySelector('[data-card-icon]')

  const animations = [
    animate(card, {
      translateY: entering ? -10 : 0,
      scale: entering ? 1.015 : 1,
      duration: entering ? motion.durations.hover : motion.durations.magneticReturn,
      ease: entering ? motion.easings.hover : motion.easings.elastic,
    }),
  ]

  if (image) {
    animations.push(animate(image, {
      scale: entering ? 1.08 : 1,
      duration: 550,
      ease: motion.easings.intro,
    }))
  }

  if (overlay) {
    animations.push(animate(overlay, {
      opacity: entering ? 0.18 : 0,
      duration: motion.durations.hover,
      ease: motion.easings.hover,
    }))
  }

  if (icon) {
    animations.push(animate(icon, {
      rotate: entering ? '8deg' : '0deg',
      scale: entering ? 1.1 : 1,
      duration: motion.durations.hover,
      ease: motion.easings.hover,
    }))
  }

  return animations
}
