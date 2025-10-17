import './App.css';

import { TourProvider } from '@reactour/tour';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

import { undoDelete } from '$actions/AppStoreActions';
import PosthogPageviewTracker from '$lib/analytics/PostHogPageviewTracker';
import AppPostHogProvider from '$providers/PostHog';
import AppQueryProvider from '$providers/Query';
import AppThemeProvider from '$providers/Theme';
import { AuthPage } from '$routes/AuthPage';
import { ErrorPage } from '$routes/ErrorPage';
import Feedback from '$routes/Feedback';
import Home from '$routes/Home';
import { OutagePage } from '$routes/OutagePage';
import { useSessionStore } from '$stores/SessionStore';

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
    const { session, validateIdpSession } = useSessionStore();

    useEffect(() => {
        document.addEventListener('keydown', undoDelete, false);
        return () => {
            document.removeEventListener('keydown', undoDelete, false);
        };
    }, []);

    // Validate IdP session on app load to support single sign-out across clients
    useEffect(() => {
        if (session) {
            validateIdpSession().then((valid) => {
                if (!valid) {
                    console.log('IdP session expired - user signed out from another client');
                }
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AppPostHogProvider>
            <AppQueryProvider>
                <AppThemeProvider>
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
                </AppThemeProvider>
            </AppQueryProvider>
        </AppPostHogProvider>
    );
}
