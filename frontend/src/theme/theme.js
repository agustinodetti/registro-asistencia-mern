import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      //main: '#2f4352', -- Azul paleta ORIGINAL
      main: '#11334cff', // Azul oscuro
      
    },
    secondary: {
      //main: '#ffa395', -- Rosa paleta ORIGINAL
      main: '#fb6c52ff', // Rosa fuerte
    },
    terciary: {
      //main: '#f4eadb', -- Blanco paleta ORIGINAL
      main: '#f4eadb', // Blanco
    },
    quaternary: {
      //main: '#008468', -- Verde paleta ORIGINAL  
      main: '#005442ff', // Verde 
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  }
});

export default theme;
