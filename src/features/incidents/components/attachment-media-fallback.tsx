import { ImageOff } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { fileTypeMeta } from '../utils/file-extension'

export function AttachmentMediaFallback({
  name,
  type,
  className,
  compact = false,
}: {
  name: string
  type: string
  className?: string
  compact?: boolean
}) {
  const meta = fileTypeMeta(name, type)

  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground flex size-full flex-col items-center justify-center gap-2',
        className,
      )}
      role="img"
      aria-label={`Preview unavailable for ${name}`}
    >
      <span
        className={cn(
          'bg-card flex items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10',
          compact ? 'size-11' : 'size-14',
        )}
      >
        <ImageOff
          className={cn('text-muted-foreground', compact ? 'size-5' : 'size-6')}
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-col items-center gap-0.5">
        <span
          className={cn(
            'rounded px-1.5 py-px text-2xs font-semibold tracking-wide uppercase',
            meta.chip,
          )}
        >
          {meta.label}
        </span>
        <span className={cn('font-medium', compact ? 'text-2xs' : 'text-xs')}>Unavailable</span>
      </span>
    </span>
  )
}
