import { render } from 'react-dom';
import App from './App';
import { unregister } from './registerServiceWorker';

render(<App />, document.getElementById('root'));

unregister();
