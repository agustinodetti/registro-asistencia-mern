import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles'; // 👈 acceso al theme

const UserBar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme(); // 👈 usamos el theme

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

  const isEmployeeAttendance =
    location.pathname === '/employee/attendance' ||
    location.pathname.startsWith('/admin/attendance');

  return (
    <AppBar
      position="static"
      sx={{
        mb: 4,
        background: theme.palette.primary.main,
        boxShadow: `0 4px 10px ${theme.palette.secondary.main}`,
        //borderRadius: 2,
      }}
    >
      <Toolbar>
        {role === 'admin' && !isEmployeeAttendance && (
          <>
            <Button
              component={Link}
              to="/admin/dashboard"
              sx={{
                color: theme.palette.terciary.main,
                fontWeight: 500,
                '&:hover': {
                  color: theme.palette.terciary.light,
                },
              }}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              to="/admin/users"
              sx={{
                color: theme.palette.terciary.main,
                fontWeight: 500,
                '&:hover': {
                  color: theme.palette.terciary.light,
                },
              }}
            >
              Usuarios
            </Button>
            <Button
              component={Link}
              to="/admin/subroles"
              sx={{
                color: theme.palette.terciary.main,
                fontWeight: 500,
                '&:hover': {
                  color: theme.palette.terciary.light,
                },
              }}
            >
              SubRoles
            </Button>
          </>
        )}

        {role === 'employee' && (
          <Button
            component={Link}
            to="/employee/attendance"
            sx={{
              color: theme.palette.terciary.main,
              fontWeight: 500,
              '&:hover': {
                color: theme.palette.terciary.light,
              },
            }}
          >
            Registro asistencia
          </Button>
        )}

        <div style={{ flexGrow: 1 }} />

        <Tooltip title="Cuenta">
          <IconButton
            onClick={handleMenuOpen}
            size="large"
            sx={{
              color: theme.palette.terciary.main,
              '&:hover': {
                color: theme.palette.terciary.light,
              },
            }}
          >
            <AccountCircleIcon />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(137, 33, 33, 0.15)',
            },
          }}
        >
          <MenuItem onClick={handleEditProfile}>Editar perfil</MenuItem>
          <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default UserBar;
