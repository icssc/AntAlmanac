import { useEffect, useMemo } from 'react';
import { createTheme, CssBaseline, ThemeProvider, type PaletteOptions } from '@mui/material';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/ThemeStore';

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
    const { theme } = useThemeStore();

    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (AppStore.getTheme() === 'system') {
                useThemeStore.getState().setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }, []);

    const AppTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: theme == 'light' ? 'light' : 'dark',
                    ...(theme == 'light' ? lightTheme : darkTheme),
                },
            }),
        [theme]
    );

    return (
        <ThemeProvider theme={AppTheme}>
            <CssBaseline />
            {props.children}
        </ThemeProvider>
    );
}
