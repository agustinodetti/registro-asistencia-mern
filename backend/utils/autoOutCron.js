require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Copia la lógica de tu función autoOutJob aquí
async function runAutoOutJob() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    await mongoose.connect(process.env.MONGODB_URI);

    const users = await User.find();
    for (const user of users) {
        const inRecord = await Attendance.findOne({
            user: user._id,
            type: 'in',
            timestamp: { $gte: today, $lt: tomorrow }
        }).sort({ timestamp: -1 });

        if (inRecord) {
            const outRecord = await Attendance.findOne({
                user: user._id,
                type: 'out',
                timestamp: { $gte: inRecord.timestamp, $lt: tomorrow }
            });

            if (!outRecord) {
                const outDate = new Date(today);
                outDate.setHours(23, 59, 0, 0);
                await Attendance.create({
                    user: user._id,
                    type: 'out',
                    timestamp: outDate,
                    notes: 'Salida automática por olvido'
                });
            }
        }
    }
    console.log('Salidas automáticas procesadas');
    await mongoose.disconnect();
}

runAutoOutJob().then(() => process.exit(0));