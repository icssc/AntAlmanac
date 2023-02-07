import { useEffect } from 'react';
import ReactGA4 from 'react-ga4';

export default function useGoogleAnalytics() {
  useEffect(() => {
    ReactGA4.initialize('G-30HVJXC2Y4');
    ReactGA4.send('pageview');
  }, []);
}
