import { useState } from 'react'
import { GRID_WIDTHS } from '../lib/images'
import SmartImage from './SmartImage'
import { Expand } from './Icons'

/** Slot width of a grid tile across the responsive column counts. */
const SIZES = '(min-width: 1536px) 20vw, (min-width: 1024px) 26vw, (min-width: 640px) 30vw, 45vw'

/**
 * One portfolio tile. Lazy-loads, fades in once decoded, and reveals a caption
 * plus an expand affordance on hover/focus.
 */
export default function PhotoCard({ photo, model, index, onOpen }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Open photo ${index + 1} of ${model.photos.length} from ${model.name}'s portfolio`}
      className="group bg-ink-850 relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-sm"
    >
      <div style={{ aspectRatio: photo.aspect }} className="w-full">
        <SmartImage
          photo={photo}
          renderWidth={640}
          widths={GRID_WIDTHS}
          sizes={SIZES}
          alt={photo.caption ?? `${model.name} — ${model.title}, portfolio photo ${index + 1}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={[
            'size-full object-cover transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md',
            'group-hover:scale-[1.04] group-focus-visible:scale-[1.04]',
          ].join(' ')}
        />
      </div>

      {/* Gold hairline that draws itself on hover. */}
      <span
        aria-hidden="true"
        className="ring-gold-400/0 group-hover:ring-gold-400/60 group-focus-visible:ring-gold-400/60 pointer-events-none absolute inset-0 rounded-sm ring-1 transition-[box-shadow] duration-500"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 pt-10 opacity-0 transition-opacity duration-400 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="min-w-0">
          <span className="text-bone-100 font-display block truncate text-sm">
            {photo.caption ?? model.name}
          </span>
          <span className="text-gold-400/90 text-eyebrow mt-0.5 block">
            {String(index + 1).padStart(2, '0')} / {String(model.photos.length).padStart(2, '0')}
          </span>
        </span>
        <span className="border-gold-400/50 text-gold-200 grid size-8 shrink-0 place-items-center rounded-full border backdrop-blur-sm">
          <Expand className="size-3.5" />
        </span>
      </span>
    </button>
  )
}
