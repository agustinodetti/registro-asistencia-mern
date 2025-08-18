import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { locationService } from '../../services/locationService';
import UserBar from '../../components/UserBar';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '20',
    isActive: true
  });

  // Cargar ubicaciones
  const fetchLocations = async () => {
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (err) {
      setError('Error al cargar ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Abrir diálogo para crear/editar
  const handleOpenDialog = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        radius: location.radius.toString(),
        isActive: location.isActive
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        radius: '20',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius: '20',
      isActive: true
    });
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Guardar ubicación
  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseFloat(formData.radius)
      };

      if (editingLocation) {
        await locationService.updateLocation(editingLocation._id, data);
      } else {
        await locationService.createLocation(data);
      }

      handleCloseDialog();
      fetchLocations();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar ubicación');
    }
  };

  // Eliminar ubicación
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) {
      return;
    }

    try {
      await locationService.deleteLocation(id);
      fetchLocations();
      setError('');
    } catch (err) {
      setError('Error al eliminar ubicación');
    }
  };

  // Obtener ubicación actual del navegador
  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude.toFixed(8),
        longitude: location.longitude.toFixed(8)
      }));
      setError('');
    } catch (error) {
      setError('Error al obtener ubicación actual: ' + error.message);
    }
  };

  return (
    <>
      <UserBar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Gestión de Ubicaciones
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nueva Ubicación
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Latitud</TableCell>
                  <TableCell>Longitud</TableCell>
                  <TableCell>Radio (m)</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {location.name}
                      </Box>
                    </TableCell>
                    <TableCell>{location.latitude}</TableCell>
                    <TableCell>{location.longitude}</TableCell>
                    <TableCell>{location.radius}</TableCell>
                    <TableCell>
                      <Chip
                        label={location.isActive ? 'Activa' : 'Inactiva'}
                        color={location.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(location)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(location._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Diálogo para crear/editar ubicación */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre de la ubicación"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              margin="normal"
              required
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Latitud"
                type="number"
                value={formData.latitude}
                onChange={(e) => handleFormChange('latitude', e.target.value)}
                required
                inputProps={{ step: 'any' }}
              />
              <TextField
                fullWidth
                label="Longitud"
                type="number"
                value={formData.longitude}
                onChange={(e) => handleFormChange('longitude', e.target.value)}
                required
                inputProps={{ step: 'any' }}
              />
            </Box>
            <Button
              variant="outlined"
              startIcon={<LocationIcon />}
              onClick={getCurrentLocation}
              sx={{ mt: 2 }}
            >
              Obtener ubicación actual
            </Button>
            <TextField
              fullWidth
              label="Radio permitido (metros)"
              type="number"
              value={formData.radius}
              onChange={(e) => handleFormChange('radius', e.target.value)}
              margin="normal"
              required
              inputProps={{ min: 1, max: 10000 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleFormChange('isActive', e.target.checked)}
                />
              }
              label="Ubicación activa"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained">
              {editingLocation ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Locations;
