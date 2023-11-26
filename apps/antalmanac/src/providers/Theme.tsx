import { useEffect } from 'react';
import { createTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';

import { useThemeStore } from '$stores/SettingsStore';

interface Props {
    children?: React.ReactNode;
}

/**
 * sets and provides the MUI theme for the app
 */
export default function AppThemeProvider(props: Props) {
    const [appTheme, setAppTheme] = useThemeStore((store) => [store.appTheme, store.setAppTheme]);

    useEffect(() => {
        const onChange = (e: MediaQueryListEvent) => {
            setAppTheme(e.matches ? 'dark' : 'light');
        };

        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQueryList.addEventListener('change', onChange);

        return () => {
            mediaQueryList.removeEventListener('change', onChange);
        };
    }, [setAppTheme, appTheme]);

    const AppTheme = createTheme({
        overrides: {
            MuiCssBaseline: {
                '@global': {
                    a: {
                        color: appTheme == 'dark' ? 'dodgerBlue' : 'blue',
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
            type: appTheme == 'dark' ? 'dark' : 'light',
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
