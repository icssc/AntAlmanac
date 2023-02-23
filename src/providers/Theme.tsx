import { createTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';

import { isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';

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
        palette: {
            type: darkMode ? 'dark' : 'light',
            primary: {
                main: '#305db7',
            },
            secondary: {
                main: '#ffffff',
            },
        },
    });

    return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
}
