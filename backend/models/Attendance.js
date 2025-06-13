const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['in', 'out'], required: true }, // 'in' = ingreso, 'out' = egreso
  timestamp: { type: Date, default: Date.now },
  notes: { type: String } // Opcional: comentarios del empleado
});

module.exports = mongoose.model('Attendance', AttendanceSchema);