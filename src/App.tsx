import { useEffect } from 'react';
import ReactGA4 from 'react-ga4';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { undoDelete } from '$lib/AppStoreActions';

import AppThemeProvider from './providers/Theme';
import AppQueryProvider from './providers/Query';

import Home from '$components/Home';
import ColorPicker from '$components/ColorPicker';

export default function App() {
  useEffect(() => {
    document.addEventListener('keydown', undoDelete, false);
    ReactGA4.initialize('G-30HVJXC2Y4');
    ReactGA4.send('pageview');
    return () => {
      document.removeEventListener('keydown', undoDelete, false);
    };
  }, []);

  return (
    <AppQueryProvider>
      <AppThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/color"
              element={<ColorPicker color="blue" sectionCode="123" isCustomEvent={false} analyticsCategory="nya" />}
            />
            <Route path="/feedback" element={<h1>feedback</h1>} />
          </Routes>
        </BrowserRouter>
      </AppThemeProvider>
    </AppQueryProvider>
  );
}
