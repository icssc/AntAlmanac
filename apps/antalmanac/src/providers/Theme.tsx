import { useEffect } from 'react';
import { createTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { useThemeStore } from '$stores/ThemeStore';

interface Props {
    children?: React.ReactNode;
}

/**
 * sets and provides the MUI theme for the app
 */
export default function AppThemeProvider(props: Props) {
    const { theme } = useThemeStore();

    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (theme === 'system') {
                useThemeStore.getState().setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }, [theme]);

    const AppTheme = createTheme({
        overrides: {
            MuiCssBaseline: {
                '@global': {
                    a: {
                        color: theme == 'light' ? 'blue' : 'dodgerBlue',
                    },
                },
            },
        },
        typography: {
            htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10),
            fontSize:
                parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
        },
        palette: {
            type: theme == 'light' ? 'light' : 'dark',
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

    return <ThemeProvider theme={AppTheme}>{props.children}</ThemeProvider>;
}
