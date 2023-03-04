import AppThemeProvider from '$providers/Theme'
import AppQueryProvider from '$providers/Query'
import Header from '$components/Header'
import NotificationsForm from '$components/forms/Notifications'
import NewsForm from '$components/forms/News'
import DeleteNewsButton from '$components/buttons/DeleteNews'
import Home from '$routes/Home'

export default function App() {
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <Header />
        <NotificationsForm />
        <NewsForm />
        <DeleteNewsButton />
        <Home />
      </AppThemeProvider>
    </AppQueryProvider>
  )
}
