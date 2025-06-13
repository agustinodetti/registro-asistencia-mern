const express = require('express');
const { auth } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const router = express.Router();

// POST /api/attendance/register - Registrar ingreso/egreso
router.post('/register', auth, async (req, res) => {
  const { type, notes } = req.body; // type: 'in' o 'out'

  try {
    const lastRecord = await Attendance.findOne({ userId: req.user.id }).sort({ timestamp: -1 });
    
    if (lastRecord && lastRecord.type === type) {
      return res.status(400).json({ 
        message: type === 'in' 
          ? 'Ya tienes un ingreso registrado' 
          : 'Debes registrar un ingreso primero' 
      });
    }

    const newRecord = new Attendance({
      userId: req.user.id,
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
    const records = await Attendance.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(5);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener registros' });
  }
});

module.exports = router;