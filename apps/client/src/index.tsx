import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

/**
 * find an element with id 'root', or get the document body if it doesn't exist
 */
const rootElement = document.getElementById('root') || document.body

/**
 * mount the single page React app's virtual DOM at the root element
 */
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
