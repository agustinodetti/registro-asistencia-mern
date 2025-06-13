import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, CheckIcon, XIcon } from '@heroicons/react/outline';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Obtener historial al cargar el componente (GET /api/attendance/history)
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/attendance/history', {
          headers: { 'x-auth-token': token }
        });
        setRecords(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        setError('Error al cargar historial');
      }
    };
    fetchRecords();
  }, []);

  // Registrar ingreso/egreso (POST /api/attendance/register)
  const handleAttendance = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/attendance/register',
        { type, notes },
        { headers: { 'x-auth-token': token } }
      );
      
      // Actualizar el estado local con el nuevo registro
      setRecords([res.data, ...records.slice(0, 4)]); // Actualiza el historial
      setNotes(''); // Limpia el campo de notas
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar');
    }
  };

  // Formatear fecha
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold mb-4 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2" />
          Registro de Asistencia
        </h1>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => handleAttendance('in')}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center"
          >
            <CheckIcon className="h-5 w-5 mr-1" />
            Ingresé
          </button>
          <button
            onClick={() => handleAttendance('out')}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 flex items-center justify-center"
          >
            <XIcon className="h-5 w-5 mr-1" />
            Salí
          </button>
        </div>

        {/* Campo de notas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="2"
            placeholder="Ej: 'Salí por reunión externa'"
          />
        </div>

        {/* Historial */}
        <div>
          <h2 className="font-semibold mb-2">Últimos registros:</h2>
          <ul className="space-y-2">
            {records.map((record) => (
              <li key={record._id} className="border-b pb-2">
                <p className="font-medium">
                  {record.type === 'in' ? '🟢 Ingreso' : '🔴 Egreso'}
                </p>
                <p className="text-sm text-gray-600">{formatDate(record.timestamp)}</p>
                {record.notes && <p className="text-sm mt-1">📝 {record.notes}</p>}
              </li>
            ))}
            {records.length === 0 && (
              <li className="text-gray-500">No hay registros recientes</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Attendance;