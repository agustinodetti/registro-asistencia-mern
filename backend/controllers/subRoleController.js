const SubRole = require('../models/SubRole');

exports.create = async (req, res) => {
  try {
    const { description, price, extraPrice } = req.body;
    const subRole = new SubRole({ description, price, extraPrice });
    await subRole.save();
    res.status(201).json(subRole);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear SubRole' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const subRoles = await SubRole.find();
    res.json(subRoles);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener SubRoles' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const subRole = await SubRole.findById(req.params.id);
    if (!subRole) return res.status(404).json({ message: 'SubRole no encontrado' });
    res.json(subRole);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener SubRole' });
  }
};

exports.update = async (req, res) => {
  try {
    const { description, price, extraPrice } = req.body;
    const subRole = await SubRole.findByIdAndUpdate(
      req.params.id,
      { description, price, extraPrice },
      { new: true }
    );
    if (!subRole) return res.status(404).json({ message: 'SubRole no encontrado' });
    res.json(subRole);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar SubRole' });
  }
};

exports.delete = async (req, res) => {
  try {
    const subRole = await SubRole.findByIdAndDelete(req.params.id);
    if (!subRole) return res.status(404).json({ message: 'SubRole no encontrado' });
    res.json({ message: 'SubRole eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar SubRole' });
  }
};
