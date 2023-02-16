import { useEffect, useState } from 'react'
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { isDarkMode } from '../helpers';
import AppStore from '../stores/AppStore';

/**
 * provide MUIv4 theme to the app
 */
export default function Mui4ThemeProvider(props: { children: React.ReactNode }) {
    const [darkMode, setDarkMode] = useState(isDarkMode());

    /**
   * setup the media query listeners and return a function to remove them
   */
  useEffect(() => {
        AppStore.on('themeToggle', () => {
            setDarkMode(isDarkMode());
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (AppStore.getTheme() === 'auto') {
                setDarkMode(e.matches);
            }
        });

  }, [])

    const theme = createTheme({
            overrides: {
                MuiCssBaseline: {
                    '@global': {
                        a: {
                            color: darkMode ? 'dodgerblue' : 'blue',
                        },
                    },
                },
            },
        typography: {
            htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10),
            fontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
        },
        palette: {
            type: darkMode ? 'dark' : 'light',
            primary: {
                light: '#5191d6',
                main: '#305db7',
                dark: '#003a75',
                contrastText: '#fff',
            },
            secondary: {
                light: '#ffff52',
                main: '#ffffff',
                dark: '#c7a100',
                contrastText: '#000',
            },
        },
        spacing: 4,
    });

    return <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>
}
