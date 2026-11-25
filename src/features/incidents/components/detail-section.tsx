import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export function DetailSection({
  id,
  title,
  icon: Icon,
  count,
  children,
  className,
}: {
  id: string
  title: string
  icon: LucideIcon
  count?: number
  children: ReactNode
  className?: string
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        'border-border bg-muted/30 space-y-2 rounded-md border p-3 shadow-xs',
        className,
      )}
    >
      <h3
        id={id}
        className="text-muted-foreground flex items-center gap-1.5 text-2xs font-semibold tracking-wide uppercase"
      >
        <span className="bg-background text-muted-foreground ring-border/80 inline-flex size-5 shrink-0 items-center justify-center rounded ring-1">
          <Icon className="size-3" aria-hidden="true" />
        </span>
        <span className="min-w-0 truncate">{title}</span>
        {count !== undefined ? (
          <span className="bg-background text-muted-foreground ring-border/70 ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-2xs font-medium tabular-nums ring-1">
            {count}
          </span>
        ) : null}
      </h3>
      {children}
    </section>
  )
}
