import { useLocation, useNavigate, type To } from 'react-router'
import type { IncidentStatus } from '../types/incident'

export interface OverlayState {
  canGoBack?: boolean
  status?: IncidentStatus
}

// Deep links replace with fallback instead of `navigate(-1)`; in-app opens set `canGoBack`.
export function useOverlayNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as OverlayState

  const to = (pathname: string): To => ({ pathname, search: location.search })

  return {
    state,
    to,
    open(pathname: string, extra: Omit<OverlayState, 'canGoBack'> = {}) {
      void navigate(to(pathname), { state: { ...extra, canGoBack: true } satisfies OverlayState })
    },
    close(fallbackPath = '/') {
      if (state.canGoBack) void navigate(-1)
      else void navigate(to(fallbackPath), { replace: true })
    },
    replace(pathname: string) {
      void navigate(to(pathname), { replace: true })
    },
  }
}
