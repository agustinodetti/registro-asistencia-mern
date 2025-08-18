const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const Attendance = require('./models/Attendance');
const User = require('./models/User');
const initDefaultLocation = require('./utils/initDefaultLocation');
require('dotenv').config();

const app = express();

// CORS FUNCIONANDO 
// app.use(cors({
//   origin: ['https://registro-asistencia-mern.onrender.com', 
//     'http://localhost:5000']
// }));

// CORS FUNCIONANDO + NUEVA CONFIG PARA PERMITIR ORÍGENES ESPECÍFICOS.
const allowedOrigins = [
  'https://registro-asistencia-mern.onrender.com',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('Solicitud desde:', origin); // 👈 importante para el test
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  }
}));

app.use(express.json());

// Rutas básicas primero
const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/profile');
app.use('/api/profile', require('./routes/profile'));

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const subRoleRoutes = require('./routes/subRole');
app.use('/api/subroles', subRoleRoutes);

// Rutas de ubicación al final
try {
  const locationRoutes = require('./routes/location');
  app.use('/api/locations', locationRoutes);
  console.log('✅ Rutas de ubicación cargadas correctamente');
} catch (error) {
  console.error('❌ Error al cargar rutas de ubicación:', error);
}

const startAutoOutJob = require('./utils/autoOutJob');
startAutoOutJob();

// Conexión a MongoDB Atlas 
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Conectado a MongoDB');
    // Inicializar ubicación por defecto
    await initDefaultLocation();
    // Inicia el proceso automático de salida
    require('./utils/autoOutJob')();
  })
  .catch(err => console.error('Error de conexión:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

