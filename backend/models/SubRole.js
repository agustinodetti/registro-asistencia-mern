const mongoose = require('mongoose');

const SubRoleSchema = new mongoose.Schema({
  description: { type: String, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('SubRole', SubRoleSchema);