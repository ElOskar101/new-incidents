import { describe, expect, it } from 'vitest'
import type { IncidentAttachment } from '../../../src/features/incidents/types/incident'
import {
  attachmentPreviewKind,
  isImageAttachment,
  isPdfAttachment,
  isViewableAttachment,
  mockBucketUrl,
  resolveAttachmentUrl,
} from '../../../src/features/incidents/utils/attachment-url'
import { toViewableAttachments } from '../../../src/features/incidents/utils/attachment-url'

function file(
  partial: Pick<IncidentAttachment, 'name' | 'type'> & Partial<IncidentAttachment>,
): IncidentAttachment {
  return {
    id: partial.id ?? partial.name,
    size: partial.size ?? 1,
    ...partial,
  }
}

describe('attachment preview helpers', () => {
  it('classifies images and PDFs for the lightbox', () => {
    const png = file({ name: 'shot.png', type: 'image/png' })
    const pdf = file({ name: 'form.pdf', type: 'application/pdf' })
    const doc = file({
      name: 'notes.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    expect(isImageAttachment(png)).toBe(true)
    expect(isPdfAttachment(pdf)).toBe(true)
    expect(attachmentPreviewKind(png)).toBe('image')
    expect(attachmentPreviewKind(pdf)).toBe('pdf')
    expect(attachmentPreviewKind(doc)).toBeNull()
    expect(isViewableAttachment(doc)).toBe(false)
  })

  it('resolves stored URLs and synthetic attachment fallbacks for viewable files', () => {
    expect(
      resolveAttachmentUrl(file({ name: 'a.png', type: 'image/png', url: 'https://cdn/a.png' })),
    ).toBe('https://cdn/a.png')
    expect(resolveAttachmentUrl(file({ name: 'image.png', type: 'image/png' }))).toBe(
      mockBucketUrl('image.png'),
    )
    expect(resolveAttachmentUrl(file({ name: 'form.pdf', type: 'application/pdf' }))).toBe(
      mockBucketUrl('form.pdf'),
    )
    expect(
      resolveAttachmentUrl(
        file({
          name: 'notes.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      ),
    ).toBeUndefined()
  })

  it('builds the lightbox list in attachment order', () => {
    const items = toViewableAttachments([
      file({ id: '1', name: 'a.png', type: 'image/png', url: '/a.png' }),
      file({ id: '2', name: 'notes.txt', type: 'text/plain' }),
      file({ id: '3', name: 'b.pdf', type: 'application/pdf', url: '/b.pdf' }),
    ])
    expect(items.map((item) => item.attachment.id)).toEqual(['1', '3'])
    expect(items.map((item) => item.kind)).toEqual(['image', 'pdf'])
  })
})
