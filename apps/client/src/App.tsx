import AppThemeProvider from '$providers/Theme'
import AppQueryProvider from '$providers/Query'
import Header from '$components/Header'
import Home from '$routes/Home'

export default function App() {
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <Header />
        <Home />
      </AppThemeProvider>
    </AppQueryProvider>
  )
}
