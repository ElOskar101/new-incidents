import { ApiError } from '@/shared/api'

/** Shared copy for HTTP failures that do not need a feature-specific explanation. */
export function httpRequestErrorMessage(
  error: unknown,
  copy: { serverFailure: string; fallback: string },
): string {
  if (error instanceof ApiError && error.status >= 500) return copy.serverFailure
  if (error instanceof ApiError && error.status === 413) {
    return 'The upload exceeded a limit enforced by the server or proxy.'
  }
  if (error instanceof Error) return error.message
  return copy.fallback
}
