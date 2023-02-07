import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles';
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
// if (process.env.NODE_ENV === 'development') {
//     whyDidYouRender(React, {
//         trackAllPureComponents: true,
//     });
// }

const rootElement = document.getElementById('root');
render(
    <SnackbarProvider>
        <App style={{ height: '100%' }} />
    </SnackbarProvider>,
    rootElement
);

unregister();
