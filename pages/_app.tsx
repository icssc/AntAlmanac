import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import '$components/Calendar/Calendar.css'

import dynamic from 'next/dynamic'
import type { AppProps } from 'next/app'
const SnackbarProvider = dynamic(async () => (await import('notistack')).SnackbarProvider, { ssr: false })
const AppThemeProvider = dynamic(() => import('$providers/Theme'), { ssr: false })
const AppQueryProvider = dynamic(() => import('$providers/Query'), { ssr: false })
const Header = dynamic(() => import('$components/Header'), { ssr: false })
const ActionsBar = dynamic(() => import('$components/ActionsBar'), { ssr: false })

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <SnackbarProvider>
          <Header />
          <ActionsBar />
          <Component {...pageProps} />
        </SnackbarProvider>
      </AppThemeProvider>
    </AppQueryProvider>
  )
}
