import { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import { useAppStore } from '$lib/stores/global';

interface Props {
  children: React.ReactNode;
}

export default function AppThemeProvider({ children }: Props) {
  /**
   * only get the state variables needed
   */
  const [appTheme, setTheme] = useAppStore((state) => [state.theme, state.setTheme]);

  /**
   * dark mode reacts to the store's theme
   */
  const darkMode = useAppStore((state) =>
    state.theme === 'dark'
      ? true
      : state.theme === 'light'
      ? false
      : window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  /**
   * set the store's theme when the media query changes
   */
  function handleMediaChange(e: MediaQueryListEvent) {
    if (appTheme === 'auto') {
      setTheme(e.matches ? 'dark' : 'light');
    }
  }

  /**
   * setup the media query listeners and return a function to remove them
   */
  useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleMediaChange);
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleMediaChange);
    };
  }, []);

  /**
   * theme changes based on global App state
   */
  const theme = createTheme({
    typography: {
      htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10),
      fontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
    },
    palette: {
      ...(darkMode
        ? {
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

            button: {
              main: '#FFF',
            },
          }
        : {
            mode: 'light',
            primary: {
              main: '#305db7',
              contrastText: '#fff',
            },
            secondary: {
              main: '#00F',
              contrastText: '#000',
            },
            button: {
              main: 'rgba(0, 0, 0, 0.23)',
            },
          }),
    },
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
