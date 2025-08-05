import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#072e54ff', // Azul oscuro
    },
    secondary: {
      main: '#b4195aff', // Rosa fuerte
    },
    terciary: {
      main: '#ffffffff', // Blanco
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  customBackground: {
    login: '#2b1f61ff',   
  }
});

export default theme;
