import './App.css';
import { undoDelete, redoDelete } from '$actions/AppStoreActions';
import { router } from '$src/router';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

/**
 * Renders the single page application.
 */
export function App() {
    useEffect(() => {
        document.addEventListener('keydown', undoDelete, false);
        document.addEventListener('keydown', redoDelete, false);
        return () => {
            document.removeEventListener('keydown', undoDelete, false);
            document.removeEventListener('keydown', redoDelete, false);
        };
    }, []);

    return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
