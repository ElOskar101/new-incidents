import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/inter/wght-italic.css'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Unable to start the application: the root element is missing.')
}

createRoot(rootElement).render(
  <StrictMode>
      <BrowserRouter>
          <App />
      </BrowserRouter>
  </StrictMode>,
)
