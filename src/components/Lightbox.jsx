import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { buildImageUrl, HERO_WIDTHS } from '../lib/images'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import SmartImage from './SmartImage'
import { ChevronLeft, ChevronRight, Close, Pin } from './Icons'

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
const SWIPE_THRESHOLD = 70

/**
 * Full-screen portfolio viewer.
 *
 * Keeps the model's identity on screen the whole time — you never lose track of
 * whose portfolio you're inside — and supports keyboard (arrows / Esc / Tab
 * trap), pointer, and swipe navigation.
 */
export default function Lightbox({ model, index, onIndexChange, onClose }) {
  const reduceMotion = useReducedMotion()
  const dialogRef = useRef(null)
  const restoreFocusRef = useRef(null)
  const previousIndexRef = useRef(index)
  const [direction, setDirection] = useState(1)

  const photo = model.photos[index]
  const total = model.photos.length

  useBodyScrollLock(true)

  const go = useCallback(
    (delta) => {
      setDirection(delta > 0 ? 1 : -1)
      onIndexChange((index + delta + total) % total)
    },
    [index, total, onIndexChange],
  )

  const jumpTo = useCallback(
    (next) => {
      setDirection(next > previousIndexRef.current ? 1 : -1)
      onIndexChange(next)
    },
    [onIndexChange],
  )

  useEffect(() => {
    previousIndexRef.current = index
  }, [index])

  // Capture the trigger so focus can return to it, and move focus into the
  // dialog on open.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement
    dialogRef.current?.focus()
    return () => {
      const node = restoreFocusRef.current
      if (node instanceof HTMLElement && document.contains(node)) node.focus()
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        go(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(-1)
        return
      }
      if (event.key !== 'Tab') return

      // Focus trap.
      const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE)
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [go, onClose])

  // Warm the neighbouring frames so arrow-key browsing feels instant.
  useEffect(() => {
    for (const delta of [1, -1]) {
      const neighbour = model.photos[(index + delta + total) % total]
      if (!neighbour) continue
      const img = new Image()
      img.src = buildImageUrl(neighbour, 1280)
    }
  }, [index, model, total])

  const slide = reduceMotion
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, leave: { opacity: 0 } }
    : {
        enter: (dir) => ({ opacity: 0, x: dir * 56, scale: 0.985 }),
        center: { opacity: 1, x: 0, scale: 1 },
        leave: (dir) => ({ opacity: 0, x: dir * -56, scale: 0.985 }),
      }

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${model.name} — portfolio viewer`}
      ref={dialogRef}
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-xl focus:outline-none"
    >
      {/* Header: persistent profile info + close. */}
      <div className="hairline flex shrink-0 items-start justify-between gap-4 border-b px-4 py-4 sm:px-8">
        <div className="min-w-0">
          <p className="text-eyebrow text-gold-500 truncate">{model.title}</p>
          <h2 className="font-display text-bone-100 mt-1 truncate text-2xl leading-tight font-light sm:text-3xl">
            {model.name}
          </h2>
          <p className="text-bone-400 mt-1 inline-flex items-center gap-1.5 text-xs">
            <Pin className="text-gold-600 size-3" />
            {model.city}, {model.state}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="text-gold-300 font-display hidden text-lg tabular-nums sm:block">
            {String(index + 1).padStart(2, '0')}
            <span className="text-bone-400 mx-1 text-sm">/</span>
            <span className="text-bone-400 text-sm">{String(total).padStart(2, '0')}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close portfolio viewer"
            className="border-ink-600 text-bone-200 hover:border-gold-400 hover:text-gold-200 grid size-10 place-items-center rounded-full border transition-colors"
          >
            <Close className="size-4" />
          </button>
        </div>
      </div>

      {/* Stage. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-4 sm:px-20">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="border-ink-600 text-bone-200 hover:border-gold-400 hover:text-gold-200 absolute left-2 z-10 grid size-11 place-items-center rounded-full border bg-black/40 backdrop-blur-sm transition-colors sm:left-5"
        >
          <ChevronLeft className="size-5" />
        </button>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.figure
            key={photo.id}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="leave"
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) go(1)
              else if (info.offset.x > SWIPE_THRESHOLD) go(-1)
            }}
            className="flex min-h-0 max-w-full cursor-grab flex-col items-center active:cursor-grabbing"
          >
            <SmartImage
              photo={photo}
              renderWidth={1280}
              widths={HERO_WIDTHS}
              sizes="(min-width: 1024px) 70vw, 96vw"
              alt={photo.caption ?? `${model.name} — ${model.title}, portfolio photo ${index + 1}`}
              draggable={false}
              className="max-h-[62vh] w-auto max-w-full rounded-sm object-contain shadow-[0_30px_120px_-20px_rgb(0_0_0/0.9)] sm:max-h-[68vh]"
            />
            <figcaption className="text-bone-300 font-display mt-4 max-w-2xl px-4 text-center text-base italic sm:text-lg">
              {photo.caption ?? model.tagline}
            </figcaption>
          </motion.figure>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="border-ink-600 text-bone-200 hover:border-gold-400 hover:text-gold-200 absolute right-2 z-10 grid size-11 place-items-center rounded-full border bg-black/40 backdrop-blur-sm transition-colors sm:right-5"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Filmstrip. */}
      <div className="hairline shrink-0 border-t px-4 py-4 sm:px-8">
        <div className="fsia-scroll flex justify-start gap-2 overflow-x-auto sm:justify-center">
          {model.photos.map((thumb, thumbIndex) => {
            const isCurrent = thumbIndex === index
            return (
              <button
                key={thumb.id}
                type="button"
                onClick={() => jumpTo(thumbIndex)}
                aria-label={`Go to photo ${thumbIndex + 1}`}
                aria-current={isCurrent ? 'true' : undefined}
                className={[
                  'relative h-16 w-12 shrink-0 overflow-hidden rounded-xs transition duration-300',
                  isCurrent
                    ? 'ring-gold-400 opacity-100 ring-2'
                    : 'opacity-45 ring-1 ring-white/10 hover:opacity-85',
                ].join(' ')}
              >
                <SmartImage
                  photo={thumb}
                  renderWidth={120}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>,
    document.body,
  )
}
