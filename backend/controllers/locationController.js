const Location = require('../models/Location');

exports.test = (req, res) => {
  res.json({ message: 'Rutas de ubicación funcionando correctamente' });
};

exports.getActive = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).select('name latitude longitude radius');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getAll = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const locations = await Location.find().sort({ createdAt: -1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.create = async (req, res) => {
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
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.update = async (req, res) => {
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
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.delete = async (req, res) => {
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
    res.status(500).json({ message: 'Error del servidor' });
  }
};
