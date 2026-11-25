import { ATTACHMENT_EXTENSIONS, MAX_ATTACHMENTS_BYTES } from '../constants/catalog'
import type { IncidentAttachment } from '../types/incident'
import { formatBytes } from './format'

export interface FileLike {
  name: string
  size: number
  type: string
  url?: string
}

export interface AttachmentSelection {
  attachments: IncidentAttachment[]
  errors: string[]
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

export function totalBytes(attachments: readonly { size: number }[]): number {
  return attachments.reduce((sum, attachment) => sum + attachment.size, 0)
}

export function addAttachments(
  current: readonly IncidentAttachment[],
  files: readonly FileLike[],
  createId: () => string = () => crypto.randomUUID(),
): AttachmentSelection {
  const attachments = [...current]
  const errors: string[] = []
  let total = totalBytes(current)

  for (const file of files) {
    if (!ATTACHMENT_EXTENSIONS.includes(extensionOf(file.name))) {
      errors.push(`${file.name}: file type not supported.`)
      continue
    }
    if (attachments.some((attachment) => attachment.name === file.name)) {
      errors.push(`${file.name}: already attached.`)
      continue
    }
    if (total + file.size > MAX_ATTACHMENTS_BYTES) {
      errors.push(`${file.name}: exceeds the ${formatBytes(MAX_ATTACHMENTS_BYTES)} total limit.`)
      continue
    }
    total += file.size
    const url =
      file.url ??
      (typeof File !== 'undefined' && file instanceof File ? URL.createObjectURL(file) : undefined)
    attachments.push({
      id: createId(),
      name: file.name,
      size: file.size,
      type: file.type,
      ...(url ? { url } : {}),
    })
  }

  return { attachments, errors }
}
