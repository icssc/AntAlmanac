import { useEffect, useMemo, useState } from 'react';
import { createTheme, CssBaseline, ThemeProvider, type PaletteOptions } from '@mui/material';
import AppStore from '$stores/AppStore';
import { isDarkMode } from '$lib/helpers';

const lightTheme: PaletteOptions = {
    primary: {
        main: '#5191d6',
    },
    secondary: {
        main: '#ffffff',
    },
    background: {
        default: '#fafafa',
        paper: '#fff',
    },
};

const darkTheme: PaletteOptions = {
    primary: {
        main: '#305db7',
    },
    secondary: {
        main: '#ffffff',
    },
    background: {
        default: '#303030',
        paper: '#424242',
    },
};

interface Props {
    children?: React.ReactNode;
}

/**
 * sets and provides the MUI theme for the app
 */
export default function AppThemev5Provider(props: Props) {
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

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    ...(darkMode ? darkTheme : lightTheme),
                },
            }),
        [darkMode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {props.children}
        </ThemeProvider>
    );
}
