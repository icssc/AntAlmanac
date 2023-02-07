import { useState, useEffect } from 'react';
import ReactGA4 from 'react-ga4';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material';
import AppStore from '$lib/AppStore';
import { isDarkMode } from '$lib/helpers';
import { undoDelete } from '$lib/AppStoreActions';

import Home from '$components/Home';
import ColorPicker from '$components/ColorPicker';

export default function App() {
  const [darkMode, setDarkMode] = useState(isDarkMode());

  useEffect(() => {
    document.addEventListener('keydown', undoDelete, false);

    AppStore.on('themeToggle', () => {
      setDarkMode(isDarkMode());
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (AppStore.getTheme() === 'auto') {
        this.setState({ darkMode: e.matches });
      }
    });

    ReactGA4.initialize('G-30HVJXC2Y4');
    ReactGA4.send('pageview');

    return () => {
      document.removeEventListener('keydown', undoDelete, false);
    };
  }, []);

  const theme = createTheme({
    typography: {
      htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10),
      fontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
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
      ...(darkMode
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
              color: darkMode ? '#FFF' : '#000',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              '&:hover': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
            },
          },
        ],
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
          <>
            <Home />
            <ColorPicker color="pink" analyticsCategory="asdf" isCustomEvent={false} customEventID={69420} sectionCode="asdf" />
          </>
          } />
          <Route path="/feedback" element={<h1>feedback</h1>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
