import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';
import UserBar from '../components/UserBar';


const Profile = () => {
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar datos actuales del usuario
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { 'x-auth-token': token }
      });
      setForm({
        email: res.data.email,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        password: ''
      });
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/profile', {
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password ? form.password : undefined
      }, {
        headers: { 'x-auth-token': token }
      });
      setSuccess('Perfil actualizado correctamente');
      setForm({ ...form, password: '' });
    } catch (err) {
      setError('Error al actualizar perfil');
    }
  };

  return (

    <>
      {/* Menú de navegación */}
      <UserBar />
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Editar Perfil</Typography>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="email"
              value={form.email}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Nombre"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Apellido"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Nueva Contraseña"
              name="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="password"
              inputProps={{ minLength: 6 }}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Guardar Cambios
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default Profile;