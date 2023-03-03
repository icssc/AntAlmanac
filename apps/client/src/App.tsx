import AppThemeProvider from '$providers/Theme'
import AppQueryProvider from '$providers/Query'
import Header from '$components/Header'
import NewsForm from '$components/forms/News'
import DeleteNewsButton from '$components/buttons/DeleteNews'

export default function App() {
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <Header />
        <NewsForm />
        <DeleteNewsButton />
      </AppThemeProvider>
    </AppQueryProvider>
  )
}
