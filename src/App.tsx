import { SnackbarProvider } from 'notistack';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppThemeProvider from '$providers/Theme';
import AppQueryProvider from '$providers/Query';
import useGoogleAnalytics from '$hooks/useGoogleAnalytics';
import Home from '$routes/Home';
import Feedback from '$routes/Feedback';
import Header from '$components/Header';
import ActionsBar from '$components/ActionsBar';

/**
 * renders the entire single page application
 */
export default function App() {
  useGoogleAnalytics();
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <SnackbarProvider>
          <Header />
          <ActionsBar />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/feedback" element={<Feedback />} />
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </AppThemeProvider>
    </AppQueryProvider>
  );
}
