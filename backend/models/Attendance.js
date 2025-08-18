const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now },
  // Coordenadas del usuario al momento del registro
  userLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  // Ubicación permitida utilizada para la validación
  allowedLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    radius: { type: Number } // en metros
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);