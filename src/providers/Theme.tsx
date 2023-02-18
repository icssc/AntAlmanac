import { useEffect, useState } from 'react';
import { createTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import AppStore from '$stores/AppStore';
import { isDarkMode } from '$lib/helpers';

interface Props {
    children?: React.ReactNode;
}

/**
 * sets and provides the MUI theme for the app
 */
export default function AppThemeProvider(props: Props) {
    const [darkMode, setDarkMode] = useState(isDarkMode());

    useEffect(() => {
        AppStore.on('themeToggle', () => {
            setDarkMode(isDarkMode());
        });
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (AppStore.getTheme() === 'auto') {
                setDarkMode(e.matches);
            }
        });
    }, []);

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

    return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
}
