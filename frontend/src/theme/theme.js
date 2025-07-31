import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#072e54ff', // Azul oscuro
    },
    secondary: {
      main: '#b4195aff', // Rosa fuerte
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
