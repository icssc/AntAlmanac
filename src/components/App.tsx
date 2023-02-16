import { PureComponent } from 'react';
import ReactGA4 from 'react-ga4';
import { BrowserRouter, Route,Routes } from 'react-router-dom';
import { undoDelete } from '../actions/AppStoreActions';
import { isDarkMode } from '../helpers';
import Home from './Home';

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
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/feedback"
                        element={() => window.location.replace('https://forms.gle/k81f2aNdpdQYeKK8A')}
                    />
                </Routes>
            </BrowserRouter>
        );
    }
}

export default App;
