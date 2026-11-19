import { useEffect } from 'react'

/** One-shot mount sync (explicit empty deps). Prefer handlers / derived state otherwise. */
export function useMountEffect(effect: () => (() => void) | undefined) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only escape hatch
  useEffect(effect, [])
}
