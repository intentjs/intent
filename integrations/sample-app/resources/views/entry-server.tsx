import { renderToString } from 'react-dom/server';
import App from './pages/home.js';
import { StaticRouter } from 'react-router-dom';

export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}
