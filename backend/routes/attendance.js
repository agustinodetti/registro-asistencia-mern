const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');
const router = express.Router();

// POST /api/attendance/register - Registrar ingreso/egreso
router.post('/register', auth, attendanceController.registerAttendance);

// GET /api/attendance/history - Obtener historial del usuario
router.get('/history', auth, attendanceController.getHistory);

// DELETE /api/attendance/:id - Eliminar un registro de asistencia por ID (solo admin)
router.delete('/:id', auth, isAdmin, attendanceController.deleteAttendance);

// PUT /api/attendance/:id - Actualizar un registro de asistencia (solo admin)
router.put('/:id', auth, isAdmin, attendanceController.updateAttendance);

// POST /api/attendance/admin/:inId/out - Registrar salida basada en un registro de entrada (solo admin)
router.post('/admin/:inId/out', auth, isAdmin, attendanceController.adminRegisterOut);

// POST /api/attendance/admin/manual - Registrar asistencia manualmente (solo admin)
router.post('/admin/manual', auth, isAdmin, attendanceController.adminManualAttendance);

module.exports = router;