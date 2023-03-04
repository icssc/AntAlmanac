import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppThemeProvider from '$providers/Theme'
import AppQueryProvider from '$providers/Query'
import Header from '$components/Header'
import Home from '$routes/Home'
import { loadSchedule } from '$stores/schedule/load'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
])

export default function App() {
  loadSchedule('rem')
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <Header />
        <RouterProvider router={router} />
      </AppThemeProvider>
    </AppQueryProvider>
  )
}
