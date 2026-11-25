import { useState } from 'react'
import type { AttachmentPreviewKind } from '../utils/attachment-url'
import { AttachmentMediaFallback } from './attachment-media-fallback'

export function AttachmentPreview({
  kind,
  url,
  name,
  type = '',
}: {
  kind: AttachmentPreviewKind
  url: string
  name: string
  type?: string
}) {
  const [brokenKey, setBrokenKey] = useState<string | null>(null)
  const mediaKey = `${kind}:${url}`
  const broken = brokenKey === mediaKey

  if (kind === 'image') {
    if (broken) {
      return <AttachmentMediaFallback name={name} type={type || 'image/*'} />
    }

    return (
      <img
        src={url}
        alt={name}
        className="max-h-full max-w-full object-contain select-none"
        draggable={false}
        onError={() => setBrokenKey(mediaKey)}
      />
    )
  }

  if (broken) {
    return <AttachmentMediaFallback name={name} type={type || 'application/pdf'} />
  }

  return (
    <iframe
      src={url}
      title={name}
      className="bg-background size-full min-h-0 flex-1 rounded-sm border-0"
      onError={() => setBrokenKey(mediaKey)}
    />
  )
}
