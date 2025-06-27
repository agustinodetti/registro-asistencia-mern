const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const attendanceRoutes = require('./routes/attendance');
// Después de app.use(express.json());
app.use('/api/attendance', attendanceRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/profile');
app.use('/api/profile', require('./routes/profile'));

const adminRoutes = require('./routes/admin'); 
app.use('/api/admin', adminRoutes);

const subRoleRoutes = require('./routes/subRole');
app.use('/api/subroles', subRoleRoutes);

// Conexión a MongoDB Atlas (reemplaza <password> con tu contraseña)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

