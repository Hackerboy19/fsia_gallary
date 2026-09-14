import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

/**
 * Reactive `matchMedia`. SSR-safe: renders `false` on the server.
 * @param {string} query e.g. '(min-width: 1024px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const supported = typeof window !== 'undefined' && typeof window.matchMedia === 'function'

  return useSyncExternalStore(
    supported
      ? (onChange) => {
          const list = window.matchMedia(query)
          list.addEventListener('change', onChange)
          return () => list.removeEventListener('change', onChange)
        }
      : noopSubscribe,
    () => (supported ? window.matchMedia(query).matches : false),
    () => false,
  )
}
