import { animate, createTimeline, stagger } from 'animejs'
import { motion } from './config'

export const activeAnimations = new Set()

export function trackAnimation(instance) {
  if (!instance) return instance
  activeAnimations.add(instance)
  const originalCancel = instance.cancel?.bind(instance)
  if (originalCancel) {
    instance.cancel = () => {
      activeAnimations.delete(instance)
      originalCancel()
    }
  }
  return instance
}

export function cleanupAnimations(instances = []) {
  instances.forEach((instance) => {
    instance?.pause?.()
    instance?.cancel?.()
  })
}

export function createTrackedTimeline(options = {}) {
  return trackAnimation(createTimeline(options))
}

export function animateTracked(options) {
  return trackAnimation(animate(options.targets, options))
}

export function heroIntroTimeline(root) {
  const titleLines = root.querySelectorAll('[data-hero-title] .line, [data-hero-title] .word')
  const subtitle = root.querySelector('[data-hero-subtitle]')
  const cta = root.querySelector('[data-hero-cta]')
  const cards = root.querySelectorAll('[data-hero-card]')

  return createTrackedTimeline({ autoplay: false })
    .add(titleLines, {
      translateY: ['110%', '0%'],
      rotate: ['2deg', '0deg'],
      opacity: [0, 1],
      duration: motion.durations.lineReveal,
      delay: stagger(motion.staggers.titleLines),
      ease: motion.easings.intro,
    })
    .add(subtitle, {
      translateY: [24, 0],
      opacity: [0, 1],
      duration: 650,
      ease: motion.easings.soft,
    }, '-=520')
    .add(cta, {
      scale: [0.86, 1],
      opacity: [0, 1],
      duration: 620,
      ease: motion.easings.elastic,
    }, '-=420')
    .add(cards, {
      translateY: [80, 0],
      scale: [0.86, 1],
      opacity: [0, 1],
      duration: 900,
      delay: stagger(100),
      ease: motion.easings.intro,
    }, '-=500')
}

export function pageIntroTimeline({ overlay, logo, page }) {
  return createTrackedTimeline({ autoplay: false })
    .add(logo, {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 500,
      ease: motion.easings.intro,
    })
    .add(logo, {
      opacity: [1, 0],
      translateY: [0, -24],
      duration: 450,
      ease: motion.easings.soft,
    })
    .add(overlay, {
      scaleY: [1, 0],
      transformOrigin: 'top center',
      duration: 850,
      ease: motion.easings.exit,
    }, '-=120')
    .add(page, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 650,
      ease: motion.easings.soft,
    }, '-=350')
}

export { animate, createTimeline, stagger }
