import React, { PureComponent } from 'react';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import ReactGA from 'react-ga';
import ReactGA4 from 'react-ga4';
import { undoDelete } from '../actions/AppStoreActions';
import AppStore from '../stores/AppStore';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Feedback from './AppBar/Feedback';
import Home from './Home';
import { isDarkMode } from '../helpers';

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

        ReactGA.initialize('UA-133683751-1');
        ReactGA.pageview('/homepage');
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
                color: 'dodgerblue',
            },
            palette: {
                appBar: {
                    main: '#305db7',
                },
                white: {
                    main: '#d5d5d5',
                    contrastText: '#000',
                },
                clearButton: {
                    main: '#f50057',
                },
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
                            props: { variant: 'outlined', color: 'button' },
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
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={theme}>
                                    <GlobalStyles
                                        styles={{ a: { color: this.state.darkMode ? 'dodgerblue' : 'blue' } }}
                                    />
                                    <Home />
                                </ThemeProvider>
                            </StyledEngineProvider>
                        }
                    />
                    <Route exact path="/feedback" element={<Feedback />} />
                </Routes>
            </BrowserRouter>
        );
    }
}

export default App;
