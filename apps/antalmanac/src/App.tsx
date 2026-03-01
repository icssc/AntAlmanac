import './App.css';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { TourProvider } from '@reactour/tour';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

import { undoDelete, redoDelete } from '$actions/AppStoreActions';
import { AutoSignIn } from '$components/AutoSignIn';
import PosthogPageviewTracker from '$lib/analytics/PostHogPageviewTracker';
import AppPostHogProvider from '$providers/PostHog';
import AppQueryProvider from '$providers/Query';
import { AuthPage } from '$routes/AuthPage';
import { ErrorPage } from '$routes/ErrorPage';
import Feedback from '$routes/Feedback';
import Home from '$routes/Home';
import { OutagePage } from '$routes/OutagePage';
import { Unsubscribe } from '$routes/UnsubscribePage';
import AppThemeProvider from '$src/app/Theme';

/**
 * Do not edit this unless you know what you're doing.
 */
function RouteLayout() {
    return (
        <>
            <PosthogPageviewTracker />
            <AutoSignIn />
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
                path: '/unsubscribe/:userId',
                element: <Unsubscribe />,
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
        document.addEventListener('keydown', redoDelete, false);
        return () => {
            document.removeEventListener('keydown', undoDelete, false);
            document.removeEventListener('keydown', redoDelete, false);
        };
    }, []);

    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppThemeProvider>
                <AppPostHogProvider>
                    <AppQueryProvider>
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
                                    paddingTop: 40,
                                    margin: '4px 20px 20px 20px',
                                }),
                            }}
                        >
                            <SnackbarProvider classes={{ containerRoot: 'notification-snackbar-container' }}>
                                <RouterProvider router={ROUTER} />
                            </SnackbarProvider>
                        </TourProvider>
                    </AppQueryProvider>
                </AppPostHogProvider>
            </AppThemeProvider>
        </AppRouterCacheProvider>
    );
}
