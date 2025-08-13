const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const router = express.Router();

// POST /api/attendance/register - Registrar ingreso/egreso
router.post('/register', auth, async (req, res) => {
  const { type, notes } = req.body; // type: 'in' o 'out'

  try {
    const lastRecord = await Attendance.findOne({ user: req.user.id }).sort({ timestamp: -1 });
    
    if (lastRecord && lastRecord.type === type) {
      return res.status(400).json({ 
        message: type === 'in' 
          ? 'Ya tienes un ingreso registrado' 
          : 'Debes registrar un ingreso primero' 
      });
    }

    const newRecord = new Attendance({
      user: req.user.id,
      type,
      notes
    });

    await newRecord.save();
    res.status(201).json(newRecord);

  } catch (err) {
    res.status(500).json({ message: 'Error al registrar asistencia' });
  }
});


// GET /api/attendance/history - Obtener historial del usuario
router.get('/history', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(5);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener registros' });
  }
});

// DELETE /api/attendance/:id - Eliminar un registro de asistencia por ID (solo admin)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el registro' });
  }
});

// PUT /api/attendance/:id - Actualizar un registro de asistencia (solo admin)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { notes, type, timestamp } = req.body || {};

    const update = {};
    if (typeof notes === 'string') update.notes = notes;
    if (type && ['in', 'out'].includes(type)) update.type = type;
    if (timestamp) update.timestamp = new Date(timestamp);

    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    const populated = await Attendance.findById(updated._id).populate({
      path: 'user',
      select: 'firstName lastName subRole',
      populate: { path: 'subRole', select: 'description price extraPrice' }
    });

    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: 'Error al actualizar el registro', error: err.message });
  }
});

// POST /api/attendance/admin/:inId/out - Registrar salida basada en un registro de entrada (solo admin)
router.post('/admin/:inId/out', auth, isAdmin, async (req, res) => {
  try {
    const { inId } = req.params;
    const { notes } = req.body || {};

    const inRecord = await Attendance.findById(inId);
    if (!inRecord) {
      return res.status(404).json({ message: 'Registro de entrada no encontrado' });
    }
    if (inRecord.type !== 'in') {
      return res.status(400).json({ message: 'El registro base no es de tipo entrada' });
    }

    const dayStart = new Date(inRecord.timestamp);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(inRecord.timestamp);
    dayEnd.setHours(23, 59, 59, 999);

    const existingOut = await Attendance.findOne({
      user: inRecord.user,
      type: 'out',
      timestamp: { $gte: inRecord.timestamp, $lte: dayEnd }
    });

    if (existingOut) {
      return res.status(400).json({ message: 'Ya existe un egreso para este usuario en el mismo día' });
    }

    const newRecord = await Attendance.create({
      user: inRecord.user,
      type: 'out',
      timestamp: new Date(),
      notes: notes || 'Salida registrada por administrador'
    });

    // Devuelve el registro con el usuario populado para que el frontend pueda mostrar el nombre
    const populated = await Attendance.findById(newRecord._id).populate({
      path: 'user',
      select: 'firstName lastName subRole',
      populate: { path: 'subRole', select: 'description price extraPrice' }
    });

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: 'Error al registrar salida', error: err.message });
  }
});

module.exports = router;