const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const Attendance = require('./models/Attendance');
const path = require('path');
const User = require('./models/User');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['https://registro-asistencia-mern.onrender.com', 
    'http://localhost:3000']
}));
app.use(express.json());

const attendanceRoutes = require('./routes/attendance');

const startAutoOutJob = require('./utils/autoOutJob');
startAutoOutJob();

app.use('/api/attendance', attendanceRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/profile');
app.use('/api/profile', require('./routes/profile'));

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const subRoleRoutes = require('./routes/subRole');
app.use('/api/subroles', subRoleRoutes);

// Conexión a MongoDB Atlas 
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    // Inicia el proceso automático de salida
    require('./utils/autoOutJob')();
  })
  .catch(err => console.error('Error de conexión:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// --- SERVIR LOS ARCHIVOS ESTÁTICOS DE REACT ---
if (process.env.NODE_ENV === 'production') {
  // Sirve los archivos estáticos desde la carpeta "build" cuando esté en producción
  app.use(express.static(path.join(__dirname, 'build')));

  // Redirigir todas las rutas a index.html para que React maneje la navegación
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

