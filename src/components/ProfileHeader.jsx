import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Crown, Pin, Verified } from './Icons'

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
}

/**
 * Persistent profile info — name, title, city — pinned above the photo grid so
 * it stays on screen for the whole time you're browsing one model's portfolio.
 */
export default function ProfileHeader({ model, onOpenPortfolio }) {
  return (
    <header className="hairline border-b pb-6">
      <AnimatePresence mode="wait">
        <motion.div key={model.id} {...fade} className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <p className="text-eyebrow text-gold-500 flex items-center gap-2">
              <Crown className="size-3.5" />
              <span className="truncate">{model.title}</span>
              {model.verified && (
                <span className="text-gold-400/80 inline-flex items-center gap-1 normal-case tracking-normal">
                  <Verified className="size-3.5" />
                  <span className="sr-only">FSIA verified profile</span>
                </span>
              )}
            </p>

            <h2 className="font-display text-bone-100 mt-2 text-4xl leading-[1.05] font-light sm:text-5xl">
              {model.name}
            </h2>

            <p className="text-bone-300 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Pin className="text-gold-600 size-3.5" />
                {model.city}, {model.state}
              </span>
              <span className="text-gold-700" aria-hidden="true">
                —
              </span>
              <span>Crowned {model.crownYear}</span>
              <span className="text-gold-700" aria-hidden="true">
                —
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Camera className="text-gold-600 size-3.5" />
                {model.photos.length} portfolio photos
              </span>
            </p>

            <p className="font-display text-bone-300/90 mt-3 max-w-prose text-lg italic">{model.tagline}</p>
          </div>

          <button
            type="button"
            onClick={onOpenPortfolio}
            className="border-gold-600/50 text-gold-300 hover:border-gold-400 hover:bg-gold-500/10 hover:text-gold-200 text-eyebrow shrink-0 rounded-full border px-6 py-3 transition-colors duration-300"
          >
            View portfolio
          </button>
        </motion.div>
      </AnimatePresence>
    </header>
  )
}
