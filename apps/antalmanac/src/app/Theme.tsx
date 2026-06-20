'use client';

import { BLUE, DARK_PAPER_BG, LIGHT_BLUE } from '$src/globals';
import { CssBaseline, type PaletteOptions } from '@mui/material';
import { createTheme, ThemeProvider, type ThemeVars } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const lightPalette: PaletteOptions = {
    primary: { main: BLUE, contrastText: '#fff' },
    secondary: { main: BLUE },
    settingsSegment: {
        border: '#d3d4d5',
        background: '#f8f9fa',
        hoverBackground: '#d3d4d5',
    },
    background: {
        default: '#f5f6fc',
        paper: '#fff',
        elevated: '#fff',
    },
    text: {
        primary: '#212529',
        secondary: '#606166',
    },
    error: {
        main: '#ce0000',
    },
    enrollmentStatus: {
        open: '#00c853',
        waitlist: '#ff9800',
        full: '#e53935',
    },
};

const darkPaperOverride = {
    background: DARK_PAPER_BG,
    backgroundColor: DARK_PAPER_BG,
    color: '#fff',
};

const darkPalette: PaletteOptions = {
    primary: { main: BLUE, contrastText: '#fff' },
    secondary: { main: LIGHT_BLUE },
    settingsSegment: {
        border: '#888888',
        background: '#333333',
        hoverBackground: '#424649',
    },
    background: {
        default: '#1E1E1E',
        paper: DARK_PAPER_BG,
        elevated: DARK_PAPER_BG,
    },
    text: {
        primary: '#fff',
        secondary: '#99999f',
    },
    error: {
        main: '#ff3333',
    },
    enrollmentStatus: {
        open: '#00c853',
        waitlist: '#f5c518',
        full: '#e53935',
    },
};

declare module '@mui/material/styles' {
    interface Theme {
        vars: ThemeVars;
    }

    interface BreakpointOverrides {
        xxs: true;
        default: true;
    }

    interface TypeBackground {
        elevated?: string;
    }

    interface Palette {
        settingsSegment: {
            border: string;
            background: string;
            hoverBackground: string;
        };
        enrollmentStatus: {
            open: string;
            waitlist: string;
            full: string;
        };
    }

    interface PaletteOptions {
        settingsSegment?: {
            border: string;
            background: string;
            hoverBackground: string;
        };
        enrollmentStatus?: {
            open: string;
            waitlist: string;
            full: string;
        };
    }
}

const appTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'class',
    },
    colorSchemes: {
        light: {
            palette: lightPalette,
        },
        dark: {
            palette: darkPalette,
        },
    },
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
        MuiLink: {
            defaultProps: {
                color: 'secondary',
            },
            styleOverrides: {
                root: ({ theme }) => [
                    {
                        color: BLUE,
                        ':visited': { color: LIGHT_BLUE },
                    },
                    theme.applyStyles('dark', {
                        color: LIGHT_BLUE,
                        ':visited': { color: LIGHT_BLUE },
                    }),
                ],
            },
        },
        // NB: https://github.com/mui/material-ui/issues/43683#issuecomment-2492787970
        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }) => [{ backgroundImage: 'none' }, theme.applyStyles('dark', darkPaperOverride)],
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
                paper: ({ theme }) => [{ backgroundImage: 'none' }, theme.applyStyles('dark', darkPaperOverride)],
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: ({ theme }) => [{ backgroundImage: 'none' }, theme.applyStyles('dark', darkPaperOverride)],
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
});

interface Props {
    children?: React.ReactNode;
}

export function AppThemeProvider(props: Props) {
    return (
        <ThemeProvider theme={appTheme} defaultMode="system" modeStorageKey="theme" disableTransitionOnChange>
            <CssBaseline />
            {props.children}
        </ThemeProvider>
    );
}
