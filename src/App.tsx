/**
 * import all stylesheets here for the Vite React app
 * so that the rest of the app is compatible with NextJS
 */
import 'leaflet/dist/leaflet.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
import '$components/Calendar/Calendar.css'
import '$components/Map/Map.css'

import { SnackbarProvider } from 'notistack'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppThemeProvider from '$providers/Theme'
import AppQueryProvider from '$providers/Query'
import useGoogleAnalytics from '$hooks/useGoogleAnalytics'
import useUnsavedChanges from '$hooks/useUnsavedChanges'
import useHotkeys from '$hooks/useHotkeys'
import Home from '$routes/Home'
import Feedback from '$routes/Feedback'
import Header from '$components/Header'

/**
 * the single page application
 */
export default function App() {
  useGoogleAnalytics()
  useHotkeys()
  useUnsavedChanges()
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <SnackbarProvider>
          <Header />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/feedback" element={<Feedback />} />
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </AppThemeProvider>
    </AppQueryProvider>
  )
}
