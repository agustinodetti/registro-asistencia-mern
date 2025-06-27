const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User'); 
const Attendance = require('../models/Attendance'); // Agrega esta línea al inicio

// GET /api/admin/users - Listar usuarios
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'email role lastLogin createdAt firstName lastName subRole').populate('subRole');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// GET /api/admin/stats - Estadísticas
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const todayStart = new Date().setHours(0, 0, 0, 0);

    const stats = {
      totalUsers,
      presentToday: await Attendance.countDocuments({ 
        type: 'in', 
        timestamp: { $gte: todayStart } 
      }),
      lateToday: await Attendance.countDocuments({
        type: 'in',
        timestamp: { 
          $gte: todayStart,
          $lt: new Date().setHours(10, 0, 0, 0) // Llegadas después de 10 AM
        }
      })
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error al calcular estadísticas' });
  }
});

// POST /api/admin/users - Crear usuario
router.post('/users', auth, isAdmin, async (req, res) => {
  const { email, password, role, firstName, lastName, subRole } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const newUser = new User({ email, password, role, firstName, lastName, subRole });
    await newUser.save();

    res.status(201).json({ 
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      subRole: newUser.subRole
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear usuario' });
  }
});

// PUT /api/admin/users/:id - Actualizar usuario
router.put('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.subRole = req.body.subRole || user.subRole;
    if (req.body.password) user.password = req.body.password;


    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

// DELETE /api/admin/users/:id - Eliminar usuario
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'No se puede eliminar un admin' });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

// // GET /api/admin/attendance - Listar todos los registros de asistencia
// router.get('/attendance', auth, isAdmin, async (req, res) => {
//   try {
//     const records = await Attendance.find().populate('user', 'firstName lastName');
//     res.json(records);
//   } catch (err) {
//     res.status(500).json({ message: 'Error al obtener registros de asistencia' });
//   }
// });

// GET /api/admin/attendance - Listar todos los registros de asistencia
router.get('/attendance', auth, isAdmin, async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate({
        path: 'user',
        select: 'firstName lastName subRole',
        populate: { path: 'subRole', select: 'description price' }
      });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener registros de asistencia' });
  }
});

module.exports = router;