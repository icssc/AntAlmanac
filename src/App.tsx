import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useGoogleAnalytics from '$hooks/useGoogleAnalytics';

import AppThemeProvider from './providers/Theme';
import AppQueryProvider from './providers/Query';

import Home from '$components/Home';

export default function App() {
  useGoogleAnalytics();
  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feedback" element={<h1>feedback</h1>} />
          </Routes>
        </BrowserRouter>
      </AppThemeProvider>
    </AppQueryProvider>
  );
}
