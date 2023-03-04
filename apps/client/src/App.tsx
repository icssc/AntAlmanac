import AppThemeProvider from '$providers/Theme'
import AppQueryProvider from '$providers/Query'
import Header from '$components/Header'
import Home from '$routes/Home'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

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
        <Header />
        <RouterProvider router={router} />
      </AppThemeProvider>
    </AppQueryProvider>
  )
}
