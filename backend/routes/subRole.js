const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const SubRole = require('../models/SubRole');

// Crear SubRole
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { description, price } = req.body;
    const subRole = new SubRole({ description, price });
    await subRole.save();
    res.status(201).json(subRole);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear SubRole' });
  }
});

// Listar todos los SubRoles
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const subRoles = await SubRole.find();
    res.json(subRoles);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener SubRoles' });
  }
});

// Obtener un SubRole por ID
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const subRole = await SubRole.findById(req.params.id);
    if (!subRole) return res.status(404).json({ message: 'SubRole no encontrado' });
    res.json(subRole);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener SubRole' });
  }
});

// Actualizar un SubRole
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { description, price } = req.body;
    const subRole = await SubRole.findByIdAndUpdate(
      req.params.id,
      { description, price },
      { new: true }
    );
    if (!subRole) return res.status(404).json({ message: 'SubRole no encontrado' });
    res.json(subRole);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar SubRole' });
  }
});

// Eliminar un SubRole
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const subRole = await SubRole.findByIdAndDelete(req.params.id);
    if (!subRole) return res.status(404).json({ message: 'SubRole no encontrado' });
    res.json({ message: 'SubRole eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar SubRole' });
  }
});

module.exports = router;