import { SnackbarProvider } from 'notistack';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppThemeProvider from '$providers/Theme';
import AppQueryProvider from '$providers/Query';
import useGoogleAnalytics from '$hooks/useGoogleAnalytics';
import Home from '$routes/Home';
import Feedback from '$routes/feedback';

export default function App() {
  useGoogleAnalytics();
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <SnackbarProvider>
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