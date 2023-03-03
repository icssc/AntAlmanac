import { useMemo } from 'react'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import useSettingsStore from '$stores/settings'

interface Props {
  children?: React.ReactNode
}

/**
 * wraps the app with a reactive MUI theme
 */
export default function AppThemeProvider({ children }: Props) {
  const isDarkMode = useSettingsStore((store) => store.isDarkMode)
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: '#bf3636',
            light: '#f76860',
            dark: '#880010',
            contrastText: '#fff',
          },
          secondary: {
            main: '#da9a0e',
            light: '#ffffca',
            dark: '#bea26a',
            contrastText: '#000',
          },
        },
      }),
    [isDarkMode]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

AppThemeProvider.defaultProps = {
  children: null,
}
