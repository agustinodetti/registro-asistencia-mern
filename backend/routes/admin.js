const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// GET /api/admin/users - Listar usuarios
router.get('/users', auth, isAdmin, adminController.getUsers);

// GET /api/admin/stats - Estadísticas
router.get('/stats', auth, isAdmin, adminController.getStats);

// POST /api/admin/users - Crear usuario
router.post('/users', auth, isAdmin, adminController.createUser);

// PUT /api/admin/users/:id - Actualizar usuario
router.put('/users/:id', auth, isAdmin, adminController.updateUser);

// DELETE /api/admin/users/:id - Eliminar usuario
router.delete('/users/:id', auth, isAdmin, adminController.deleteUser);

// GET /api/admin/attendance - Listar todos los registros de asistencia
router.get('/attendance', auth, isAdmin, adminController.getAttendance);

module.exports = router;