import { useMemo } from 'react'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'

interface Props {
  children?: React.ReactNode
}

/**
 * wraps the app with a reactive MUI theme
 */
export default function AppThemeProvider({ children }: Props) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: '#bf3636',
            light: '#f76860',
            dark: '#880010',
            contrastText: '#fff',
          },
          secondary: {
            main: '#f2d399',
            light: '#ffffca',
            dark: '#bea26a',
            contrastText: '#000',
          },
        },
      }),
    []
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
