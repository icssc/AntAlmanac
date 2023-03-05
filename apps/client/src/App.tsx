import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import AppThemeProvider from '$providers/Theme'
import AppQueryProvider from '$providers/Query'
import Header from '$components/Header'
import Home from '$routes/Home'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
])

export default function App() {
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <SnackbarProvider>
          <Header />
          <RouterProvider router={router} />
        </SnackbarProvider>
      </AppThemeProvider>
    </AppQueryProvider>
  )
}
