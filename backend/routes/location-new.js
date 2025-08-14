const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Location = require('../models/Location');

// Ruta de prueba simple
router.get('/test', (req, res) => {
  res.json({ message: 'Rutas de ubicación funcionando correctamente' });
});

// Obtener ubicaciones activas (para empleados)
router.get('/active', auth, async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).select('name latitude longitude radius');
    res.json(locations);
  } catch (err) {
    console.error('Error en /active:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener todas las ubicaciones (solo admin)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const locations = await Location.find().sort({ createdAt: -1 });
    res.json(locations);
  } catch (err) {
    console.error('Error en /:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Crear nueva ubicación (solo admin)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { name, latitude, longitude, radius } = req.body;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const location = new Location({
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: radius ? parseFloat(radius) : 20
    });

    await location.save();
    res.status(201).json(location);
  } catch (err) {
    console.error('Error en POST /:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar ubicación (solo admin)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { name, latitude, longitude, radius, isActive } = req.body;

    const location = await Location.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(latitude && { latitude: parseFloat(latitude) }),
        ...(longitude && { longitude: parseFloat(longitude) }),
        ...(radius && { radius: parseFloat(radius) }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }

    res.json(location);
  } catch (err) {
    console.error('Error en PUT /:id:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar ubicación (solo admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }

    res.json({ message: 'Ubicación eliminada correctamente' });
  } catch (err) {
    console.error('Error en DELETE /:id:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
