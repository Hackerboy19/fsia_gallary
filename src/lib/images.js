/**
 * Image URL layer.
 *
 * Photos are stored as bare identifiers in `src/data/models.js` so the data
 * never hard-codes a CDN. This module turns an identifier into a real URL:
 *
 *   - With `VITE_IMAGEKIT_URL` set (e.g. https://ik.imagekit.io/fsia), the
 *     identifier is treated as an ImageKit path and rendered through
 *     ImageKit's transformation API — resize, quality, auto format.
 *   - Without it, we fall back to seeded placeholder photography so the
 *     gallery is fully browsable before any assets are uploaded.
 *
 * Both paths emit a `srcset`, so the browser downloads the smallest file that
 * still fills the slot.
 */

const IMAGEKIT_URL = (import.meta.env.VITE_IMAGEKIT_URL ?? '').replace(/\/+$/, '')

/** Candidate widths offered to the browser, in CSS pixels. */
export const GRID_WIDTHS = [320, 480, 640, 900]
export const HERO_WIDTHS = [640, 960, 1280, 1800, 2400]

const heightFor = (width, aspect) => Math.round(width / aspect)

/**
 * @param {{ src: string, aspect: number }} photo
 * @param {number} width  target width in CSS pixels
 * @param {{ quality?: number }} [options]
 * @returns {string} a fully qualified image URL
 */
export function buildImageUrl(photo, width, { quality = 78 } = {}) {
  const height = heightFor(width, photo.aspect)

  if (IMAGEKIT_URL) {
    const path = photo.src.replace(/^\/+/, '')
    const transform = [`w-${width}`, `h-${height}`, 'c-maintain_ratio', `q-${quality}`, 'f-auto'].join(',')
    return `${IMAGEKIT_URL}/${path}?tr=${transform}`
  }

  // Deterministic stand-in: the same identifier always yields the same photo.
  // Path separators are flattened because the seed lives in a single segment.
  const seed = encodeURIComponent(photo.src.replace(/\//g, '-'))
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

/**
 * @param {{ src: string, aspect: number }} photo
 * @param {number[]} [widths]
 * @returns {string} a `srcset` string
 */
export function buildSrcSet(photo, widths = GRID_WIDTHS) {
  return widths.map((width) => `${buildImageUrl(photo, width)} ${width}w`).join(', ')
}

/** True when real assets are being served rather than placeholders. */
export const usingRealAssets = Boolean(IMAGEKIT_URL)

/** Small deterministic hash so a given photo always gets the same fallback. */
function hash(value) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Zero-network fallback rendered when a remote photo fails to load, so a dead
 * CDN degrades into a branded frame rather than a broken-image icon.
 * @param {{ src: string, aspect: number }} photo
 * @returns {string} an SVG data URI
 */
export function placeholderDataUri(photo) {
  const seed = hash(photo.src)
  const width = 800
  const height = heightFor(width, photo.aspect)
  const angle = seed % 90
  const id = `g${seed}`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
<defs><linearGradient id="${id}" gradientTransform="rotate(${angle})">
<stop offset="0%" stop-color="#17171c"/><stop offset="55%" stop-color="#0e0e11"/>
<stop offset="100%" stop-color="#2a2312"/></linearGradient></defs>
<rect width="${width}" height="${height}" fill="url(#${id})"/>
<text x="50%" y="50%" fill="#c9a227" fill-opacity="0.34" text-anchor="middle" dominant-baseline="middle"
 font-family="Georgia, serif" font-size="${Math.round(Math.min(width, height) * 0.16)}"
 letter-spacing="${Math.round(Math.min(width, height) * 0.03)}">FSIA</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
