import React, { useState } from 'react';
import { Button, Typography, Box, Alert, Paper } from '@mui/material';
import { MyLocation as LocationIcon } from '@mui/icons-material';

const LocationTest = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLocation = () => {
    setLoading(true);
    setError(null);
    setLocation(null);

    if (!navigator.geolocation) {
      setError('Geolocalización no soportada en este navegador');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Ubicación obtenida:', position);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error de geolocalización:', error);
        setError(`Error: ${error.message} (Código: ${error.code})`);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Prueba de Geolocalización
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Protocolo: {window.location.protocol}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Contexto seguro: {window.isSecureContext ? 'Sí' : 'No'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Geolocalización soportada: {navigator.geolocation ? 'Sí' : 'No'}
        </Typography>
      </Box>

      <Button
        variant="contained"
        onClick={testLocation}
        disabled={loading}
        startIcon={<LocationIcon />}
        sx={{ mb: 2 }}
      >
        {loading ? 'Obteniendo ubicación...' : 'Probar Geolocalización'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {location && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Ubicación obtenida:</strong><br />
            Latitud: {location.latitude}<br />
            Longitud: {location.longitude}<br />
            Precisión: {location.accuracy} metros
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default LocationTest;
