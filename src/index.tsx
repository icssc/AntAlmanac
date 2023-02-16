import React from 'react';
import { render } from 'react-dom';
import { SnackbarProvider } from 'notistack';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import App from './components/App';
import { unregister } from './registerServiceWorker';

const theme = createTheme({
    typography: {
        htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10),
        fontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
    },
    palette: {
        type: 'dark',
        primary: {
            light: '#5191d6',
            main: '#0064a4',
            dark: '#003a75',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ffff52',
            main: '#ffd200',
            dark: '#c7a100',
            contrastText: '#000',
        },
    },
    spacing: 4,
});

const rootElement = document.getElementById('root');

render(
    <MuiThemeProvider theme={theme}>
        <SnackbarProvider>
            <App />
        </SnackbarProvider>
    </MuiThemeProvider>,
    rootElement
);

unregister();
