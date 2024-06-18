import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { MantineProvider } from '@mantine/core';
import reportWebVitals from './reportWebVitals.ts';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'light' }}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);

reportWebVitals();


