import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme'; // Asegúrate de tener este archivo

// Obtén el contenedor raíz
const container = document.getElementById('root');

// Crea una raíz
const root = createRoot(container);

// Renderiza la app
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
