import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box
} from '@mui/material';

const SubRoles = () => {
  const [subRoles, setSubRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ description: '', price: '' });

  const fetchSubRoles = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/subroles', {
      headers: { 'x-auth-token': token }
    });
    setSubRoles(res.data);
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
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Gestión de SubRoles</h2>
        <Button variant="contained" onClick={() => handleOpen()}>Nuevo SubRole</Button>
      </Box>
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
                <Button size="small" onClick={() => handleOpen(sr)}>Editar</Button>
                <Button size="small" color="error" onClick={() => handleDelete(sr._id)}>Eliminar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editing ? 'Editar SubRole' : 'Nuevo SubRole'}</DialogTitle>
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
  );
};

export default SubRoles;