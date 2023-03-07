import './App.css';

import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import ReactGA4 from 'react-ga4';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { undoDelete } from './actions/AppStoreActions';
import Home from './components/Home';
import AppQueryProvider from './providers/Query';
import AppThemeProvider from './providers/Theme';

/**
 * renders the single page application
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
                <SnackbarProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/feedback"
                                element={() => window.location.replace('https://forms.gle/k81f2aNdpdQYeKK8A')}
                            />
                        </Routes>
                    </BrowserRouter>
                </SnackbarProvider>
            </AppThemeProvider>
        </AppQueryProvider>
    );
}
