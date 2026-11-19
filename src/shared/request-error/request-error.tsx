import type { ReactNode } from 'react'
import { ApiError, ApiResponseError } from '@/shared/api'

function detailsFrom(error: unknown): unknown {
  if (error instanceof ApiResponseError) return { payload: error.payload, issues: error.issues }
  if (error instanceof ApiError) return error.payload
  return undefined
}

export function RequestError({
  error,
  title,
  message,
  keptMessage,
  notice,
}: {
  error: unknown
  title: string
  message: string
  keptMessage: string
  notice?: ReactNode
}) {
  const details = detailsFrom(error)
  const heading = error instanceof ApiError ? `${title} (HTTP ${error.status})` : title
  return (
    <div
      role="alert"
      className="border-destructive bg-destructive/5 space-y-1.5 rounded-md border px-3 py-2.5"
    >
      <h2 className="text-sm font-medium">{heading}</h2>
      <p className="text-muted-foreground text-xs whitespace-pre-line">{message}</p>
      {notice}
      <p className="text-muted-foreground text-xs">{keptMessage}</p>
      {details !== undefined && (
        <details className="text-muted-foreground text-xs">
          <summary className="cursor-pointer">View error details</summary>
          <pre className="mt-1 max-h-48 overflow-auto rounded bg-muted/40 p-2 whitespace-pre-wrap">
            {JSON.stringify(details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
