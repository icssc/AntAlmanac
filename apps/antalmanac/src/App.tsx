import './App.css';

import { TourProvider } from '@reactour/tour';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import ReactGA4 from 'react-ga4';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

import { undoDelete } from './actions/AppStoreActions';
import AppQueryProvider from './providers/Query';
import AppThemev5Provider from './providers/Themev5';

import PosthogPageviewTracker from '$lib/analytics/PostHogPageviewTracker';
import AppPostHogProvider from '$providers/PostHog';
import { AuthPage } from '$routes/AuthPage';
import { ErrorPage } from '$routes/ErrorPage';
import Feedback from '$routes/Feedback';
import Home from '$routes/Home';
import { OutagePage } from '$routes/OutagePage';

/**
 * Do not edit this unless you know what you're doing.
 */
function RouteLayout() {
    return (
        <>
            <PosthogPageviewTracker />
            <Outlet />
        </>
    );
}

const OUTAGE = false;

const BROWSER_ROUTER = createBrowserRouter([
    {
        element: <RouteLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
                errorElement: <ErrorPage />,
            },
            {
                path: '/:tab',
                element: <Home />,
                errorElement: <ErrorPage />,
            },
            {
                path: '/feedback',
                element: <Feedback />,
                errorElement: <ErrorPage />,
            },
            {
                path: '/auth',
                element: <AuthPage />,
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
        ReactGA4.initialize('G-30HVJXC2Y4');
        ReactGA4.send('pageview');
        return () => {
            document.removeEventListener('keydown', undoDelete, false);
        };
    }, []);

    return (
        <AppPostHogProvider>
            <AppQueryProvider>
                <AppThemev5Provider>
                    <TourProvider
                        steps={[] /** Will be populated by Tutorial component */}
                        padding={5}
                        styles={{
                            maskArea: (base) => ({
                                ...base,
                                rx: 5,
                            }),
                            maskWrapper: (base) => ({
                                ...base,
                                color: 'rgba(0, 0, 0, 0.3)',
                            }),
                            popover: (base) => ({
                                ...base,
                                background: '#fff',
                                color: 'black',
                                borderRadius: 5,
                                boxShadow: '0 0 10px #000',
                                padding: 20,
                            }),
                        }}
                    >
                        <SnackbarProvider>
                            <RouterProvider router={ROUTER} />
                        </SnackbarProvider>
                    </TourProvider>
                </AppThemev5Provider>
            </AppQueryProvider>
        </AppPostHogProvider>
    );
}
