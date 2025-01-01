import { createRoot } from 'react-dom/client';

import App from './App';

/**
 * This function runs in the browser to load the React single-page application.
 */
async function main() {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        throw new Error('This function must be run in a browser, not in a Node.js environment.');
    }

    const rootId = 'root';

    const root = document.getElementById(rootId);

    if (!root) {
        throw new Error(`Please create an element with id ${rootId}`);
    }

    if (import.meta.env.DEV) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/react-scan/dist/auto.global.js';
        document.head.appendChild(script);
    }

    createRoot(root).render(<App />);
}

main();
