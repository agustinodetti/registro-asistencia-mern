import React, { useState } from 'react';
import { 
  Container,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { HowToReg as RegisterIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

 const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Siempre enviar rol: 'employee'
    const data = { ...formData, role: 'employee' };
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', data);
      
      if (response.data.token) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000); // Redirige después de 2 segundos
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <RegisterIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Crear Cuenta
        </Typography>

        {success && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            ¡Registro exitoso! Redirigiendo...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="Nombre"
            name="firstName"
            autoComplete="firstName"
            autoFocus
            value={formData.firstName}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Apellido"
            name="lastName"
            autoComplete="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            inputProps={{ minLength: 6 }}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
          <Box textAlign="center">
            <Link href="/login" variant="body2">
              ¿Ya tienes cuenta? Inicia Sesión
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;