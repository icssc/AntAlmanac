import './App.css';
import { undoDelete, redoDelete } from '$actions/AppStoreActions';
import { AutoSignIn } from '$components/AutoSignIn';
import PosthogPageviewTracker from '$lib/analytics/PostHogPageviewTracker';
import { ErrorPage } from '$routes/ErrorPage';
import Home from '$routes/Home';
import { OutagePage } from '$routes/OutagePage';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

/**
 * Do not edit this unless you know what you're doing.
 */
function RouteLayout() {
    return (
        <NuqsAdapter>
            <PosthogPageviewTracker />
            <AutoSignIn />
            <Outlet />
        </NuqsAdapter>
    );
}

const OUTAGE = false;

const HOME_PAGE = <Home />;

const BROWSER_ROUTER = createBrowserRouter([
    {
        element: <RouteLayout />,
        children: [
            {
                path: '/',
                element: HOME_PAGE,
                errorElement: <ErrorPage />,
            },
            {
                path: '/:tab',
                element: HOME_PAGE,
                errorElement: <ErrorPage />,
            },
            {
                path: '*',
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);

const OUTAGE_ROUTER = createBrowserRouter([
    {
        element: <RouteLayout />,
        children: [
            {
                path: '/outage',
                element: <OutagePage />,
                errorElement: <ErrorPage />,
            },
            {
                path: '*',
                element: <Navigate to="/outage" replace />,
            },
        ],
    },
]);

const ROUTER = OUTAGE ? OUTAGE_ROUTER : BROWSER_ROUTER;

/**
 * Renders the single page application.
 */
export default function App() {
    useEffect(() => {
        document.addEventListener('keydown', undoDelete, false);
        document.addEventListener('keydown', redoDelete, false);
        return () => {
            document.removeEventListener('keydown', undoDelete, false);
            document.removeEventListener('keydown', redoDelete, false);
        };
    }, []);

    return <RouterProvider router={ROUTER} />;
}
