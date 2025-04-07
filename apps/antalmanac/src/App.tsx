import './App.css';

import { TourProvider } from '@reactour/tour';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import ReactGA4 from 'react-ga4';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { undoDelete } from './actions/AppStoreActions';
import AppQueryProvider from './providers/Query';
import AppThemeProvider from './providers/Theme';
import AppThemev5Provider from './providers/Themev5';

import { ErrorPage } from '$routes/ErrorPage';
import Feedback from '$routes/Feedback';
import Home from '$routes/Home';
import { OutagePage } from '$routes/OutagePage';

const FUTURE_CONFIG = {
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
    v7_startTransition: true,
};

/**
 * Do not edit this unless you know what you're doing.
 */
const OUTAGE = false;

const BROWSER_ROUTER = createBrowserRouter(
    [
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
            path: '*',
            element: <Navigate to="/" replace />,
        },
    ],
    { future: FUTURE_CONFIG }
);

const OUTAGE_ROUTER = createBrowserRouter(
    [
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
    { future: FUTURE_CONFIG }
);

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
        <AppQueryProvider>
            <AppThemeProvider>
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
                            <RouterProvider
                                router={ROUTER}
                                future={{
                                    v7_startTransition: true,
                                }}
                            />
                        </SnackbarProvider>
                    </TourProvider>
                </AppThemev5Provider>
            </AppThemeProvider>
        </AppQueryProvider>
    );
}
