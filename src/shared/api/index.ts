/**
 * Public interface of the backend API module.
 *
 * - Network helpers validate responses with Zod and throw `ApiError`,
 *   `ApiNetworkError`, `ApiTimeoutError`, or `ApiResponseError`. Abort errors from
 *   the caller's signal pass through (check with `isAbortError`).
 * - Call network functions from feature workflow hooks (`use-*-workflow.ts`) or
 *   loaders (`load-*.ts`), not from presentation code.
 * - `requestJson` is the shared HTTP client. The auth feature uses it for the identity service.
 * - `useCancellableRequest` wraps one request in a cancellable state machine.
 */
export { config } from './config'
export {
  ApiError,
  ApiNetworkError,
  ApiResponseError,
  ApiTimeoutError,
  isAbortError,
} from './api-errors'
export { requestJson } from './api-client'
export {
  useCancellableRequest,
  type RequestState,
  type RunRequestState,
} from './use-cancellable-request'
