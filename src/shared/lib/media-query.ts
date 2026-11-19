import { useSyncExternalStore } from 'react'

/** Tailwind `lg` breakpoint — side-by-side PDF + table layouts. */
export const SIDE_BY_SIDE_PDF_QUERY = '(min-width: 1024px)'

function subscribe(query: string, onChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** Subscribe to a CSS media query without `useEffect`. */
export function useMediaQuery(query: string, serverSnapshot = false) {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => window.matchMedia(query).matches,
    () => serverSnapshot,
  )
}

export function useSideBySidePdfLayout() {
  return useMediaQuery(SIDE_BY_SIDE_PDF_QUERY)
}
