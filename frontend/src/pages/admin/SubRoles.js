import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import { Link } from 'react-router-dom';
import UserBar from '../../components/UserBar';


const SubRoles = () => {
  const [subRoles, setSubRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ description: '', price: '' });
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [searchTerm, setSearchTerm] = useState('');



  const fetchSubRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/subroles', {
        headers: { 'x-auth-token': token }
      });
      setSubRoles(res.data);
    } catch (err) {
      setError('Error al obtener subroles');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubRoles();
  }, []);

  const handleOpen = (subRole = null) => {
    setEditing(subRole);
    setForm(subRole ? { description: subRole.description, price: subRole.price } : { description: '', price: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({ description: '', price: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (editing) {
      await axios.put(`http://localhost:5000/api/subroles/${editing._id}`, form, {
        headers: { 'x-auth-token': token }
      });
    } else {
      await axios.post('http://localhost:5000/api/subroles', form, {
        headers: { 'x-auth-token': token }
      });
    }
    fetchSubRoles();
    handleClose();
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/subroles/${id}`, {
      headers: { 'x-auth-token': token }
    });
    fetchSubRoles();
  };

  return (
    <>
      {/* Menú de navegación */}
      <UserBar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Gestión de SubRoles
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <TextField
              variant="outlined"
              placeholder="Buscar subroles..."
              size="small"
              InputProps={{ startAdornment: <SearchIcon /> }}
              sx={{ width: 300 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Nuevo SubRol
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Precio por hora</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subRoles.map((sr) => (
                    <TableRow key={sr._id}>
                      <TableCell>{sr.description}</TableCell>
                      <TableCell>${sr.price}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleOpen(sr)}
                          sx={{ mr: 1 }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(sr._id)}
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

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{editing ? 'Editar SubRol' : 'Nuevo SubRol'}</DialogTitle>
            <DialogContent>
              <TextField
                label="Descripción"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Precio por hora"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSubmit} variant="contained">
                Guardar
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </>
  );
};

export default SubRoles;