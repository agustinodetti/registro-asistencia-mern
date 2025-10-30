const express = require('express');
const { auth } = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const router = express.Router();

router.put('/', auth, profileController.editProfile);

module.exports = router;