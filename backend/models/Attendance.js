const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);