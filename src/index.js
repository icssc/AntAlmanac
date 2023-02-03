import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { createTheme as createTheme2, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { render } from 'react-dom';

import App from './components/App';
import { unregister } from './registerServiceWorker';
// import whyDidYouRender from '@welldone-software/why-did-you-render';
// if (process.env.NODE_ENV === 'development') {
// const whyDidYouRender = require('@welldone-software/why-did-you-render/dist/no-classes-transpile/umd/whyDidYouRender.min.js');
//     whyDidYouRender(React, {
//         trackAllPureComponents: true,
//     });
// // }
const theme = createTheme({
    typography: {
        htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10),
        fontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
    },
    palette: {
        // type: 'dark',
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

const theme2 = createTheme2({
    typography: {
        htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10),
        fontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
    },
    palette: {
        // type: 'dark',
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

// if (process.env.NODE_ENV === 'development') {
//     whyDidYouRender(React, {
//         trackAllPureComponents: true,
//     });
// }

const rootElement = document.getElementById('root');
render(
    <ThemeProvider theme={theme2}>
        <MuiThemeProvider theme={theme}>
            <SnackbarProvider>
                <App style={{ height: '100%' }} />
            </SnackbarProvider>
        </MuiThemeProvider>
    </ThemeProvider>,
    rootElement
);

unregister();
