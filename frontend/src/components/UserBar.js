import React, { useState } from 'react';
import { AppBar, Toolbar, Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const UserBar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtén el rol del usuario desde localStorage
  const role = localStorage.getItem('role');


  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEditProfile = () => {
    setAnchorEl(null);
    navigate('/profile'); 
  };

  const handleLogout = () => {
    setAnchorEl(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Oculta los links de admin si estamos en la página de asistencia de empleado
  const isEmployeeAttendance = location.pathname === '/employee/attendance' || location.pathname === '/profile' || location.pathname.startsWith('/admin/attendance');

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        {role === 'admin' && (
          <>
            <Button color="inherit" component={Link} to="/admin/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/admin/users">
              Usuarios
            </Button>
            <Button color="inherit" component={Link} to="/admin/subroles">
              SubRoles
            </Button>
          </>
        )}
        {role === 'employee' && (
          <>
            <Button color="inherit" component={Link} to="/employee/attendance">
              Registro asistencia
            </Button>
          </>
        )}
        <div style={{ flexGrow: 1 }} />
        <Tooltip title="Cuenta">
          <IconButton color="inherit" onClick={handleMenuOpen} size="large">
            <AccountCircleIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleEditProfile}>Editar perfil</MenuItem>
          <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default UserBar;