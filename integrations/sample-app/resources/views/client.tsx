import { hydrateRoot } from 'react-dom/client';
import App from './pages/home.js';
import { BrowserRouter } from 'react-router-dom';

hydrateRoot(
  document.getElementById('root'),
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
