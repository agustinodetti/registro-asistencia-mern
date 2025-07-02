const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

function startAutoOutJob() {
    // Tarea diaria a las 12:35
    cron.schedule('35 12 * * *', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

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
        console.log(`Fecha de ejecución: ${today.toISOString()}`);
    });
}

module.exports = startAutoOutJob;