import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { captureAuthSession, readStoredToken, requireSession, SessionGate } from '@/features/auth'

captureAuthSession()

if (requireSession()) {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element #root not found.')
  const token = readStoredToken()
  if (!token) throw new Error('A session is required to load the app.')

  createRoot(rootElement).render(
    <StrictMode>
      <SessionGate token={token}>
        <App />
      </SessionGate>
    </StrictMode>,
  )
}
