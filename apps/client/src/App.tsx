import AppThemeProvider from '$providers/Theme'
import AppQueryProvider from '$providers/Query'
import Header from '$components/Header'
import { Button } from '@mui/material'

export default function App() {
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <Header />
        <Button variant="contained">Hello, World!</Button>
      </AppThemeProvider>
    </AppQueryProvider>
  )
}
