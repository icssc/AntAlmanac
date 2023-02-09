import { useEffect } from 'react';
import { createTheme, ThemeProvider, ThemeOptions } from '@mui/material';
import { useSettingsStore } from '$stores/settings';

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

/**
 * provides a reactive MUI theme to the app
 */
export default function AppThemeProvider(props: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme, isDarkMode } = useSettingsStore();

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
   * theme reacts to the settings store
   */
  const theme = createTheme({
    palette: { ...(isDarkMode() ? darkPalette : lightPalette) },
    spacing: 4,
    components: {
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'unset' } }, // removes transparent gradient
      },
      MuiButton: {
        variants: [
          {
            props: { variant: 'outlined', color: 'primary' },
            style: {
              color: isDarkMode() ? '#FFF' : '#000',
              borderColor: isDarkMode() ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              '&:hover': {
                borderColor: isDarkMode() ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
            },
          },
        ],
      },
    },
  });

  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
}
