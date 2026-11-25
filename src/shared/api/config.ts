// Set in `.env`; override per machine in `.env.local`. Never put secrets in VITE_ variables.
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL
if (typeof rawBaseUrl !== 'string' || !rawBaseUrl.trim()) {
  throw new Error(
    'VITE_API_BASE_URL is missing. Copy .env.example to .env and set the backend origin.',
  )
}
const BACKEND_URL = rawBaseUrl.replace(/\/+$/, '')

// In development, requests use relative URLs and the Vite proxy (vite.config.ts)
// forwards them to the backend. This avoids CORS because the browser only talks
// to the Vite origin. Builds and tests call the backend directly.
const API_URL = import.meta.env.MODE === 'development' ? '' : BACKEND_URL

const ENDPOINTS = {
  incidents: `${API_URL}/api/incidents`,
  incident: (id: string) => `${API_URL}/api/incidents/${encodeURIComponent(id)}`,
} as const

// Browser-side limits. `upload` covers large multipart payloads when needed.
const REQUEST_TIMEOUT_MS = { default: 30_000, upload: 300_000 }

export const config = {
  REQUEST_TIMEOUT_MS,
  API_URL,
  BACKEND_URL,
  ENDPOINTS,
}
