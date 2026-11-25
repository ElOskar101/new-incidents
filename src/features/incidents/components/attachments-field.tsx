import { Upload, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ATTACHMENT_EXTENSIONS, MAX_ATTACHMENTS_BYTES } from '../constants/catalog'
import type { IncidentAttachment } from '../types/incident'
import { addAttachments, totalBytes } from '../utils/attachments'
import { formatBytes } from '../utils/format'
import { AttachmentIcon } from './attachment-icon'

const ACCEPT = ATTACHMENT_EXTENSIONS.map((extension) => `.${extension}`).join(',')

export function AttachmentsField({
  value,
  onChange,
}: {
  value: IncidentAttachment[]
  onChange: (next: IncidentAttachment[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const [errors, setErrors] = useState<string[]>([])
  const [isOver, setIsOver] = useState(false)
  const used = totalBytes(value)

  const add = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const result = addAttachments(value, Array.from(files))
    setErrors(result.errors)
    onChange(result.attachments)
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes('Files')) return
          event.preventDefault()
          setIsOver(true)
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsOver(false)
          add(event.dataTransfer.files)
        }}
        className={cn(
          'border-border flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-5 text-center transition-colors',
          isOver && 'border-primary bg-primary-subtle',
        )}
      >
        <Upload className="text-muted-foreground size-5" aria-hidden="true" />
        <p className="text-sm">
          Drag files here or{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            aria-describedby={hintId}
            onClick={() => inputRef.current?.click()}
          >
            browse
          </Button>
        </p>
        <p id={hintId} className="text-muted-foreground text-xs">
          {ATTACHMENT_EXTENSIONS.filter((extension) => extension !== 'jpeg')
            .map((extension) => extension.toUpperCase())
            .join(', ')}{' '}
          · up to {formatBytes(MAX_ATTACHMENTS_BYTES)} in total
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-label="Attach files"
          onChange={(event) => {
            add(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      {errors.length > 0 ? (
        <ul role="alert" className="text-danger-strong space-y-0.5 text-xs">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      {value.length > 0 ? (
        <>
          <ul className="divide-border border-border divide-y rounded-md border">
            {value.map((attachment) => (
              <li key={attachment.id} className="flex items-center gap-2.5 px-3 py-2 text-sm">
                <AttachmentIcon type={attachment.type} name={attachment.name} />
                <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {formatBytes(attachment.size)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${attachment.name}`}
                  onClick={() => {
                    setErrors([])
                    onChange(value.filter((current) => current.id !== attachment.id))
                  }}
                >
                  <X className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs tabular-nums">
            {formatBytes(used)} of {formatBytes(MAX_ATTACHMENTS_BYTES)} used
          </p>
        </>
      ) : null}
    </div>
  )
}
