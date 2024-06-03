import './App.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { TourProvider } from '@reactour/tour';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import ReactGA4 from 'react-ga4';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { undoDelete } from './actions/AppStoreActions';
import AppQueryProvider from './providers/Query';
import AppThemeProvider from './providers/Theme';
import AppThemev5Provider from './providers/Themev5';
import Feedback from './routes/Feedback';
import Home from './routes/Home';

const BrowserRouter = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/:tab',
        element: <Home />,
    },
    {
        path: '/feedback',
        element: <Feedback />,
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
                    <GoogleOAuthProvider clientId="669941884397-r2rq6kpatj6peiegor0jft33mf16mh22.apps.googleusercontent.com">
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
                    </GoogleOAuthProvider>
                </AppThemev5Provider>
            </AppThemeProvider>
        </AppQueryProvider>
    );
}
