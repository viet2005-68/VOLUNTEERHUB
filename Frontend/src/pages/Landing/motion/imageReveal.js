import { createTimeline } from 'animejs'
import { motion } from './config'

export function imageRevealTimeline(wrapper) {
  const image = wrapper?.querySelector?.('img')
  return createTimeline({ autoplay: false })
    .add(wrapper, {
      clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
      duration: 900,
      ease: motion.easings.exit,
    })
    .add(image, {
      scale: [1.15, 1],
      duration: 1100,
      ease: motion.easings.intro,
    }, '-=850')
}
