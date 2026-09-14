import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import SmartImage from './SmartImage'
import { Camera, Verified } from './Icons'

/**
 * The "Profile Navigation" side of the feature: one tab per model.
 *
 * Implements the WAI-ARIA tabs pattern — `role="tablist"` with roving
 * tabindex, arrow-key navigation, Home/End, and `aria-controls` pointing at
 * the gallery panel. Selecting a tab is what drives the photo grid; there is
 * no second source of truth.
 */
export default function ProfileTabs({ models, activeModelId, onSelect, orientation, panelId }) {
  const tabRefs = useRef(new Map())
  const activeIndex = models.findIndex((model) => model.id === activeModelId)

  // Stable ref callback (React 19 cleanup form) so re-renders don't detach and
  // re-attach every tab node on each pass.
  const registerTab = useCallback((node) => {
    const id = node.dataset.modelId
    tabRefs.current.set(id, node)
    return () => tabRefs.current.delete(id)
  }, [])

  // Keep the selected tab visible when the selection changes from outside
  // (category switch, deep link, lightbox navigation).
  useEffect(() => {
    const node = tabRefs.current.get(activeModelId)
    node?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeModelId])

  function focusAndSelect(index) {
    const model = models[index]
    if (!model) return
    onSelect(model.id)
    tabRefs.current.get(model.id)?.focus()
  }

  function handleKeyDown(event) {
    const { key } = event
    const forward = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const backward = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'

    let nextIndex = null
    if (key === forward) nextIndex = (activeIndex + 1) % models.length
    else if (key === backward) nextIndex = (activeIndex - 1 + models.length) % models.length
    else if (key === 'Home') nextIndex = 0
    else if (key === 'End') nextIndex = models.length - 1

    if (nextIndex === null) return
    event.preventDefault()
    focusAndSelect(nextIndex)
  }

  return (
    <div
      role="tablist"
      aria-label="Model profiles"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={
        orientation === 'vertical'
          ? 'fsia-scroll flex max-h-[calc(100vh-11rem)] flex-col gap-1 overflow-y-auto pr-2'
          : 'fsia-scroll -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2'
      }
    >
      {models.map((model) => {
        const isActive = model.id === activeModelId
        return (
          <button
            key={model.id}
            ref={registerTab}
            data-model-id={model.id}
            role="tab"
            id={`tab-${model.id}`}
            type="button"
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(model.id)}
            className={[
              'group relative flex shrink-0 snap-start items-center gap-3 rounded-md text-left transition-colors duration-300',
              orientation === 'vertical' ? 'w-full px-3 py-2.5' : 'w-[15rem] px-3 py-2.5',
              isActive ? 'bg-ink-800/90' : 'hover:bg-ink-850/70',
            ].join(' ')}
          >
            {isActive && (
              <motion.span
                layoutId="fsia-tab-marker"
                aria-hidden="true"
                className={
                  orientation === 'vertical'
                    ? 'bg-gold-500 absolute top-2 bottom-2 left-0 w-[2px] rounded-full'
                    : 'bg-gold-500 absolute right-3 bottom-0 left-3 h-[2px] rounded-full'
                }
                transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              />
            )}

            <SmartImage
              photo={model.photos[0]}
              renderWidth={96}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              className={[
                'size-11 shrink-0 rounded-full object-cover transition duration-500',
                isActive
                  ? 'ring-gold-500 ring-2 ring-offset-2 ring-offset-[#0e0e11]'
                  : 'opacity-70 ring-1 ring-white/10 group-hover:opacity-100',
              ].join(' ')}
            />

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span
                  className={[
                    'font-display truncate text-[1.06rem] leading-tight transition-colors',
                    isActive ? 'text-gold-200' : 'text-bone-200 group-hover:text-bone-100',
                  ].join(' ')}
                >
                  {model.name}
                </span>
                {model.verified && (
                  <Verified className="text-gold-500/80 size-3.5 shrink-0" aria-label="FSIA verified" />
                )}
              </span>
              <span className="text-bone-400 mt-0.5 flex items-center gap-1.5 text-[0.7rem] tracking-wide">
                <span className="truncate">{model.city}</span>
                <span aria-hidden="true" className="text-gold-700">
                  ·
                </span>
                <span className="inline-flex shrink-0 items-center gap-1">
                  <Camera className="size-3" />
                  {model.photos.length}
                </span>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
