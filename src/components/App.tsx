import { createTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import React, { PureComponent } from 'react';
import ReactGA4 from 'react-ga4';
import { BrowserRouter, Route,Routes } from 'react-router-dom';

import { undoDelete } from '../actions/AppStoreActions';
import { isDarkMode } from '../helpers';
import AppStore from '../stores/AppStore';
import Home from './Home';

class App extends PureComponent {
    state = {
        darkMode: isDarkMode(),
    };

    componentDidMount = () => {
        document.addEventListener('keydown', undoDelete, false);

        AppStore.on('themeToggle', () => {
            this.setState({ darkMode: isDarkMode() });
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (AppStore.getTheme() === 'auto') {
                this.setState({ darkMode: e.matches });
            }
        });

        ReactGA4.initialize('G-30HVJXC2Y4');
        ReactGA4.send('pageview');
    };

    componentWillUnmount() {
        document.removeEventListener('keydown', undoDelete, false);
    }

    render() {
        const theme = createTheme({
            overrides: {
                MuiCssBaseline: {
                    '@global': {
                        a: {
                            color: this.state.darkMode ? 'dodgerblue' : 'blue',
                        },
                    },
                },
            },
            palette: {
                type: this.state.darkMode ? 'dark' : 'light',
                primary: {
                    main: '#305db7',
                },
                secondary: {
                    main: '#ffffff',
                },
            },
        });

        return (
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ThemeProvider theme={theme}>
                                <Home />
                            </ThemeProvider>
                        }
                    />
                    <Route
                        path="/feedback"
                        element={() => window.location.replace('https://forms.gle/k81f2aNdpdQYeKK8A')}
                    />
                </Routes>
            </BrowserRouter>
        );
    }
}

export default App;
