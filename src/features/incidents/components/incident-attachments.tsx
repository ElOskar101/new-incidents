import { Paperclip } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, type To } from 'react-router'
import { cn } from '@/shared/lib/utils'
import type { OverlayState } from '../hooks/use-overlay-navigation'
import type { IncidentAttachment } from '../types/incident'
import {
  attachmentPreviewKind,
  isViewableAttachment,
  resolveAttachmentUrl,
  toViewableAttachments,
} from '../utils/attachment-url'
import { fileTypeMeta } from '../utils/file-extension'
import { formatBytes } from '../utils/format'
import { AttachmentMediaFallback } from './attachment-media-fallback'
import { AttachmentViewer } from './attachment-viewer'
import { DetailSection } from './detail-section'
import { PdfThumbnail } from './pdf-thumbnail'

const TILE = cn(
  'border-border bg-card group flex w-full flex-col overflow-hidden rounded-md border text-left',
  'hover:border-foreground/30 transition-colors',
)

const TILE_BUTTON = cn(
  TILE,
  'focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
)

function AttachmentTile({
  attachment,
  onOpen,
}: {
  attachment: IncidentAttachment
  onOpen?: () => void
}) {
  const kind = attachmentPreviewKind(attachment)
  const url = resolveAttachmentUrl(attachment)
  const viewable = kind !== null && url !== undefined && onOpen

  if (viewable && kind === 'image') {
    return (
      <button type="button" onClick={onOpen} className={TILE_BUTTON}>
        <span className="bg-muted aspect-[5/3] w-full overflow-hidden">
          <ImageTilePreview url={url} name={attachment.name} type={attachment.type} />
        </span>
        <TileCaption name={attachment.name} size={attachment.size} />
      </button>
    )
  }

  if (viewable && kind === 'pdf') {
    return (
      <button type="button" onClick={onOpen} className={TILE_BUTTON}>
        <span className="bg-muted relative aspect-[5/3] w-full overflow-hidden">
          <PdfThumbnail url={url} className="transition-transform group-hover:scale-[1.02]" />
          <span className="bg-background/85 text-muted-foreground absolute right-1 bottom-1 rounded px-1 py-px text-2xs font-semibold tracking-wide uppercase shadow-sm">
            PDF
          </span>
        </span>
        <TileCaption name={attachment.name} size={attachment.size} />
      </button>
    )
  }

  return <FileTypeTile attachment={attachment} />
}

function ImageTilePreview({ url, name, type }: { url: string; name: string; type: string }) {
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null)
  const broken = brokenUrl === url

  if (broken) {
    return <AttachmentMediaFallback name={name} type={type} compact />
  }

  return (
    <img
      src={url}
      alt=""
      className="size-full object-cover transition-transform group-hover:scale-[1.02]"
      onError={() => setBrokenUrl(url)}
    />
  )
}

function FileTypeTile({ attachment }: { attachment: IncidentAttachment }) {
  const meta = fileTypeMeta(attachment.name, attachment.type)
  const { Icon } = meta

  return (
    <div className={TILE}>
      <span className="bg-muted relative flex aspect-[5/3] w-full flex-col items-center justify-center gap-2 overflow-hidden">
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105 dark:ring-white/10',
            meta.plate,
          )}
        >
          <Icon className={cn('size-5', meta.icon)} aria-hidden="true" />
        </span>
        <span
          className={cn(
            'rounded px-1.5 py-px text-2xs font-semibold tracking-wide uppercase',
            meta.chip,
          )}
        >
          {meta.label}
        </span>
      </span>
      <TileCaption name={attachment.name} size={attachment.size} />
    </div>
  )
}

function TileCaption({ name, size }: { name: string; size: number }) {
  return (
    <span className="min-w-0 px-1 py-0.5">
      <span className="block truncate text-xs leading-tight font-medium">{name}</span>
      <span className="text-muted-foreground text-xs leading-tight">{formatBytes(size)}</span>
    </span>
  )
}

export function IncidentAttachments({
  attachments,
  editPath,
  editLinkState,
  editTo,
}: {
  attachments: readonly IncidentAttachment[]
  editPath: string
  editLinkState: OverlayState
  editTo: (path: string) => To
}) {
  const viewable = useMemo(() => toViewableAttachments(attachments), [attachments])
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const openAttachment = (attachment: IncidentAttachment) => {
    if (!isViewableAttachment(attachment)) return
    const index = viewable.findIndex((item) => item.attachment.id === attachment.id)
    if (index >= 0) setViewerIndex(index)
  }

  return (
    <>
      <DetailSection
        id="detail-attachments"
        title="Attachments"
        icon={Paperclip}
        count={attachments.length > 0 ? attachments.length : undefined}
      >
        {attachments.length > 0 ? (
          <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <AttachmentTile
                  attachment={attachment}
                  onOpen={
                    isViewableAttachment(attachment) ? () => openAttachment(attachment) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-xs">
            No files attached.{' '}
            <Link
              to={editTo(editPath)}
              state={editLinkState}
              className="text-primary hover:underline"
            >
              Add files
            </Link>
          </p>
        )}
      </DetailSection>

      {viewerIndex !== null ? (
        <AttachmentViewer
          items={viewable}
          index={viewerIndex}
          open
          onOpenChange={(open) => {
            if (!open) setViewerIndex(null)
          }}
          onIndexChange={setViewerIndex}
        />
      ) : null}
    </>
  )
}
