const User = require('../models/User'); 
const Attendance = require('../models/Attendance'); // Agrega esta línea al inicio

exports.getUsers = async (req, res) => {
    try {
    const users = await User.find({}, 'email role lastLogin createdAt firstName lastName subRole').populate('subRole');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};



exports.getStats = async (req, res) => {
    try {
      //const totalUsers = await User.countDocuments();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const cutoff = new Date(today);
      cutoff.setHours(8, 0, 0, 0); // 08:00
  
      const stats = {
        totalUsers: await User.countDocuments({ 
          role: 'employee'
        }),
        presentToday: await Attendance.countDocuments({ 
          type: 'in', 
          timestamp: { $gte: today } 
        }),
        lateToday: await Attendance.countDocuments({
          type: 'in',
          timestamp: { 
            $gte: cutoff,
            $lt: tomorrow
          }
        })
      };
  
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: 'Error al calcular estadísticas' });
    }
  };    

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
        .populate({
          path: 'user',
          select: 'firstName lastName subRole',
          populate: { path: 'subRole', select: 'description price extraPrice' }
        });
      res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener registros de asistencia' });
    }   
};
