import { createTimeline } from 'animejs'
import { motion } from './config'

export function createPageTransition({ overlay, currentPage, nextIntro }) {
  const leave = () => createTimeline({ autoplay: false })
    .add(overlay, {
      translateY: ['100%', '0%'],
      duration: 750,
      ease: motion.easings.exit,
    })
    .add(currentPage, {
      opacity: [1, 0],
      translateY: [0, -40],
      duration: 500,
      ease: motion.easings.intro,
    }, '-=600')

  const enter = () => {
    const tl = createTimeline({ autoplay: false })
      .add(overlay, {
        translateY: ['0%', '-100%'],
        duration: 850,
        ease: motion.easings.exit,
      })
    if (typeof nextIntro === 'function') tl.add(nextIntro, '-=400')
    return tl
  }

  return {
    beforeLeave: () => undefined,
    leave,
    enter,
    afterEnter: () => {
      if (overlay) overlay.style.transform = 'translateY(100%)'
    },
  }
}
