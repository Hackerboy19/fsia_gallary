import { useEffect } from 'react'

/**
 * Freezes page scroll while an overlay is open, compensating for the width of
 * the scrollbar so the layout behind the overlay doesn't shift.
 * @param {boolean} locked
 */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return

    const { body, documentElement } = document
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const gutter = window.innerWidth - documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (gutter > 0) body.style.paddingRight = `${gutter}px`

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
    }
  }, [locked])
}
