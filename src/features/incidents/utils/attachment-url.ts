import type { IncidentAttachment } from '../types/incident'

export type AttachmentPreviewKind = 'image' | 'pdf'

// Placeholder URL until upload API returns bucket URLs — no real files under `public/`.
export function mockBucketUrl(objectKey: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/attachments/${objectKey.replace(/^\//, '')}`
}

export function isImageAttachment(attachment: IncidentAttachment): boolean {
  if (attachment.type.startsWith('image/')) return true
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(attachment.name)
}

export function isPdfAttachment(attachment: IncidentAttachment): boolean {
  if (attachment.type === 'application/pdf') return true
  return /\.pdf$/i.test(attachment.name)
}

export function attachmentPreviewKind(
  attachment: IncidentAttachment,
): AttachmentPreviewKind | null {
  if (isImageAttachment(attachment)) return 'image'
  if (isPdfAttachment(attachment)) return 'pdf'
  return null
}

export function isViewableAttachment(attachment: IncidentAttachment): boolean {
  return attachmentPreviewKind(attachment) !== null
}

export function resolveAttachmentUrl(attachment: IncidentAttachment): string | undefined {
  if (attachment.url) return attachment.url
  if (isViewableAttachment(attachment)) return mockBucketUrl(attachment.name)
  return undefined
}

export interface ViewableAttachment {
  attachment: IncidentAttachment
  kind: AttachmentPreviewKind
  url: string
}

export function toViewableAttachments(
  attachments: readonly IncidentAttachment[],
): ViewableAttachment[] {
  const items: ViewableAttachment[] = []
  for (const attachment of attachments) {
    const kind = attachmentPreviewKind(attachment)
    const url = resolveAttachmentUrl(attachment)
    if (!kind || !url) continue
    items.push({ attachment, kind, url })
  }
  return items
}
