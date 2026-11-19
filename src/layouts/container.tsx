import type { ReactNode } from 'react'

export function Container({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-col">{children}</div>
}
