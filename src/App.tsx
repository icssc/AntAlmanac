import { PureComponent } from 'react';
import { BrowserRouter, Route,Routes } from 'react-router-dom';
import ReactGA4 from 'react-ga4';
import { undoDelete } from './actions/AppStoreActions';
import { isDarkMode } from './helpers';
import Home from './components/Home';
import AppThemeProvider from './providers/Theme'

class App extends PureComponent {
    state = {
        darkMode: isDarkMode(),
    };

    componentDidMount = () => {
        document.addEventListener('keydown', undoDelete, false);
        ReactGA4.initialize('G-30HVJXC2Y4');
        ReactGA4.send('pageview');
    };

    componentWillUnmount() {
        document.removeEventListener('keydown', undoDelete, false);
    }

    render() {
        return (
            <AppThemeProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/feedback"
                            element={() => window.location.replace('https://forms.gle/k81f2aNdpdQYeKK8A')}
                        />
                    </Routes>
                </BrowserRouter>
            </AppThemeProvider>
        );
    }
}

export default App;
