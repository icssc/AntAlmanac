'use client';

import { CssBaseline, type PaletteOptions } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Roboto } from 'next/font/google';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useMemo } from 'react';

import { BLUE, LIGHT_BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const lightTheme: PaletteOptions = {
    primary: { main: BLUE }, // #305db7
    secondary: { main: BLUE },
    background: {
        default: '#f5f6fc',
        paper: '#fff',
    },
    text: {
        primary: '#212529',
        secondary: '#606166',
    },
    error: {
        main: '#ce0000',
    },
};

const darkTheme: PaletteOptions = {
    primary: { main: BLUE }, // #305db7
    secondary: { main: LIGHT_BLUE },
    background: {
        default: '#1E1E1E',
        paper: '#1E1E1E',
    },
    text: {
        primary: '#fff',
        secondary: '#99999f',
    },
    error: {
        main: '#ff3333',
    },
};

interface Props {
    children?: React.ReactNode;
}

declare module '@mui/material/styles' {
    interface BreakpointOverrides {
        xxs: true;
        default: true;
    }
}

/**
 * sets and provides the MUI theme for the app
 */
export default function AppThemeProvider(props: Props) {
    const [appTheme, setAppTheme] = useThemeStore((store) => [store.appTheme, store.setAppTheme]);
    const postHog = usePostHog();

    useEffect(() => {
        const onChange = (e: MediaQueryListEvent) => {
            setAppTheme(e.matches ? 'dark' : 'light', postHog);
        };

        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQueryList.addEventListener('change', onChange);

        return () => {
            mediaQueryList.removeEventListener('change', onChange);
        };
    }, [setAppTheme, postHog]);

    const theme = useMemo(
        () =>
            createTheme({
                typography: {
                    fontFamily: roboto.style.fontFamily,
                },
                components: {
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: ({ ownerState }) => ({
                                ...(ownerState.variant === 'contained' &&
                                    ownerState.color === 'primary' && {
                                        backgroundColor: BLUE,
                                        ':hover': {
                                            backgroundColor: '#003A75',
                                        },
                                    }),
                                ...(ownerState.variant === 'contained' &&
                                    ownerState.color === 'secondary' && {
                                        backgroundColor: '#E0E0E0',
                                        color: '#212529',
                                        ':hover': {
                                            backgroundColor: '#D5D5D5',
                                        },
                                    }),
                            }),
                        },
                    },
                    MuiCssBaseline: {
                        styleOverrides: {
                            a: {
                                color: appTheme === 'dark' ? LIGHT_BLUE : BLUE,
                            },
                        },
                    },
                    // NB: https://github.com/mui/material-ui/issues/43683#issuecomment-2492787970
                    MuiDialog: {
                        styleOverrides: {
                            paper: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiInputLabel: {
                        defaultProps: {
                            variant: 'standard',
                        },
                    },
                    MuiPopover: {
                        styleOverrides: {
                            paper: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiSelect: {
                        defaultProps: {
                            variant: 'standard',
                        },
                    },
                    MuiTextField: {
                        defaultProps: {
                            variant: 'standard',
                        },
                    },
                    MuiAlert: {
                        styleOverrides: {
                            standardWarning: {
                                backgroundColor: '#FFEA99',
                                color: '#302800ff',
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
                        default: 0,
                        xxs: 400,
                        xs: 640,
                        sm: 800,
                        md: 1024,
                        lg: 1280,
                        xl: 1536,
                    },
                },
                palette: {
                    mode: appTheme === 'dark' ? 'dark' : 'light',
                    ...(appTheme === 'dark' ? darkTheme : lightTheme),
                },
            }),
        [appTheme]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {props.children}
        </ThemeProvider>
    );
}
