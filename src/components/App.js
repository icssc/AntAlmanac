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
            palette: this.state.darkMode
                ? {
                      mode: 'dark',
                      primary: {
                          light: '#5191d6',
                          main: '#1E90FF',
                          dark: '#003a75',
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
                      text: {
                          primary: '#FFF',
                      },
                      action: {
                          active: '#FFF',
                      },
                      divider: '#AAA',
                      clearButton: { main: '#f50057' },
                      button: { main: '#FFF', dark: '#000' },
                      link: { main: '#1E90FF' },
                      appBar: { main: '#305db7' },
                  }
                : {
                      mode: 'light',
                      primary: {
                          light: '#5191d6',
                          main: '#305db7',
                          dark: '#003a75',
                          contrastText: '#fff',
                      },
                      secondary: {
                          main: '#00F',
                          contrastText: '#000',
                      },
                      clearButton: { main: '#f50057' },
                      button: { main: '#000' },
                      link: { main: '#00F' },
                      appBar: { main: '#305db7' },
                  },
            spacing: 4,
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
