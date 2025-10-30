const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const subRoleController = require('../controllers/subRoleController');
const router = express.Router();

router.post('/', auth, isAdmin, subRoleController.create);
router.get('/', auth, isAdmin, subRoleController.getAll);
router.get('/:id', auth, isAdmin, subRoleController.getOne);
router.put('/:id', auth, isAdmin, subRoleController.update);
router.delete('/:id', auth, isAdmin, subRoleController.delete);

module.exports = router;