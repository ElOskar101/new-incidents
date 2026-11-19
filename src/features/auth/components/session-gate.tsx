import { useSyncExternalStore, type ReactNode } from 'react'
import { ThemeProvider } from '@/shared/theme'
import { Skeleton } from '@/shared/ui/skeleton'
import { getAccountSnapshot, retryAccount, subscribeAccount } from '../services/load-account'

export function SessionGate({ token, children }: { token: string; children: ReactNode }) {
  const result = useSyncExternalStore(
    (listener) => subscribeAccount(token, listener),
    getAccountSnapshot,
  )

  if (result.status === 'ready') return children
  return (
    <ThemeProvider defaultTheme="light">
      <main className="bg-background flex min-h-screen items-center justify-center p-8 font-sans">
        {result.status === 'unavailable' ? (
          <div className="space-y-3 text-center">
            <p role="alert">Unable to verify your session.</p>
            <button type="button" onClick={() => retryAccount(token)} className="underline">
              Try again
            </button>
          </div>
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
