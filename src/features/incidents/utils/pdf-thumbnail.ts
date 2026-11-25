const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

type PdfJs = typeof import('pdfjs-dist')

let pdfjsPromise: Promise<PdfJs> | null = null

async function loadPdfJs(): Promise<PdfJs> {
  pdfjsPromise ??= (async () => {
    const pdfjs = await import('pdfjs-dist')
    // Vite resolves the worker asset URL; assign once for all thumbnails in this session.
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    return pdfjs
  })()
  return pdfjsPromise
}

export async function renderPdfThumbnail(url: string, maxWidth = 360): Promise<string> {
  const hit = cache.get(url)
  if (hit) return hit

  const pending = inflight.get(url)
  if (pending) return pending

  const task = (async () => {
    const pdfjs = await loadPdfJs()
    const loadingTask = pdfjs.getDocument({ url, withCredentials: false })
    try {
      const doc = await loadingTask.promise
      const page = await doc.getPage(1)
      const unscaled = page.getViewport({ scale: 1 })
      const scale = Math.min(maxWidth / unscaled.width, 1.25)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.floor(viewport.width))
      canvas.height = Math.max(1, Math.floor(viewport.height))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is unavailable in this environment.')

      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      }).promise

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      cache.set(url, dataUrl)
      return dataUrl
    } finally {
      void loadingTask.destroy()
    }
  })().finally(() => {
    inflight.delete(url)
  })

  inflight.set(url, task)
  return task
}

export function clearPdfThumbnailCache() {
  cache.clear()
  inflight.clear()
}
