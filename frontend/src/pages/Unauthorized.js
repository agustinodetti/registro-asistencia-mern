import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div>
    <Typography variant="h4">Acceso denegado</Typography>
    <Button component={Link} to="/" variant="contained">
      Volver al inicio
    </Button>
  </div>
);

export default Unauthorized;