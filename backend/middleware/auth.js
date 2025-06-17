const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Busca el token en x-auth-token o en Authorization (Bearer)
  let token = req.header('x-auth-token');
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }
  }
  console.log('Token recibido:', token); // Para depuración

  if (!token) return res.status(401).json({ message: 'Acceso denegado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token inválido' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Requiere rol de administrador' });
  }
  next();
};

module.exports = { auth, isAdmin };