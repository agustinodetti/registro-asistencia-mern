const express = require('express');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', auth, authController.getMe);

module.exports = router;

