import { useEffect } from 'react'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import type { ThemeOptions } from '@mui/material'
import { useSettingsStore } from '$stores/settings'

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
}

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
}

/**
 * wraps the app with a reactive MUI theme
 */
export default function AppThemeProvider(props: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme, isDarkMode } = useSettingsStore()

  /**
   * set the store's theme when the media query changes
   */
  function handleChange(e: MediaQueryListEvent) {
    if (colorScheme === 'auto') {
      setColorScheme(e.matches ? 'dark' : 'light')
    }
  }

  /**
   * setup the media query listeners and return a function to remove them
   */
  useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleChange)
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleChange)
    }
  }, [])

  /**
   * create theme that reacts to the settings store
   */
  const theme = createTheme({
    palette: { ...(isDarkMode() ? darkPalette : lightPalette) },
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
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  )
}
