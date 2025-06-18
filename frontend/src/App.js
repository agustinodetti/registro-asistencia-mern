import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // Opcional: si tienes página de registro
import Attendance from './pages/employee/Attendance';
import AdminDashboard from './pages/admin/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import SubRoles from './pages/admin/SubRoles';
import Users from './pages/admin/Users';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  {/* Ruta principal mostrará Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/employee/attendance" element={<Attendance />} />
        <Route path="/admin/subroles" element={<SubRoles />} />
        <Route path="/admin/users" element={<Users />} />
        {/* Puedes agregar más rutas aquí según sea necesario */}
      </Routes>
    </Router>
  );
}

export default App;