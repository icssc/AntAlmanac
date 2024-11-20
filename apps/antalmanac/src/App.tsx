import './App.css';

import { TourProvider } from '@reactour/tour';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import ReactGA4 from 'react-ga4';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { undoDelete } from './actions/AppStoreActions';
import AppQueryProvider from './providers/Query';
import AppThemeProvider from './providers/Theme';
import AppThemev5Provider from './providers/Themev5';
import { ErrorPage } from './routes/Error';
import Feedback from './routes/Feedback';
import Home from './routes/Home';

const BrowserRouter = createBrowserRouter([
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
]);

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
                            maskArea: (base, _) => ({
                                // The highlighted area
                                ...base,
                                rx: 5,
                            }),
                            maskWrapper: (base, _) => ({
                                // The background/overlay
                                ...base,
                                color: 'rgba(0, 0, 0, 0.3)',
                            }),
                            popover: (base, _) => ({
                                // The text box
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
                            <RouterProvider router={BrowserRouter} />
                        </SnackbarProvider>
                    </TourProvider>
                </AppThemev5Provider>
            </AppThemeProvider>
        </AppQueryProvider>
    );
}
