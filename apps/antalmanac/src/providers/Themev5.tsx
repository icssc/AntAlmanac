import { createTheme, CssBaseline, ThemeProvider, type PaletteOptions } from '@mui/material';
import { useEffect, useMemo } from 'react';

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

    const AppTheme = useMemo(
        () =>
            createTheme({
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            a: {
                                color: appTheme === 'dark' ? 'dodgerblue' : 'blue',
                            },
                        },
                    },
                    // https://github.com/mui/material-ui/issues/43683#issuecomment-2492787970
                    MuiDialog: {
                        styleOverrides: {
                            paper: {
                                backgroundImage: 'none',
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
                    mode: appTheme == 'dark' ? 'dark' : 'light',
                    ...(appTheme == 'dark' ? darkTheme : lightTheme),
                },
            }),
        [appTheme]
    );

    return (
        <ThemeProvider theme={AppTheme}>
            <CssBaseline />
            {props.children}
        </ThemeProvider>
    );
}
