import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useId, useMemo } from 'react'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/utils'
import { type ViewableAttachment } from '../utils/attachment-url'
import { formatBytes } from '../utils/format'
import { AttachmentPreview } from './attachment-preview'

export type { ViewableAttachment }

export function AttachmentViewer({
  items,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: {
  items: readonly ViewableAttachment[]
  index: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onIndexChange: (index: number) => void
}) {
  const titleId = useId()
  const current = items[index]
  const hasMany = items.length > 1
  const isPdf = current?.kind === 'pdf'

  const label = useMemo(() => {
    if (!current) return 'Attachment'
    return current.kind === 'pdf' ? 'PDF' : 'Image'
  }, [current])

  if (!current) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background/95 flex h-[min(92dvh,900px)] max-h-[92dvh] w-[min(96vw,1100px)] max-w-[min(96vw,1100px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1100px)]"
        aria-labelledby={titleId}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <DialogTitle id={titleId} className="truncate text-sm font-medium">
              {current.attachment.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {label} · {formatBytes(current.attachment.size)}
              {hasMany ? ` · ${index + 1} of ${items.length}` : null}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Close attachment viewer"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div
          className={cn(
            'bg-muted/40 relative flex min-h-0 flex-1',
            isPdf ? 'p-0' : 'items-center justify-center p-4',
          )}
        >
          {hasMany ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-1/2 left-3 z-10 size-9 -translate-y-1/2 shadow-md"
              aria-label="Previous attachment"
              onClick={() => onIndexChange((index - 1 + items.length) % items.length)}
            >
              <ChevronLeft className="size-4" />
            </Button>
          ) : null}

          <AttachmentPreview
            kind={current.kind}
            url={current.url}
            name={current.attachment.name}
            type={current.attachment.type}
          />

          {hasMany ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-1/2 right-3 z-10 size-9 -translate-y-1/2 shadow-md"
              aria-label="Next attachment"
              onClick={() => onIndexChange((index + 1) % items.length)}
            >
              <ChevronRight className="size-4" />
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
