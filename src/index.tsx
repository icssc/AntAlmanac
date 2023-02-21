import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

/**
 * strict mode messes with loading the schedule on mount and the calendar
 */
const strictMode = false

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
  const Wrapper = strictMode ? StrictMode : Fragment
  createRoot(element).render(
    <Wrapper>
      <App />
    </Wrapper>
  )
} else {
  throw new Error(`No element with id ${elementId} found in index.html! Please check and add one.`)
}
