import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { MantineProvider, ColorSchemeProvider, ColorScheme, Button } from '@mantine/core';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import reportWebVitals from './reportWebVitals.ts';

const RootComponent: React.FC = () => {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <App />
        <Button
        variant="subtle"
          onClick={() => toggleColorScheme()}
          style={{ top: '20px', left: '0px' }}
        >
          Toggle Theme
        </Button>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);

reportWebVitals();
