import { createTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';
import { useEffect } from 'react';

import { DODGER_BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';

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
        main: DODGER_BLUE,
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
        breakpoints: {
            /**
             * Based on Tailwind's breakpoints.
             * @see https://tailwindcss.com/docs/screens
             */
            values: {
                xs: 640,
                sm: 768,
                md: 1024,
                lg: 1280,
                xl: 1536,
            },
        },
        palette: {
            type: appTheme == 'dark' ? 'dark' : 'light',
            ...(appTheme == 'dark' ? darkTheme : lightTheme),
        },
        spacing: 4,
    });

    return <ThemeProvider theme={AppTheme}>{props.children}</ThemeProvider>;
}
