import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { renderPdfThumbnail } from '../utils/pdf-thumbnail'

export function PdfThumbnail({ url, className }: { url: string; className?: string }) {
  const [state, setState] = useState<{ url: string; src: string | null; failed: boolean }>({
    url,
    src: null,
    failed: false,
  })

  if (state.url !== url) {
    setState({ url, src: null, failed: false })
  }

  useEffect(() => {
    let cancelled = false

    void renderPdfThumbnail(url).then(
      (dataUrl) => {
        if (!cancelled) setState({ url, src: dataUrl, failed: false })
      },
      () => {
        if (!cancelled) setState({ url, src: null, failed: true })
      },
    )

    return () => {
      cancelled = true
    }
  }, [url])

  if (state.url === url && state.src) {
    return (
      <img
        src={state.src}
        alt=""
        className={cn('size-full object-cover object-top', className)}
        draggable={false}
      />
    )
  }

  return (
    <span
      className={cn(
        'text-muted-foreground flex size-full flex-col items-center justify-center gap-1',
        state.failed ? 'opacity-80' : 'opacity-60',
        className,
      )}
      aria-hidden="true"
    >
      <FileText className={cn('size-7', !state.failed && 'animate-pulse')} />
      <span className="text-xs font-semibold tracking-wide uppercase">PDF</span>
    </span>
  )
}
