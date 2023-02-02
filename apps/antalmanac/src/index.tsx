import { SnackbarProvider } from 'notistack'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material'
import { unregister } from './serviceWorker'
import App from '$components/App'

/**
 * global theme
 */
const theme = createTheme({
    typography: {
        htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10),
        fontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
    },
    palette: {
        // type: 'dark',
        primary: {
            light: '#5191d6',
            main: '#0064a4',
            dark: '#003a75',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ffff52',
            main: '#ffd200',
            dark: '#c7a100',
            contrastText: '#000',
        },
    },
    spacing: 4,
});

/**
 * hydrate the index.html
 */
createRoot(document.getElementById('app') as HTMLElement).render(
  <StrictMode>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
            <App />
        </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>
)

/**
 * does something with service workers
 */
unregister()
