import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';
import { pingBackendSilently } from './lib/wakeUpService';

// Automatically register the PWA service worker
registerSW({ immediate: true });

// Silently wake up cloud services immediately upon app load
pingBackendSilently();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element in index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

