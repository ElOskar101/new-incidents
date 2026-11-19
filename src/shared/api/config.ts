// Set in `.env`; override per machine in `.env.local`. Never put secrets in VITE_ variables.
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')

// In development, requests use relative URLs and the Vite proxy (vite.config.ts)
// forwards them to the backend. This avoids CORS because the browser only talks
// to the Vite origin. Builds and tests call the backend directly.
const API_URL = import.meta.env.MODE === 'development' ? '' : BACKEND_URL

// Incident API routes will be registered here as the backend grows.
const ENDPOINTS = {
  // Placeholder root until the incidents backend is wired.
  health: `${API_URL}/api/health`,
} as const

// Browser-side limits. `upload` covers large multipart payloads when needed.
const REQUEST_TIMEOUT_MS = { default: 30_000, upload: 300_000 }

export const config = {
  REQUEST_TIMEOUT_MS,
  API_URL,
  BACKEND_URL,
  ENDPOINTS,
}
