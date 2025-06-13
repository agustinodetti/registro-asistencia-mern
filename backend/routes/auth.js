const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Ruta de Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    // 2. Validar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    // 3. Generar token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta de Registro (POST /api/auth/register)
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Validar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Crear nuevo usuario
    const newUser = new User({
      email,
      password, // Se encriptará automáticamente gracias al "pre-save" en el modelo
      role: role || 'employee' // Si no se especifica, será 'employee'
    });

    await newUser.save();

    // Generar token JWT para auto-login después del registro
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, role: newUser.role });

  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

module.exports = router;

