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
  FormControl,
  Checkbox
} from '@mui/material';
import {
  People as UsersIcon,
  Today as AttendanceIcon,
  Add as AddIcon,
  Search as SearchIcon,
  BarChart as StatsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckBox as CheckBoxIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar } from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import UserBar from '../../components/UserBar';

const todayStr = new Date().toISOString().slice(0, 10);
const API_URL = process.env.REACT_APP_API_URL;

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
  const [openEditAttendance, setOpenEditAttendance] = useState(false);
  const [attendanceToEdit, setAttendanceToEdit] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  //const [startDate, setStartDate] = useState('');
  //const [endDate, setEndDate] = useState('');
  const [subRoles, setSubRoles] = useState([]);
  const [userFilter, setUserFilter] = useState('');
  const [attendanceUserFilter, setAttendanceUserFilter] = useState('');
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState('');
  //const [dateFilter, setDateFilter] = useState('');

  // Presetea los filtros de fecha con la fecha actual
  const [startDate, setStartDate] = useState(getLocalDateString(new Date()));         // Para "Registros de Asistencia"
  const [endDate, setEndDate] = useState('');                                         // Puedes dejar vacío o también preseteado
  const [dateFilter, setDateFilter] = useState(getLocalDateString(new Date()));       // Para "Tiempos de Asistencia por Usuario"
  const [dateFilterTo, setDateFilterTo] = useState(getLocalDateString(new Date()));   // Fecha hasta
  const [extraDaySelections, setExtraDaySelections] = useState({}); // Para manejar los checkboxes de día extra


  // Cargar datos al montar el componente
  useEffect(() => {
    fetchUsers();
    fetchStats();
    const fetchAttendance = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/attendance`, {
        headers: { 'x-auth-token': token }
      });
      setAttendanceRecords(res.data);
    };
    fetchAttendance();
    const fetchSubRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/subroles`, {
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
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    monthlyAttendance: [85, 92, 78, 95, 87, 90] // % por mes
  };

  // Obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/users`, {
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
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
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
        ? `${API_URL}/api/admin/users/${currentUser._id}`
        : `${API_URL}/api/admin/users`;

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
      await axios.delete(`${API_URL}/api/admin/users/${user}`, {
        headers: { 'x-auth-token': token }
      });
      fetchUsers();
    } catch (err) {
      setError('Error al eliminar usuario');
    }
  };

  const filteredAttendance = attendanceRecords.filter(record => {
    const recordDate = getLocalDateString(record.timestamp || record.createdAt);
    const from = startDate ? startDate : null;
    const to = endDate ? endDate : null;
    
    if (from && recordDate < from) return false;
    if (to && recordDate > to) return false;
    if (attendanceUserFilter && (record.user?._id || record.user) !== attendanceUserFilter) return false;
    if (attendanceTypeFilter && record.type !== attendanceTypeFilter) return false;
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

  // Exportar tiempos de asistencia a Excel
  const exportTiemposToExcel = () => {
    const data = tiemposPorUsuario.map(item => {
      let horas = 0;
      if (item.in && item.out) {
        const diffMs = new Date(item.out) - new Date(item.in);
        horas = diffMs / (1000 * 60 * 60);
      }
      const precio = item.user?.subRole?.price || 0;
      const extraPrice = item.user?.subRole?.extraPrice || 0;
      const isExtraDay = extraDaySelections[`${item.user?._id}-${item.fecha}`] || false;
      const precioFinal = isExtraDay ? precio + extraPrice : precio;
      const total = (horas * precioFinal).toFixed(2);

      return {
        Usuario: item.user
          ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || 'Sin nombre'
          : 'Sin usuario',
        Fecha: item.fecha,
        Ingreso: item.in ? new Date(item.in).toLocaleTimeString() : '—',
        Egreso: item.out ? new Date(item.out).toLocaleTimeString() : '—',
        'Tiempo Total': item.tiempo,
        'Precio por hora': precio,
        'Día Extra': isExtraDay ? 'Sí' : 'No',
        'Precio Extra': extraPrice,
        Total: item.in && item.out ? total : '—'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tiempos de Asistencia');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'liquidacion_asistencia.xlsx');
  };

  function getLocalDateString(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function getLocalDateTimeLocal(date) {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  // Eliminar registro de asistencia
  const handleDeleteAttendance = async (attendanceId) => {

  if (!window.confirm('¿Estás seguro de eliminar este registro de asistencia?')) return;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/api/attendance/${attendanceId}`, {
      headers: { 'x-auth-token': token }
    });
    // Actualiza la lista después de eliminar
    setAttendanceRecords(prev => prev.filter(r => r._id !== attendanceId));
  } catch (err) {
    setError('Error al eliminar el registro de asistencia');
  }
};

  // Registrar salida basada en un registro de entrada
  const handleRegisterOut = async (inRecord) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/attendance/admin/${inRecord._id}/out`,
        { notes: 'Salida registrada manualmente por admin' },
        { headers: { 'x-auth-token': token } }
      );
      const newOut = res.data;

      // Inserta el nuevo registro en la lista para que aparezca en la grilla sin recargar
      setAttendanceRecords((prev) => [newOut, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar salida');
    }
  };

  // Calcular tiempos de asistencia por usuario y fecha
  function calcularTiempos(records) {
    // Agrupa por usuario y fecha
    const agrupados = {};

    records.forEach((rec) => {
      if (!rec.user) return;
      const userId = rec.user._id || rec.user;

      // Solo usar la fecha del registro de entrada para agrupar
      let fechaClave;
      if (rec.type === 'in' || rec.type === 'entrada') {
        //fechaClave = new Date(rec.timestamp || rec.createdAt);
        fechaClave = getLocalDateString(rec.timestamp || rec.createdAt);

      } else if (rec.type === 'out' || rec.type === 'salida') {
        // Busca si ya existe un 'in' para ese usuario ese día
        // Si no existe, usa la fecha del registro de salida (caso raro)
        fechaClave = null;
        const inRecord = records.find(r =>
          r.user && // <-- verifica que r.user exista
          (r.user._id || r.user) === userId &&
          (r.type === 'in' || r.type === 'entrada') &&
          //new Date(r.timestamp || r.createdAt).toISOString().slice(0, 10) === new Date(rec.timestamp || rec.createdAt).toISOString().slice(0, 10)
          getLocalDateString(r.timestamp || r.createdAt) === getLocalDateString(rec.timestamp || rec.createdAt)
        );
        if (inRecord) {
          //fechaClave = new Date(inRecord.timestamp || inRecord.createdAt).toISOString().slice(0, 10);
          fechaClave = getLocalDateString(inRecord.timestamp || inRecord.createdAt);

        } else {
          fechaClave = getLocalDateString(rec.timestamp || rec.createdAt);
        }
      }

      if (!fechaClave) return;

      // Aplica filtros
      if (userFilter && userId !== userFilter) return;
      if (dateFilter && fechaClave < dateFilter) return;
      if (dateFilterTo && fechaClave > dateFilterTo) return;

      const key = `${userId}-${fechaClave}`;
      if (!agrupados[key]) {
        agrupados[key] = {
          user: rec.user,
          fecha: fechaClave,
          in: null,
          out: null
        };
      }
      if (rec.type === 'in' || rec.type === 'entrada') {
        if (!agrupados[key].in || new Date(rec.timestamp || rec.createdAt) < new Date(agrupados[key].in)) {
          agrupados[key].in = rec.timestamp || rec.createdAt;
        }
      }
      if (rec.type === 'out' || rec.type === 'salida') {
        if (!agrupados[key].out || new Date(rec.timestamp || rec.createdAt) > new Date(agrupados[key].out)) {
          agrupados[key].out = rec.timestamp || rec.createdAt;
        }
      }
    });

    // Calcula el tiempo total
    return Object.values(agrupados).map((item) => {
      let tiempo = '';
      if (item.in && item.out) {
        const diffMs = new Date(item.out) - new Date(item.in);
        const horas = Math.floor(diffMs / (1000 * 60 * 60));
        const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
        tiempo = `${horas}h ${minutos}m`;
      } else {
        tiempo = 'Sin datos completos';
      }
      return {
        ...item,
        tiempo
      };
    });
  }

  const tiemposPorUsuario = calcularTiempos(attendanceRecords);

  return (
    <>
      <UserBar />
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
                    <Typography variant="h4">{attendanceStats.totalUsers}</Typography>
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
                    <Typography variant="h4">{attendanceStats.presentToday}</Typography>
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
                    <Typography variant="h4">{attendanceStats.lateToday}</Typography>
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
                    <Typography variant="h4">{(attendanceStats.totalUsers || 0)-(attendanceStats.presentToday || 0)}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de registros de asistencia */}
        <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Registros de Asistencia
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Fecha desde"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fecha hasta"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Usuario</InputLabel>
              <Select
                value={attendanceUserFilter}
                label="Usuario"
                onChange={(e) => setAttendanceUserFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.firstName} {u.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={attendanceTypeFilter}
                label="Tipo"
                onChange={(e) => setAttendanceTypeFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="in">Entrada</MenuItem>
                <MenuItem value="out">Salida</MenuItem>
              </Select>
            </FormControl>
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
                  <TableCell>Acciones</TableCell>
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
                    <TableCell>
                      {record.type === 'in' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleRegisterOut(record)}
                        >
                          Registrar salida
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => { setAttendanceToEdit(record); setOpenEditAttendance(true); }}
                      >
                        Editar
                      </Button>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => handleDeleteAttendance(record._id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tiempos de Asistencia por Usuario
          </Typography>
          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Fecha desde"
              type="date"
              size="small"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fecha hasta"
              type="date"
              size="small"
              value={dateFilterTo}
              onChange={(e) => setDateFilterTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Usuario</InputLabel>
              <Select
                value={userFilter}
                label="Usuario"
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.firstName} {u.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="success" onClick={exportTiemposToExcel}>
              Exportar a Excel
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Ingreso</TableCell>
                  <TableCell>Egreso</TableCell>
                  <TableCell>Tiempo Total</TableCell>
                  <TableCell>Precio por hora</TableCell>
                  <TableCell>Valor día extra</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tiemposPorUsuario.map((item, idx) => {
                  // AGREGA ESTE BLOQUE DE CALCULO:
                  let horas = 0;
                  if (item.in && item.out) {
                    const diffMs = new Date(item.out) - new Date(item.in);
                    horas = diffMs / (1000 * 60 * 60);
                  }
                  const precio = item.user?.subRole?.price || 0;
                  const extraPrice = item.user?.subRole?.extraPrice || 0;
                  const itemKey = `${item.user?._id}-${item.fecha}`;
                  const isExtraDay = extraDaySelections[itemKey] || false;
                  const precioFinal = isExtraDay ? precio + extraPrice : precio;
                  const total = (horas * precioFinal).toFixed(2);

                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        {item.user
                          ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || 'Sin nombre'
                          : 'Sin usuario'}
                      </TableCell>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>
                        {item.in ? new Date(item.in).toLocaleTimeString() : '—'}
                      </TableCell>
                      <TableCell>
                        {item.out ? new Date(item.out).toLocaleTimeString() : '—'}
                      </TableCell>
                      <TableCell>{item.tiempo}</TableCell>
                      {/* NUEVAS COLUMNAS */}
                      <TableCell>${precio}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={isExtraDay}
                          onChange={(e) => {
                            setExtraDaySelections(prev => ({
                              ...prev,
                              [itemKey]: e.target.checked
                            }));
                          }}
                          disabled={!item.in || !item.out}
                        />
                        {extraPrice > 0 && `$${extraPrice}`}
                      </TableCell>
                      <TableCell>
                        {item.in && item.out ? (
                          <Box>
                            <Typography variant="body2">
                              ${total}
                            </Typography>
                            {isExtraDay && (
                              <Typography variant="caption" color="success.main">
                                (Incluye extra: +${extraPrice}/h)
                              </Typography>
                            )}
                          </Box>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

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
        {/* Diálogo editar registro de asistencia */}
        <Dialog open={openEditAttendance} onClose={() => setOpenEditAttendance(false)}>
          <DialogTitle>Editar registro de asistencia</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 400, pt: 1 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={attendanceToEdit?.type || ''}
                  label="Tipo"
                  onChange={(e) => setAttendanceToEdit({ ...attendanceToEdit, type: e.target.value })}
                >
                  <MenuItem value="in">Entrada</MenuItem>
                  <MenuItem value="out">Salida</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notas"
                margin="normal"
                value={attendanceToEdit?.notes || ''}
                onChange={(e) => setAttendanceToEdit({ ...attendanceToEdit, notes: e.target.value })}
              />
              <TextField
                fullWidth
                label="Fecha y hora"
                type="datetime-local"
                margin="normal"
                value={attendanceToEdit ? getLocalDateTimeLocal(attendanceToEdit.timestamp || attendanceToEdit.createdAt) : ''}
                onChange={(e) => setAttendanceToEdit({ ...attendanceToEdit, timestamp: new Date(e.target.value).toISOString() })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditAttendance(false)}>Cancelar</Button>
            <Button onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`${API_URL}/api/attendance/${attendanceToEdit._id}`,
                  { type: attendanceToEdit.type, notes: attendanceToEdit.notes, timestamp: attendanceToEdit.timestamp },
                  { headers: { 'x-auth-token': token } }
                );
                const updated = res.data;
                setAttendanceRecords(prev => prev.map(r => r._id === updated._id ? updated : r));
                setOpenEditAttendance(false);
              } catch (err) {
                setError(err.response?.data?.message || 'Error al actualizar registro');
              }
            }} variant="contained">Guardar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminDashboard;