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
  Alert
} from '@mui/material';
import { 
  CheckCircle as CheckIcon,
  HighlightOff as CrossIcon,
  AccessTime as ClockIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Obtener historial de asistencia
  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/attendance/history', {
        headers: { 'x-auth-token': token }
      });
      setRecords(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      setError('Error al cargar historial');
    }
  };

  // Registrar asistencia
  const handleAttendance = async (type) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/attendance/register',
        { type, notes },
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

  // Cargar registros al inicio
  useEffect(() => {
    fetchRecords();
  }, []);

  // Formatear fecha
  const formatDate = (date) => {
    return format(new Date(date), "PPPpp", { locale: es });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Registro de Asistencia
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<CheckIcon />}
          onClick={() => handleAttendance('in')}
          disabled={loading}
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
          disabled={loading}
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
                      record.notes && (
                        <Typography variant="body2" color="textSecondary">
                          Nota: {record.notes}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
                {index < records.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Attendance;