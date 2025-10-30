const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Location = require('../models/Location');
const { isWithinRadius, isValidCoordinates } = require('../utils/geolocation');

// POST /api/attendance/register
exports.registerAttendance = async (req, res) => {
  const { type, notes, latitude, longitude } = req.body; // type: 'in' o 'out'

  try {
    // Obtener configuración del usuario
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario requiere validación de ubicación
    if (user.locationSettings?.requireLocationVerification) {
      // Validar que se proporcionaron coordenadas
      if (!latitude || !longitude) {
        return res.status(400).json({ 
          message: 'Se requieren coordenadas de ubicación para registrar asistencia' 
        });
      }
      // Validar que las coordenadas son válidas
      if (!isValidCoordinates(latitude, longitude)) {
        return res.status(400).json({ 
          message: 'Coordenadas de ubicación inválidas' 
        });
      }
      // Obtener ubicación permitida
      let allowedLocation;
      if (user.locationSettings?.allowedLocation) {
        allowedLocation = await Location.findById(user.locationSettings.allowedLocation);
      } else {
        allowedLocation = await Location.findOne({ isActive: true });
      }
      if (!allowedLocation) {
        return res.status(400).json({ 
          message: 'No hay ubicaciones permitidas configuradas' 
        });
      }
      // Verificar si está dentro del radio permitido
      const isWithin = isWithinRadius(
        latitude, 
        longitude, 
        allowedLocation.latitude, 
        allowedLocation.longitude, 
        allowedLocation.radius
      );
      if (!isWithin) {
        return res.status(400).json({ 
          message: 'Ubicación actual fuera del radio habilitado. Por favor intente nuevamente en proximidad al local' 
        });
      }
    }
    // Impide registrar doble ingreso o egreso seguido en un mismo dia
    const lastRecord = await Attendance.findOne({ user: req.user.id }).sort({ timestamp: -1 });
    if (lastRecord && lastRecord.type === type && lastRecord.timestamp.toDateString() === new Date().toDateString()) {
      return res.status(400).json({ 
        message: type === 'in' 
          ? 'Ya tienes un ingreso registrado' 
          : 'Debes registrar un ingreso primero' 
      });
    }
    // Obtener ubicación permitida para guardar en el registro
    let allowedLocation = null;
    if (user.locationSettings?.allowedLocation) {
      allowedLocation = await Location.findById(user.locationSettings.allowedLocation);
    } else {
      allowedLocation = await Location.findOne({ isActive: true });
    }
    const newRecord = new Attendance({
      user: req.user.id,
      type,
      notes,
      userLocation: latitude && longitude ? { latitude, longitude } : undefined,
      allowedLocation: allowedLocation ? {
        latitude: allowedLocation.latitude,
        longitude: allowedLocation.longitude,
        radius: allowedLocation.radius
      } : undefined
    });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar asistencia' });
  }
};

// GET /api/attendance/history
exports.getHistory = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(5);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener registros' });
  }
};

// DELETE /api/attendance/:id
exports.deleteAttendance = async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el registro' });
  }
};

// PUT /api/attendance/:id
exports.updateAttendance = async (req, res) => {
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
};

// POST /api/attendance/admin/:inId/out
exports.adminRegisterOut = async (req, res) => {
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
    const populated = await Attendance.findById(newRecord._id).populate({
      path: 'user',
      select: 'firstName lastName subRole',
      populate: { path: 'subRole', select: 'description price extraPrice' }
    });
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: 'Error al registrar salida', error: err.message });
  }
};

// POST /api/attendance/admin/manual
exports.adminManualAttendance = async (req, res) => {
  try {
    const { userId, type, timestamp, notes } = req.body;
    // Validaciones
    if (!userId || !type || !timestamp) {
      return res.status(400).json({ message: 'Faltan campos requeridos: userId, type, timestamp' });
    }
    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({ message: 'El tipo debe ser "in" o "out"' });
    }
    // Verificar que el usuario existe y es employee
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (user.role !== 'employee') {
      return res.status(400).json({ message: 'Solo se puede registrar asistencia para empleados' });
    }
    // Crear el registro
    const newRecord = await Attendance.create({
      user: userId,
      type,
      timestamp: new Date(timestamp),
      notes: notes || 'Registro manual por administrador'
    });
    // Devuelve el registro con el usuario populado
    const populated = await Attendance.findById(newRecord._id).populate({
      path: 'user',
      select: 'firstName lastName subRole',
      populate: { path: 'subRole', select: 'description price extraPrice' }
    });
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: 'Error al registrar asistencia manual', error: err.message });
  }
};
