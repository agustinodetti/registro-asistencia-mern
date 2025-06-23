import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, CircularProgress, Alert, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, MenuItem, Select, InputLabel, FormControl, Typography, AppBar, Toolbar} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const Users = () => {
  // Estados y funciones relacionados con usuarios
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [subRoles, setSubRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchSubRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { 'x-auth-token': token }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

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

  const handleUserSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = currentUser?._id
        ? `http://localhost:5000/api/admin/users/${currentUser._id}`
        : 'http://localhost:5000/api/admin/users';
      const method = currentUser?._id ? 'put' : 'post';

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

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Menú de navegación */}
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
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Gestión de Usuarios
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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
      </Box>
    </>
  );
};

export default Users;