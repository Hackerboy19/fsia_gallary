import { motion } from 'framer-motion'

/**
 * Top-level segmented control (All / Miss / Mrs / Teen / Mr). Narrowing the
 * category narrows the profile tab list underneath it.
 */
export default function CategoryFilter({ categories, activeCategory, onChange, counts }) {
  return (
    <div className="fsia-scroll -mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by title">
      {categories.map((category) => {
        const isActive = category.id === activeCategory
        const count = counts[category.id] ?? 0
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            aria-pressed={isActive}
            disabled={count === 0}
            className={[
              'text-eyebrow relative shrink-0 rounded-full px-4 py-2 transition-colors duration-300',
              'disabled:cursor-not-allowed disabled:opacity-30',
              isActive ? 'text-ink-950' : 'text-bone-400 hover:text-gold-200',
            ].join(' ')}
          >
            {isActive && (
              <motion.span
                layoutId="fsia-category-pill"
                aria-hidden="true"
                className="from-gold-300 to-gold-500 absolute inset-0 rounded-full bg-gradient-to-b"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative z-10">
              {category.label}
              <span className={isActive ? 'text-ink-950/60 ml-1.5' : 'text-bone-400/60 ml-1.5'}>{count}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
