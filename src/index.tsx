import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * get a reference to an existing DOM element
 */
const element = document.getElementById('root');

/**
 * if the element exists, attach the virtual DOM to the real DOM via that element
 */
if (element) {
  createRoot(element).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  throw new Error(`No element with id "root" found in index.html! Please check and add one.`);
}
