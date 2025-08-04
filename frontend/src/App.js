import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // Opcional: si tienes página de registro
import Attendance from './pages/employee/Attendance';
import AdminDashboard from './pages/admin/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import SubRoles from './pages/admin/SubRoles';
import Users from './pages/admin/Users';
import Profile from './pages/Profile';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />  {/* Ruta principal mostrará Login */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/employee/attendance" element={<Attendance />} />
            <Route path="/admin/subroles" element={<SubRoles />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
            {/* Puedes agregar más rutas aquí según sea necesario */}
          </Routes>
        </Router>
    </ThemeProvider>
  );
}

export default App;