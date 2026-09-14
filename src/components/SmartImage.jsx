import { useState } from 'react'
import { buildImageUrl, buildSrcSet, placeholderDataUri } from '../lib/images'

/**
 * An `<img>` that resolves its own responsive sources from a photo record and
 * degrades to a branded SVG frame if the CDN can't be reached — a dead image
 * host should never leave torn icons across a fashion portfolio.
 *
 * `renderWidth` is the width requested from the CDN; `width`/`height`, if
 * passed, fall through to the DOM as ordinary attributes.
 */
export default function SmartImage({ photo, renderWidth, widths, sizes, alt, onLoad, ...rest }) {
  const [failed, setFailed] = useState(false)

  return (
    <img
      src={failed ? placeholderDataUri(photo) : buildImageUrl(photo, renderWidth)}
      srcSet={failed || !widths ? undefined : buildSrcSet(photo, widths)}
      sizes={failed || !widths ? undefined : sizes}
      alt={alt}
      decoding="async"
      onLoad={onLoad}
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}
