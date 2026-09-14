import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PhotoCard from './PhotoCard'

/**
 * The gallery half of the feature. It renders exactly one model's photos — the
 * one the active profile tab points at — and animates the swap between them.
 *
 * The whole column set is keyed by `model.id`, so switching tabs unmounts the
 * previous portfolio and mounts the next one; `mode="wait"` lets the outgoing
 * set finish leaving before the new one staggers in.
 */
export default function PhotoGrid({ model, onOpenPhoto, panelId }) {
  const reduceMotion = useReducedMotion()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduceMotion ? { duration: 0.15 } : { staggerChildren: 0.045, delayChildren: 0.05 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  const item = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={`tab-${model.id}`}
      tabIndex={-1}
      aria-live="polite"
      className="mt-8 focus:outline-none"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={model.id}
          variants={container}
          initial="hidden"
          animate="show"
          exit="exit"
          className="columns-2 gap-4 lg:columns-3 2xl:columns-4"
        >
          {model.photos.map((photo, index) => (
            <motion.div key={photo.id} variants={item} className="break-inside-avoid">
              <PhotoCard photo={photo} model={model} index={index} onOpen={onOpenPhoto} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
