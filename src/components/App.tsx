import { createTheme, GlobalStyles, ThemeProvider } from '@mui/material';
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
            typography: {
                htmlFontSize: parseInt(
                    window.getComputedStyle(document.documentElement).getPropertyValue('font-size'),
                    10
                ),
                fontSize:
                    parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
                // color: 'dodgerblue',
            },
            palette: {
                // appBar: {
                //     main: '#305db7',
                // },
                // white: {
                //     main: '#d5d5d5',
                //     contrastText: '#000',
                // },
                // clearButton: {
                //     main: '#f50057',
                // },
                ...(this.state.darkMode
                    ? {
                          mode: 'dark',
                          primary: {
                              main: '#1E90FF',
                              contrastText: '#fff',
                          },
                          secondary: {
                              main: '#1E90FF',
                              contrastText: '#000',
                          },
                          background: {
                              default: '#303030',
                              paper: '#424242',
                          },
                          divider: '#AAA',

                          button: {
                              main: '#FFF',
                          },
                      }
                    : {
                          mode: 'light',
                          primary: {
                              main: '#305db7',
                              contrastText: '#fff',
                          },
                          secondary: {
                              main: '#00F',
                              contrastText: '#000',
                          },
                          button: {
                              main: 'rgba(0, 0, 0, 0.23)',
                          },
                      }),
            },
            spacing: 4,
            components: {
                MuiPaper: {
                    styleOverrides: { root: { backgroundImage: 'unset' } }, // removes transparent gradient
                },
                MuiButton: {
                    //change outlined button variant
                    variants: [
                        {
                            props: { variant: 'outlined', color: 'primary' },
                            style: {
                                color: this.state.darkMode ? '#FFF' : '#000',
                                borderColor: this.state.darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                                '&:hover': {
                                    borderColor: this.state.darkMode
                                        ? 'rgba(255, 255, 255, 0.23)'
                                        : 'rgba(0, 0, 0, 0.23)',
                                },
                            },
                        },
                    ],
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
                                <GlobalStyles styles={{ a: { color: this.state.darkMode ? 'dodgerblue' : 'blue' } }} />
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
