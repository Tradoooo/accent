import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { enregistrerServiceWorker } from './pwa';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import './index.css';

const conteneur = document.getElementById('root');
if (!conteneur) throw new Error('#root absent');

createRoot(conteneur).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA (RNF-08) : échec silencieux, l'app fonctionne parfaitement sans SW.
void enregistrerServiceWorker();
