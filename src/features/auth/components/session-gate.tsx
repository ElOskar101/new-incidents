import { useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { ThemeProvider } from '@/shared/theme'
import { Skeleton } from '@/shared/ui/skeleton'
import { clearAccountCache, getAccountSnapshot, subscribeAccount } from '../services/load-account'
import { clearAuthSession, redirectToLogin } from '../services/session'

const UNAVAILABLE_REDIRECT_MS = 3_000

function signOut() {
  clearAuthSession()
  clearAccountCache()
  redirectToLogin()
}

export function SessionGate({ token, children }: { token: string; children: ReactNode }) {
  const result = useSyncExternalStore(
    (listener) => subscribeAccount(token, listener),
    getAccountSnapshot,
  )

  useEffect(() => {
    if (result.status === 'anonymous') {
      redirectToLogin()
      return
    }
    if (result.status !== 'unavailable') return
    const timer = window.setTimeout(signOut, UNAVAILABLE_REDIRECT_MS)
    return () => window.clearTimeout(timer)
  }, [result.status])

  if (result.status === 'ready') return children

  const failed = result.status === 'unavailable' || result.status === 'anonymous'

  return (
    <ThemeProvider defaultTheme="light">
      <main className="bg-background flex min-h-dvh items-center justify-center p-6 font-sans">
        {failed ? (
          <p role="alert" className="text-muted-foreground text-sm">
            {result.status === 'anonymous'
              ? 'Your session expired. Redirecting to sign in…'
              : 'Unable to verify your session.'}
          </p>
        ) : (
          <div
            role="status"
            aria-label="Loading"
            className="flex w-full max-w-sm flex-col items-center gap-3"
          >
            <span className="sr-only">Loading...</span>
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        )}
      </main>
    </ThemeProvider>
  )
}
