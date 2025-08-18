import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  CheckCircle as CheckIcon,
  HighlightOff as CrossIcon,
  AccessTime as ClockIcon,
  Notes as NotesIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { locationService } from '../../services/locationService';
import UserBar from '../../components/UserBar';
import LocationTest from '../../components/LocationTest';

const API_URL = process.env.REACT_APP_API_URL;
const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('checking'); // 'checking', 'allowed', 'denied', 'error'
  const [userLocation, setUserLocation] = useState(null);
  const [allowedLocation, setAllowedLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const navigate = useNavigate();

  // Obtener historial de asistencia
  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/attendance/history`, {
        headers: { 'x-auth-token': token }
      });
      setRecords(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      setError('Error al cargar historial');
    }
  };

  // Obtener ubicaciones permitidas
  const fetchAllowedLocations = async () => {
    try {
      const data = await locationService.getActiveLocations();
      if (data.length > 0) {
        setAllowedLocation(data[0]); // Usar la primera ubicación activa
      }
    } catch (err) {
      console.error('Error al obtener ubicaciones permitidas:', err);
    }
  };

  // Verificar si estamos en HTTPS (requerido para geolocalización en algunos navegadores)
  const isSecureContext = () => {
    return window.isSecureContext || window.location.protocol === 'https:';
  };

  // Solicitar permisos de ubicación
  const requestLocationPermission = async () => {
    console.log('📍 Iniciando solicitud de permisos de ubicación...');
    
    // Verificar contexto seguro
    if (!isSecureContext()) {
      console.warn('⚠️ No estamos en un contexto seguro (HTTPS). La geolocalización puede no funcionar.');
    }
    
    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
      console.error('❌ Geolocalización no soportada en este navegador');
      setError('Tu navegador no soporta geolocalización');
      setLocationStatus('error');
      return;
    }

    // Verificar el estado actual de los permisos
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log('📍 Estado de permisos:', permissionStatus.state);
        
        if (permissionStatus.state === 'denied') {
          console.log('❌ Permisos de ubicación denegados permanentemente');
          setError('Permisos de ubicación denegados. Por favor, habilita la ubicación en la configuración de tu navegador.');
          setLocationStatus('error');
          setLocationPermission('denied');
          return;
        }
      } catch (error) {
        console.log('⚠️ No se pudo verificar el estado de permisos:', error);
      }
    }

    try {
      console.log('📍 Solicitando ubicación actual...');
      const location = await locationService.getCurrentLocation();
      console.log('📍 Ubicación obtenida:', location);
      setUserLocation(location);
      setLocationPermission('granted');
      
      // Verificar si está dentro del radio permitido
      if (allowedLocation) {
        console.log('📍 Ubicación permitida configurada:', allowedLocation);
        const isWithin = locationService.isWithinRadius(
          location.latitude, 
          location.longitude,
          allowedLocation.latitude, 
          allowedLocation.longitude, 
          allowedLocation.radius
        );
        
        console.log('📍 ¿Está dentro del radio?', isWithin);
        
        if (isWithin) {
          setLocationStatus('allowed');
        } else {
          setLocationStatus('denied');
        }
      } else {
        // Si no hay ubicaciones permitidas configuradas, mostrar estado de verificación
        console.log('📍 No hay ubicaciones permitidas configuradas');
        setLocationStatus('checking');
        console.log('Ubicación obtenida pero no hay ubicaciones permitidas configuradas');
      }
    } catch (error) {
      console.error('❌ Error de geolocalización:', error);
      setLocationPermission('denied');
      setLocationStatus('error');
      
      if (error.code) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('❌ Permiso denegado por el usuario');
            setError('Permiso de ubicación denegado. Por favor, habilita la ubicación en tu navegador y recarga la página.');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('❌ Información de ubicación no disponible');
            setError('Información de ubicación no disponible. Verifica tu conexión GPS.');
            break;
          case error.TIMEOUT:
            console.log('❌ Tiempo de espera agotado');
            setError('Tiempo de espera agotado para obtener la ubicación. Intenta nuevamente.');
            break;
          default:
            console.log('❌ Error desconocido:', error.code);
            setError('Error al obtener la ubicación.');
        }
      } else {
        console.log('❌ Error sin código:', error.message);
        setError(error.message || 'Error al obtener la ubicación.');
      }
    }
  };

  // Registrar asistencia
  const handleAttendance = async (type) => {
    setLoading(true);
    setError('');
    
    try {
      // Si no tenemos ubicación, solicitarla
      if (!userLocation) {
        await requestLocationPermission();
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/attendance/register`,
        { 
          type, 
          notes,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        },
        { headers: { 'x-auth-token': token } }
      );
      
      setRecords([res.data, ...records.slice(0, 4)]);
      setNotes('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar asistencia');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al inicio
  useEffect(() => {
    console.log('🔄 Cargando página de asistencia...');
    
    const initializePage = async () => {
      try {
        await fetchRecords();
        await fetchAllowedLocations();
        
        // Solicitar permisos de ubicación después de un pequeño delay
        console.log('📍 Esperando 1 segundo antes de solicitar permisos...');
        setTimeout(() => {
          console.log('📍 Solicitando permisos de ubicación...');
          requestLocationPermission();
        }, 1000);
      } catch (error) {
        console.error('❌ Error al inicializar página:', error);
      }
    };

    initializePage();
  }, []);

  // Solicitar permisos cuando se carga el componente
  useEffect(() => {
    console.log('📍 useEffect - allowedLocation:', allowedLocation, 'userLocation:', userLocation);
    if (allowedLocation && userLocation) {
      // Si ya tenemos ubicación del usuario y ahora tenemos ubicaciones permitidas, verificar
      const isWithin = locationService.isWithinRadius(
        userLocation.latitude, 
        userLocation.longitude,
        allowedLocation.latitude, 
        allowedLocation.longitude, 
        allowedLocation.radius
      );
      
      console.log('📍 Verificando ubicación - isWithin:', isWithin);
      
      if (isWithin) {
        setLocationStatus('allowed');
      } else {
        setLocationStatus('denied');
      }
    }
  }, [allowedLocation, userLocation]);

  // Formatear fecha
  const formatDate = (date) => {
    return format(new Date(date), "PPPpp", { locale: es });
  };

  // Obtener color del indicador de ubicación
  const getLocationColor = () => {
    switch (locationStatus) {
      case 'allowed': return 'success';
      case 'denied': return 'error';
      case 'error': return 'warning';
      default: return 'info';
    }
  };

  // Obtener icono del indicador de ubicación
  const getLocationIcon = () => {
    switch (locationStatus) {
      case 'allowed': return <CheckIcon />;
      case 'denied': return <CrossIcon />;
      case 'error': return <WarningIcon />;
      default: return <MyLocationIcon />;
    }
  };

  // Obtener texto del indicador de ubicación
  const getLocationText = () => {
    switch (locationStatus) {
      case 'allowed': return 'Ubicación permitida';
      case 'denied': return 'Fuera del área permitida';
      case 'error': return 'Error de ubicación';
      case 'checking': 
        if (userLocation && !allowedLocation) {
          return 'Ubicación obtenida - Esperando configuración';
        }
        return 'Verificando ubicación...';
      default: return 'Verificando ubicación...';
    }
  };

  return (
    <>
      {/* Menú de navegación */}
      <UserBar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Registro de Asistencia
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!isSecureContext() && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Nota importante:</strong> Para que la geolocalización funcione correctamente, 
              es recomendable usar HTTPS. Si tienes problemas con los permisos de ubicación, 
              intenta acceder desde un navegador con HTTPS habilitado.
            </Typography>
          </Alert>
        )}

        {/* Indicador de ubicación */}
        <Card sx={{ mb: 3, border: 2, borderColor: `${getLocationColor()}.main` }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: `${getLocationColor()}.main` 
                }}>
                  {getLocationIcon()}
                </Box>
              </Grid>
              <Grid item xs>
                <Typography variant="h6" color={`${getLocationColor()}.main`}>
                  {getLocationText()}
                </Typography>
                {locationStatus === 'checking' && (
                  <Typography variant="body2" color="textSecondary">
                    {userLocation && !allowedLocation 
                      ? 'Tu ubicación ha sido obtenida. Contacta al administrador para configurar las ubicaciones permitidas.'
                      : 'Obteniendo tu ubicación...'
                    }
                  </Typography>
                )}
                {locationStatus === 'denied' && (
                  <Typography variant="body2" color="textSecondary">
                    Debes estar dentro del radio de 20 metros para registrar asistencia
                  </Typography>
                )}
              </Grid>
              {locationStatus === 'error' && (
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={requestLocationPermission}
                    startIcon={<MyLocationIcon />}
                    sx={{ mr: 1 }}
                  >
                    Habilitar Ubicación
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.location.reload()}
                  >
                    Recargar Página
                  </Button>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<CheckIcon />}
            onClick={() => handleAttendance('in')}
            disabled={loading || locationStatus !== 'allowed'}
            sx={{ flex: 1, py: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrar Ingreso'}
          </Button>

          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<CrossIcon />}
            onClick={() => handleAttendance('out')}
            disabled={loading || locationStatus !== 'allowed'}
            sx={{ flex: 1, py: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrar Salida'}
          </Button>
        </Box>

        <TextField
          fullWidth
          label="Notas (opcional)"
          variant="outlined"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          margin="normal"
          multiline
          rows={2}
          InputProps={{
            startAdornment: <NotesIcon color="action" sx={{ mr: 1 }} />
          }}
        />

        <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Historial Reciente
          </Typography>

          {records.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
              No hay registros de asistencia
            </Typography>
          ) : (
            <List>
              {records.map((record, index) => (
                <React.Fragment key={record._id}>
                  <ListItem>
                    <ListItemIcon>
                      {record.type === 'in' ? (
                        <CheckIcon color="success" />
                      ) : (
                        <CrossIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={record.type === 'in' ? 'INGRESO' : 'SALIDA'}
                            color={record.type === 'in' ? 'success' : 'error'}
                            size="small"
                          />
                          <Typography variant="body1">
                            {formatDate(record.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          {record.notes && (
                            <Typography variant="body2" color="textSecondary">
                              Nota: {record.notes}
                            </Typography>
                          )}
                          {record.userLocation && (
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              Ubicación registrada
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < records.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
        
        {/* Componente de prueba temporal */}
        <LocationTest />
      </Container>
    </>
  );
};

export default Attendance;