import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  People as UsersIcon,
  Today as AttendanceIcon,
  Add as AddIcon,
  Search as SearchIcon,
  BarChart as StatsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar } from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
  totalUsers: 0,
  presentToday: 0,
  lateToday: 0,
  absentToday: 0
  });
  const [users, setUsers] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subRoles, setSubRoles] = useState([]);
  

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchUsers();
    fetchStats();
    const fetchAttendance = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/attendance', {
        headers: { 'x-auth-token': token }
      });
      setAttendanceRecords(res.data);
    };
    fetchAttendance();
    const fetchSubRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/subroles', {
          headers: { 'x-auth-token': token }
        });
        setSubRoles(res.data);
      } catch (err) {
        // Manejo de error opcional
      }
    };
    fetchSubRoles();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const [users, stats] = await Promise.all([
        adminService.getUsers(token),
        adminService.getStats(token)
      ]);
      
      setUsers(users);
      setStats(stats);
      } 
    catch (error) {
      setError(error.message);
      }
  };

  // Datos de ejemplo para gráficos (reemplazar con datos reales)
  const attendanceData = {
    totalEmployees: 24,
    presentToday: 18,
    lateToday: 3,
    absentToday: 3,
    monthlyAttendance: [85, 92, 78, 95, 87, 90] // % por mes
  };

  // Obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { 'x-auth-token': token }
      });
      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas de asistencia
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { 'x-auth-token': token }
      });
      setAttendanceStats(res.data);
    } catch (err) {
      setError('Error al cargar estadísticas');
    }
  };

  // Crear/editar usuario
  const handleUserSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = currentUser?._id 
        ? `http://localhost:5000/api/admin/users/${currentUser._id}`
        : 'http://localhost:5000/api/admin/users';
      
      const method = currentUser?._id ? 'put' : 'post';

      // Incluye los nuevos campos
      const userData = {
        email: currentUser.email,
        password: currentUser.password,
        role: currentUser.role,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        subRole: currentUser.subRole
      };
      
      await axios[method](url, userData, {
        headers: { 'x-auth-token': token }
      });
      
      fetchUsers();
      setOpenDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  // Eliminar usuario
  const handleDelete = async (user) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${user}`, {
        headers: { 'x-auth-token': token }
      });
      fetchUsers();
    } catch (err) {
      setError('Error al eliminar usuario');
    }
  };

  const filteredAttendance = attendanceRecords.filter(record => {
    const recordDate = new Date(record.timestamp || record.createdAt);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;

    if (from && recordDate < from) return false;
    if (to && recordDate > to) return false;
    return true;
  });

  // Filtrar usuarios
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Exportar a Excel
  const exportToExcel = () => {
    // Usa filteredAttendance si quieres exportar solo los filtrados
    const data = filteredAttendance.map(record => ({
      Usuario: record.user
        ? `${record.user.firstName || ''} ${record.user.lastName || ''}`.trim() || 'Sin nombre'
        : 'Sin usuario',
      Tipo: record.type,
      Notas: record.notes,
      Fecha: new Date(record.timestamp || record.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'registros_asistencia.xlsx');
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Button color="inherit" component={Link} to="/admin/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/admin/users">
            Usuarios
          </Button>
          <Button color="inherit" component={Link} to="/admin/subroles">
            SubRoles
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Panel de Administración
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Estadísticas Rápidas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <UsersIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Usuarios</Typography>
                    <Typography variant="h4">{attendanceData.totalEmployees}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AttendanceIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Presentes Hoy</Typography>
                    <Typography variant="h4">{attendanceData.presentToday}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AttendanceIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Tardanzas Hoy</Typography>
                    <Typography variant="h4">{attendanceData.lateToday}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AttendanceIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Ausentes Hoy</Typography>
                    <Typography variant="h4">{attendanceData.absentToday}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Barra de búsqueda y acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <TextField
            variant="outlined"
            placeholder="Buscar usuarios..."
            size="small"
            InputProps={{ startAdornment: <SearchIcon /> }}
            sx={{ width: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setCurrentUser({ email: '', password: '', role: 'employee' });
              setOpenDialog(true);
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>

        {/* Tabla de usuarios */}
        <Paper elevation={3} sx={{ p: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>SubRol</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Último Acceso</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell>
                        {user.subRole?.description
                          ? `${user.subRole.description} ($${user.subRole.price}/h)`
                          : 'Sin subRol'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? format(new Date(user.lastLogin), 'PPPpp', { locale: es })
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setCurrentUser(user);
                            setOpenDialog(true);
                          }}
                          sx={{ mr: 1 }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          color="error"
                          onClick={() => handleDelete(user._id)}
                          disabled={user.role === 'admin'}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Tabla de registros de asistencia */}
        <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Registros de Asistencia
          </Typography>
          {/* <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box> */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Desde"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hasta"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" color="success" onClick={exportToExcel}>
              Exportar a Excel
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      {record.user
                        ? `${record.user.firstName || ''} ${record.user.lastName || ''}`.trim() || 'Sin nombre'
                        : 'Sin usuario'}
                    </TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>{record.notes}</TableCell>
                    <TableCell>
                      {record.timestamp
                        ? new Date(record.timestamp).toLocaleString()
                        : (record.createdAt ? new Date(record.createdAt).toLocaleString() : 'Sin fecha')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Estadísticas Mensuales
      </Typography>
      <Paper elevation={3} sx={{ p: 3, height: 300 }}>
        <Box display="flex" alignItems="flex-end" height="100%">
          {attendanceData.monthlyAttendance.map((value, index) => (
            <Box
              key={index}
              sx={{
                width: 40,
                height: `${value}%`,
                bgcolor: 'primary.main',
                mx: 0.5,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              {value}%
            </Box>
          ))}
        </Box>
      </Paper> */}

        {/* Diálogo para editar/crear usuario */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            {currentUser?._id ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 400, pt: 1 }}>
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={currentUser?.email || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
              />
              <TextField
                fullWidth
                label="Nombre"
                margin="normal"
                value={currentUser?.firstName || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Apellido"
                margin="normal"
                value={currentUser?.lastName || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                margin="normal"
                value={currentUser?.password || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Rol</InputLabel>
                <Select
                  value={currentUser?.role || 'employee'}
                  label="Rol"
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                >
                  <MenuItem value="employee">Empleado</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>SubRol</InputLabel>
                <Select
                  value={currentUser?.subRole || ''}
                  label="SubRol"
                  onChange={(e) => setCurrentUser({ ...currentUser, subRole: e.target.value })}
                >
                  {subRoles.map((sr) => (
                    <MenuItem key={sr._id} value={sr._id}>
                      {sr.description} - ${sr.price}/hora
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={handleUserSubmit} variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminDashboard;