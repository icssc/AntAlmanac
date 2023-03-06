import { useMemo } from 'react'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import type { PaletteOptions } from '@mui/material'
import useSettingsStore from '$stores/settings'

const lightTheme: PaletteOptions = {
  primary: {
    main: '#BF3636',
  },
  secondary: {
    main: '#BF7154',
  },
  background: {
    default: '#fafafa',
    paper: '#fff',
  },
}

const darkTheme: PaletteOptions = {
  primary: {
    main: '#BF3636',
  },
  secondary: {
    main: '#BF7154',
  },
  background: {
    default: '#303030',
    paper: '#424242',
  },
}

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
          ...(isDarkMode ? darkTheme : lightTheme),
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
