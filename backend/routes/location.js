const express = require('express');
const { auth } = require('../middleware/auth');
const locationController = require('../controllers/locationController');
const router = express.Router();

router.get('/test', locationController.test);
router.get('/active', auth, locationController.getActive);
router.get('/', auth, locationController.getAll);
router.post('/', auth, locationController.create);
router.put('/:id', auth, locationController.update);
router.delete('/:id', auth, locationController.delete);

module.exports = router;
