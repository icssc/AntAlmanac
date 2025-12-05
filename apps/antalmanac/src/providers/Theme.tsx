import { createTheme, CssBaseline, ThemeProvider, type PaletteOptions } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useMemo } from 'react';

import { BLUE, DODGER_BLUE } from '$src/globals';
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
    }, [setAppTheme]);

    const AppTheme = useMemo(
        () =>
            createTheme({
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
                                color: appTheme === 'dark' ? DODGER_BLUE : BLUE,
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
                                backgroundColor: appTheme === 'dark' ? '#fff4e5ff' : '#FFEA99',
                                color: appTheme === 'dark' ? '#856404ff' : '#302800ff',
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
                        sm: 768,
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
        <ThemeProvider theme={AppTheme}>
            <CssBaseline />
            {props.children}
        </ThemeProvider>
    );
}
