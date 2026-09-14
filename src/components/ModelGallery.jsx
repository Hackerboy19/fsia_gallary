import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CATEGORIES, MODELS, modelsInCategory } from '../data/models'
import { useMediaQuery } from '../hooks/useMediaQuery'
import CategoryFilter from './CategoryFilter'
import Lightbox from './Lightbox'
import PhotoGrid from './PhotoGrid'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'

const PANEL_ID = 'fsia-portfolio-panel'

/** Reads `#model-slug` off the URL so a profile can be linked to directly. */
function modelIdFromHash() {
  if (typeof window === 'undefined') return null
  const slug = window.location.hash.replace(/^#/, '')
  return MODELS.find((model) => model.slug === slug)?.id ?? null
}

/**
 * Wires the profile tabs to the photo gallery.
 *
 * One piece of state — `activeModelId` — decides both which tab is highlighted
 * and which portfolio the grid renders. Nothing is duplicated: the grid looks
 * the model up from that id, so the two halves can never disagree.
 */
export default function ModelGallery() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeModelId, setActiveModelId] = useState(() => modelIdFromHash() ?? MODELS[0].id)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const visibleModels = useMemo(() => modelsInCategory(activeCategory), [activeCategory])

  const counts = useMemo(
    () =>
      Object.fromEntries(CATEGORIES.map((category) => [category.id, modelsInCategory(category.id).length])),
    [],
  )

  // Derived, never stored: if the active model isn't in the current category we
  // fall back to the first one on screen. Keeping `activeModelId` untouched
  // means returning to "All Models" restores the previous selection.
  const selectedModel =
    visibleModels.find((model) => model.id === activeModelId) ?? visibleModels[0] ?? null

  // Keep the URL shareable.
  useEffect(() => {
    if (!selectedModel) return
    const next = `#${selectedModel.slug}`
    if (window.location.hash !== next) {
      window.history.replaceState(null, '', next)
    }
  }, [selectedModel])

  const handleSelect = useCallback((id) => {
    setActiveModelId(id)
    setLightboxIndex(null)
  }, [])

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  if (!selectedModel) {
    return (
      <p className="text-bone-400 py-24 text-center">No models in this category yet.</p>
    )
  }

  const tabs = (
    <ProfileTabs
      models={visibleModels}
      activeModelId={selectedModel.id}
      onSelect={handleSelect}
      orientation={isDesktop ? 'vertical' : 'horizontal'}
      panelId={PANEL_ID}
    />
  )

  return (
    <div>
      <CategoryFilter
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
        counts={counts}
      />

      {!isDesktop && <div className="mt-6">{tabs}</div>}

      <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12">
        {isDesktop && (
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="text-eyebrow text-bone-400 hairline mb-3 border-b pb-3">
              Profiles
              <span className="text-gold-600 ml-2">{visibleModels.length}</span>
            </p>
            {tabs}
          </aside>
        )}

        <main>
          <ProfileHeader model={selectedModel} onOpenPortfolio={() => setLightboxIndex(0)} />
          <PhotoGrid model={selectedModel} onOpenPhoto={setLightboxIndex} panelId={PANEL_ID} />
        </main>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            key="lightbox"
            model={selectedModel}
            index={lightboxIndex}
            onIndexChange={setLightboxIndex}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
