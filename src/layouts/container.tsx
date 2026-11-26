import type { ReactNode } from 'react'

export function Container({ children }: { children: ReactNode }) {
  return <div className="flex h-dvh flex-col overflow-hidden">{children}</div>
}
