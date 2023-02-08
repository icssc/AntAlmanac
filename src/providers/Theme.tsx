import { useEffect } from 'react';
import { createTheme, ThemeProvider, ThemeOptions } from '@mui/material';
import { useSettingsStore } from '$lib/stores/settings';

/**
 * dark color palette
 */
const darkPalette: ThemeOptions['palette'] = {
  mode: 'dark',
  primary: {
    main: '#1E90FF',
    contrastText: '#fff',
  },
  secondary: {
    main: '#1E90FF',
    contrastText: '#000',
  },
  background: {
    default: '#303030',
    paper: '#424242',
  },
  divider: '#AAA',
};

/**
 * light color palette
 */
const lightPalette: ThemeOptions['palette'] = {
  mode: 'light',
  primary: {
    main: '#305db7',
    contrastText: '#fff',
  },
  secondary: {
    main: '#00F',
    contrastText: '#000',
  },
};

interface Props {
  children: React.ReactNode;
}

/**
 * provides a reactive MUI theme to the app
 */
export default function AppThemeProvider({ children }: Props) {
  const { colorScheme, setColorScheme } = useSettingsStore();

  /**
   * dark mode reacts to the store's theme
   */
  const darkMode =
    colorScheme === 'dark'
      ? true
      : colorScheme === 'light'
      ? false
      : window.matchMedia('(prefers-color-scheme: dark)').matches;

  /**
   * set the store's theme when the media query changes
   */
  function handleChange(e: MediaQueryListEvent) {
    if (colorScheme === 'auto') {
      setColorScheme(e.matches ? 'dark' : 'light');
    }
  }

  /**
   * setup the media query listeners and return a function to remove them
   */
  useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleChange);
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleChange);
    };
  }, []);

  /**
   * theme changes based on global App state
   */
  const theme = createTheme({
    palette: { ...(darkMode ? darkPalette : lightPalette) },
    spacing: 4,
    components: {
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'unset' } }, // removes transparent gradient
      },
      MuiButton: {
        //change outlined button variant
        variants: [
          {
            props: { variant: 'outlined', color: 'primary' },
            style: {
              color: darkMode ? '#FFF' : '#000',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              '&:hover': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
            },
          },
        ],
      },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
