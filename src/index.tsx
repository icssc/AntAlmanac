import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

/**
 * target element ID
 */
const elementId = 'root'

/**
 * try to get a reference to an existing DOM element
 */
const element = document.getElementById(elementId)

/**
 * if the element exists, attach the virtual DOM to the real DOM via that element
 */
if (element) {
  createRoot(element).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
} else {
  throw new Error(`No element with id ${elementId} found in index.html! Please check and add one.`)
}
