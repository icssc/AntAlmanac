import { render } from 'react-dom';
import { SnackbarProvider } from 'notistack';
import Mui4ThemeProvider from './providers/Theme4';
import App from './components/App';
import { unregister } from './registerServiceWorker';

const rootElement = document.getElementById('root');

render(
    <Mui4ThemeProvider>
        <SnackbarProvider>
            <App />
        </SnackbarProvider>
    </Mui4ThemeProvider>,
    rootElement
);

unregister();
