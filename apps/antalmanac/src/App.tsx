import './App.css';

import { CloseOutlined } from '@material-ui/icons';
import { StylesObj, TourProvider } from '@reactour/tour';
import { SnackbarProvider } from 'notistack';
import { MouseEventHandler, useEffect, useState } from 'react';
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
                    <TourProvider
                        steps={[] /** Will be populated by Tutorial component */}
                        padding={5}
                        components={{ Close: (props) => <CloseButton {...props} /> }}
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
                                paddingTop: 20,
                                paddingBottom: 20,
                                paddingLeft: 25,
                                paddingRight: 35,
                            }),
                            controls: (base) => ({
                                ...base,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 10,
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

export const CloseButton = ({
    styles,
    onClick,
    disabled,
}: {
    styles?: StylesObj;
    onClick?: MouseEventHandler;
    disabled?: boolean;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <button
            className="button_hover_effect"
            aria-label="Close Tour"
            disabled={disabled}
            onClick={onClick}
            aria-disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                border: 0,
                background: isHovered ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0)',
                cursor: 'pointer',
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '15px',
                height: '15px',
                opacity: isHovered ? 1 : 0.5,
                transition: 'background 0.3s, opacity 0.3s',
                ...styles,
            }}
        >
            <CloseOutlined
                style={{
                    height: '15px',
                    width: '15px',
                }}
            />
        </button>
    );
};
