import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Cambia este color
    },
    shape: {
      borderRadius: 8 // Bordes más redondeados
    },
    success: {
      main: '#2e7d32', // Verde para ingresos
    },
    error: {
      main: '#d32f2f', // Rojo para salidas
    }
  }
});

export default theme;