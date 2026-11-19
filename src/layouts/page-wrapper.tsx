import type { ReactNode } from 'react'

export function PageWrapper({ children }: { children: ReactNode }) {
  return <main className="flex w-full flex-1 items-center justify-center px-4">{children}</main>
}
