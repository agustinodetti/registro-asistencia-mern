import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/employees', {
          headers: { 'x-auth-token': token }
        });
        setEmployees(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Administrador</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta de resumen */}
        <div className="bg-white p-4 rounded shadow">
          <h3>Total Empleados</h3>
          <p>{employees.length}</p>
        </div>
      </div>

      {/* Lista de empleados */}
      <table className="mt-6 w-full">
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((user) => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;